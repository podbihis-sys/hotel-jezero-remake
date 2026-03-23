import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession, validateOrigin } from '@/lib/admin-auth';
import { getPageContent, savePageContent, PageContent, PageSection } from '@/lib/page-store';

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }

  const { slug } = await params;

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Neispravan slug.' }, { status: 400 });
  }

  try {
    const content = await getPageContent(slug);
    if (!content) {
      return NextResponse.json({ error: 'Stranica nije pronađena.' }, { status: 404 });
    }
    return NextResponse.json(content);
  } catch {
    return NextResponse.json({ error: 'Greška pri dohvaćanju stranice.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }

  const { slug } = await params;

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Neispravan slug.' }, { status: 400 });
  }

  try {
    const existing = await getPageContent(slug);
    const body = await request.json();

    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: 'Sekcije su obavezne.' }, { status: 400 });
    }

    // For new pages, title is required
    if (!existing && !body.title) {
      return NextResponse.json({ error: 'Naziv stranice je obavezan.' }, { status: 400 });
    }

    // Sanitize sections
    const validTypes = ['text', 'image', 'heading', 'gallery', 'stats'];
    const sanitizedSections: PageSection[] = body.sections.map((section: PageSection) => ({
      id: String(section.id || '').slice(0, 100),
      type: validTypes.includes(section.type) ? section.type : 'text',
      content: section.type === 'image' || section.type === 'gallery'
        ? String(section.content || '').slice(0, 5000)
        : stripHtml(String(section.content || '')).slice(0, 10000),
      label: stripHtml(String(section.label || '')).slice(0, 200),
    }));

    const validMenuPositions = ['none', 'top', 'o-nama', 'ponuda', 'ljetna-ponuda'];
    const menuPosition = validMenuPositions.includes(body.menuPosition) ? body.menuPosition : (existing?.menuPosition || 'none');
    const menuOrder = typeof body.menuOrder === 'number' ? Math.max(0, Math.min(99, body.menuOrder)) : (existing?.menuOrder ?? 99);

    const updatedContent: PageContent = {
      slug,
      title: body.title ? stripHtml(String(body.title)).slice(0, 200) : (existing?.title || slug),
      sections: sanitizedSections,
      updatedAt: new Date().toISOString(),
      menuPosition,
      menuOrder,
    };

    await savePageContent(slug, updatedContent);
    return NextResponse.json(updatedContent, { status: existing ? 200 : 201 });
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtjev.' }, { status: 400 });
  }
}
