import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission, validateOrigin } from '@/lib/admin-auth';
import { getUsers, createUser, getDefaultPermissions } from '@/lib/users-store';

export async function GET(request: NextRequest) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }
  if (!hasPermission(currentUser, 'users', 'manage')) {
    return NextResponse.json({ error: 'Nemate dozvolu za upravljanje korisnicima.' }, { status: 403 });
  }

  const users = await getUsers();
  // Remove password hashes before sending
  const safeUsers = users.map(({ passwordHash, ...rest }) => rest);
  const defaultPermissions = getDefaultPermissions();
  return NextResponse.json({ users: safeUsers, defaultPermissions });
}

export async function POST(request: NextRequest) {
  if (!validateOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 });
  }

  const currentUser = await getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }
  if (!hasPermission(currentUser, 'users', 'manage')) {
    return NextResponse.json({ error: 'Nemate dozvolu za upravljanje korisnicima.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { username, password, role, permissions } = body;

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json({ error: 'Korisničko ime je obavezno.' }, { status: 400 });
    }
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Lozinka je obavezna.' }, { status: 400 });
    }
    if (!role || typeof role !== 'string') {
      return NextResponse.json({ error: 'Uloga je obavezna.' }, { status: 400 });
    }
    if (!permissions) {
      return NextResponse.json({ error: 'Dozvole su obavezne.' }, { status: 400 });
    }

    const newUser = await createUser(username, password, role, permissions);
    const { passwordHash, ...safeUser } = newUser;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Neispravan zahtjev.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
