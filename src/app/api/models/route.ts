import { NextRequest, NextResponse } from 'next/server';
import { normalizeOpenAICompatibleBaseUrl } from '@/lib/api-base-url';
import { verifyAdminUnlockToken } from '@/lib/admin-auth';
import OpenAI from 'openai';

function looksLikeImageModel(modelId: string) {
    return /image|dall[-_]?e|flux|sdxl|stable|imagen|midjourney|mj-|gpt-image/i.test(modelId);
}

function looksLikeChatModel(modelId: string) {
    return (
        !looksLikeImageModel(modelId) &&
        /(gpt|chat|claude|gemini|qwen|deepseek|llama|mistral|glm|yi|moonshot|kimi|ernie|hunyuan|doubao|abab|baichuan|spark)/i.test(
            modelId
        )
    );
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const apiKey = typeof body.apiKey === 'string' && body.apiKey.trim() ? body.apiKey.trim() : process.env.OPENAI_API_KEY;
        const canOverrideApiBaseUrl = verifyAdminUnlockToken(body.adminUnlockToken);
        const baseURL = canOverrideApiBaseUrl
            ? normalizeOpenAICompatibleBaseUrl(body.apiBaseUrl) || process.env.OPENAI_API_BASE_URL
            : process.env.OPENAI_API_BASE_URL;

        if (!apiKey) {
            return NextResponse.json({ ok: false, error: 'Missing API Key / SK.' }, { status: 400 });
        }

        const client = new OpenAI({ apiKey, baseURL });
        const models = await client.models.list();
        const modelIds = Array.from(new Set(models.data.map((model) => model.id).filter(Boolean))).sort((a, b) =>
            a.localeCompare(b)
        );
        const nonImageModelIds = modelIds.filter((modelId) => !looksLikeImageModel(modelId));
        const chatModelIds = modelIds.filter(looksLikeChatModel);

        return NextResponse.json({
            ok: true,
            baseURL: baseURL || 'https://api.openai.com/v1',
            models: modelIds,
            chatModels: chatModelIds.length ? chatModelIds : nonImageModelIds,
            modelCount: modelIds.length
        });
    } catch (error: unknown) {
        let status = 500;
        let message = 'Failed to fetch models.';

        if (error instanceof Error) {
            message = error.message;
            if ('status' in error && typeof error.status === 'number') {
                status = error.status;
            }
        }

        return NextResponse.json({ ok: false, error: message }, { status });
    }
}
