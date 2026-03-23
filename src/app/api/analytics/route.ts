import { NextRequest, NextResponse } from 'next/server';
import { trackPageView, getAnalytics } from '@/lib/analytics-store';
import { validateAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();
    if (typeof path === 'string' && path.length < 200) {
      await trackPageView(path);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await getAnalytics();
  return NextResponse.json(data);
}
