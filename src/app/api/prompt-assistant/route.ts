import { NextRequest, NextResponse } from 'next/server';
import { normalizeOpenAICompatibleBaseUrl } from '@/lib/api-base-url';
import { verifyAdminUnlockToken } from '@/lib/admin-auth';
import OpenAI from 'openai';

type AssistantMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type PromptAssistantRequest = {
    action?: 'chat' | 'summarize';
    apiBaseUrl?: string;
    apiKey?: string;
    adminUnlockToken?: string;
    model?: string;
    messages?: AssistantMessage[];
    currentPrompt?: string;
    imageModel?: string;
    size?: string;
    quality?: string;
    background?: string;
    outputFormat?: string;
};

const DEFAULT_ASSISTANT_MODEL = process.env.OPENAI_ASSISTANT_MODEL || 'gpt-4o-mini';
const MAX_MESSAGES = 24;
const MAX_MESSAGE_CHARS = 3000;
const MAX_SUMMARY_MESSAGES = 12;
const MAX_SUMMARY_MESSAGE_CHARS = 1200;

function looksLikeImageModel(modelId: string) {
    return /image|dall[-_]?e|flux|sdxl|stable|imagen|midjourney|mj-|gpt-image/i.test(modelId);
}

function normalizeMessages(messages: unknown): AssistantMessage[] {
    if (!Array.isArray(messages)) return [];

    return messages
        .filter((message): message is AssistantMessage => {
            if (!message || typeof message !== 'object') return false;
            const candidate = message as Partial<AssistantMessage>;
            return (
                (candidate.role === 'user' || candidate.role === 'assistant') &&
                typeof candidate.content === 'string' &&
                candidate.content.trim().length > 0
            );
        })
        .slice(-MAX_MESSAGES)
        .map((message) => ({
            role: message.role,
            content: message.content.trim().slice(0, MAX_MESSAGE_CHARS)
        }));
}

function createOpenAIClient(body: PromptAssistantRequest) {
    const apiKey = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : process.env.OPENAI_API_KEY;
    const canOverrideApiBaseUrl = verifyAdminUnlockToken(body.adminUnlockToken);
    const baseURL = canOverrideApiBaseUrl
        ? normalizeOpenAICompatibleBaseUrl(body.apiBaseUrl) || process.env.OPENAI_API_BASE_URL
        : process.env.OPENAI_API_BASE_URL;

    if (!apiKey) {
        throw Object.assign(new Error('Missing API Key / SK. Please fill it in the API Connection panel.'), {
            status: 400
        });
    }

    return new OpenAI({
        apiKey,
        baseURL
    });
}

function getTextFromCompletion(completion: OpenAI.Chat.Completions.ChatCompletion): string {
    const content = completion.choices[0]?.message?.content;
    if (typeof content === 'string') {
        return content.trim();
    }

    return '';
}

function parseJsonObject(content: string): Record<string, unknown> | null {
    const withoutFence = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

    try {
        return JSON.parse(withoutFence) as Record<string, unknown>;
    } catch {
        const match = withoutFence.match(/\{[\s\S]*\}/);
        if (!match) return null;

        try {
            return JSON.parse(match[0]) as Record<string, unknown>;
        } catch {
            return null;
        }
    }
}

function readString(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function buildContext(body: PromptAssistantRequest) {
    return [
        `Current user prompt: ${body.currentPrompt?.trim() || '(empty)'}`,
        `Image model: ${body.imageModel || 'unknown'}`,
        `Size: ${body.size || 'auto'}`,
        `Quality: ${body.quality || 'auto'}`,
        `Background: ${body.background || 'auto'}`,
        `Output format: ${body.outputFormat || 'png'}`
    ].join('\n');
}

function compactMessagesForSummary(messages: AssistantMessage[]) {
    return messages.slice(-MAX_SUMMARY_MESSAGES).map((message) => ({
        role: message.role,
        content: message.content.slice(0, MAX_SUMMARY_MESSAGE_CHARS)
    }));
}

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as PromptAssistantRequest;
        const action = body.action === 'summarize' ? 'summarize' : 'chat';
        const model = body.model?.trim() || DEFAULT_ASSISTANT_MODEL;
        const messages = normalizeMessages(body.messages);

        if (looksLikeImageModel(model)) {
            return NextResponse.json(
                { ok: false, error: '当前选择的是生图模型，不能用于需求分析。请在语言模型下拉框选择聊天/文本模型。' },
                { status: 400 }
            );
        }

        if (!messages.length && !body.currentPrompt?.trim()) {
            return NextResponse.json(
                { ok: false, error: 'Please enter a prompt or send at least one requirement message first.' },
                { status: 400 }
            );
        }

        const client = createOpenAIClient(body);

        if (action === 'summarize') {
            const completion = await client.chat.completions.create({
                model,
                temperature: 0.35,
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a senior image prompt director. Think carefully internally, but never reveal hidden chain-of-thought. Return only valid JSON with concise, user-facing fields.'
                    },
                    ...compactMessagesForSummary(messages),
                    {
                        role: 'user',
                        content: `Summarize the image requirements from the conversation and current settings into a final image-generation prompt.

${buildContext(body)}

Return JSON only:
{
  "requirementSummary": "A concise Chinese summary of subject, style, composition, mood, lighting, details, constraints, and any unresolved assumptions.",
  "finalPrompt": "A polished final prompt for the image API. Keep it concrete, visual, and self-contained. Prefer Chinese if the user used Chinese, otherwise match the user's language.",
  "assistantNote": "One short Chinese note about any assumption or missing detail. Empty string if none."
}`
                    }
                ]
            });

            const content = getTextFromCompletion(completion);
            const parsed = parseJsonObject(content);
            const requirementSummary = readString(parsed?.requirementSummary);
            const finalPrompt = readString(parsed?.finalPrompt) || content;
            const assistantNote = readString(parsed?.assistantNote);

            return NextResponse.json({
                ok: true,
                requirementSummary,
                finalPrompt,
                assistantNote
            });
        }

        const completion = await client.chat.completions.create({
            model,
            temperature: 0.7,
            messages: [
                {
                    role: 'system',
                    content:
                        'You are an image-generation requirements analyst and prompt coach. Help the user clarify subject, style, composition, camera, lighting, mood, constraints, and output intent. You may reason privately, but do not reveal chain-of-thought. Reply in Chinese by default. Keep replies practical: give a short visible analysis, ask up to three useful clarifying questions when needed, and include a compact prompt draft if enough information is available.'
                },
                {
                    role: 'user',
                    content: `Current image settings:\n${buildContext(body)}`
                },
                ...messages
            ]
        });

        return NextResponse.json({
            ok: true,
            assistantMessage: getTextFromCompletion(completion)
        });
    } catch (error: unknown) {
        let status = 500;
        let message = 'Prompt assistant request failed.';

        if (error instanceof Error) {
            message = error.message;
            if ('status' in error && typeof error.status === 'number') {
                status = error.status;
            }
        }

        return NextResponse.json({ ok: false, error: message }, { status });
    }
}
