import { NextRequest, NextResponse } from 'next/server';
import { createAdminUnlockToken, hashAdminPasswordForClient, verifyAdminPassword } from '@/lib/admin-auth';

export async function GET() {
    return NextResponse.json({
        passwordConfigured: Boolean(hashAdminPasswordForClient())
    });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const password = typeof body.password === 'string' ? body.password : '';

        if (!verifyAdminPassword(password)) {
            return NextResponse.json({ ok: false, error: 'Invalid admin password.' }, { status: 401 });
        }

        return NextResponse.json({
            ok: true,
            token: createAdminUnlockToken()
        });
    } catch {
        return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
    }
}
