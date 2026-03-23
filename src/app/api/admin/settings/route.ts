import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';
import { getSettings, updateSettings } from '@/lib/settings-store';

export async function GET(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }

  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Ključ je obavezan.' }, { status: 400 });
    }

    const allowedKeys = ['piste_status', 'cameras'];
    if (!allowedKeys.includes(key)) {
      return NextResponse.json({ error: 'Nedozvoljen ključ.' }, { status: 400 });
    }

    const updated = await updateSettings(key, value);
    return NextResponse.json({ success: true, ...updated });
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtjev.' }, { status: 400 });
  }
}
