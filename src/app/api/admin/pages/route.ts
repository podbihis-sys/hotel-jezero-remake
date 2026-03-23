import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';
import { listPages } from '@/lib/page-store';

export async function GET(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }

  try {
    const pages = await listPages();
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json({ error: 'Greška pri dohvaćanju stranica.' }, { status: 500 });
  }
}
