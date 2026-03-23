import { NextRequest, NextResponse } from 'next/server';
import { validateAdminSession } from '@/lib/admin-auth';
import { sanitize } from '@/lib/validations';
import { getEvents, addEvent } from '@/lib/events-store';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/ž/g, 'z').replace(/č/g, 'c')
    .replace(/ć/g, 'c').replace(/š/g, 's')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function GET(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }
  const events = await getEvents();
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  if (!await validateAdminSession(request)) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const required = ['title', 'date', 'image', 'summary', 'body'];
    for (const field of required) {
      if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
        return NextResponse.json({ error: `Polje "${field}" je obavezno.` }, { status: 400 });
      }
    }

    const event = await addEvent({
      slug: slugify(sanitize(body.title)),
      title: sanitize(body.title.trim()),
      date: sanitize(body.date.trim()),
      image: sanitize(body.image.trim()),
      summary: sanitize(body.summary.trim()),
      body: sanitize(body.body.trim()),
      contact: body.contact ? sanitize(body.contact.trim()) : undefined,
      pinned: Boolean(body.pinned),
    });

    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Neispravan zahtjev.' }, { status: 400 });
  }
}
