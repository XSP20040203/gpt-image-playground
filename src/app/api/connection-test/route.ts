import { NextRequest, NextResponse } from 'next/server';
import { normalizeOpenAICompatibleBaseUrl } from '@/lib/api-base-url';
import { verifyAdminUnlockToken } from '@/lib/admin-auth';
import OpenAI from 'openai';

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
        const modelIds = models.data.map((model) => model.id);
        const imageModelCount = modelIds.filter((id) => /image|dall[-_]?e|flux|sdxl|stable|imagen/i.test(id)).length;

        return NextResponse.json({
            ok: true,
            baseURL: baseURL || 'https://api.openai.com/v1',
            modelCount: modelIds.length,
            imageModelCount,
            sampleModels: modelIds.slice(0, 12)
        });
    } catch (error: unknown) {
        let status = 500;
        let message = 'Connection test failed.';

        if (error instanceof Error) {
            message = error.message;
            if ('status' in error && typeof error.status === 'number') {
                status = error.status;
            }
        }

        return NextResponse.json({ ok: false, error: message }, { status });
    }
}
