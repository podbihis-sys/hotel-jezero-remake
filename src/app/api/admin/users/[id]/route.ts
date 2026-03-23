import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, hasPermission, validateOrigin } from '@/lib/admin-auth';
import { updateUserPermissions, deleteUser, setTemporaryPassword } from '@/lib/users-store';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    const body = await request.json();
    const { role, permissions } = body;

    if (!role || !permissions) {
      return NextResponse.json({ error: 'Uloga i dozvole su obavezne.' }, { status: 400 });
    }

    const updated = await updateUserPermissions(id, role, permissions);
    if (!updated) {
      return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
    }

    const { passwordHash, ...safeUser } = updated;
    return NextResponse.json(safeUser);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Neispravan zahtjev.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// PATCH: Super Admin sets a temporary password for a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Neautorizirano." }, { status: 401 });
  }
  if (currentUser.role !== "Super Admin") {
    return NextResponse.json({ error: "Samo Super Admin može postaviti jednokratnu lozinku." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const { tempPassword } = await request.json();
    if (!tempPassword || typeof tempPassword !== "string" || tempPassword.length < 6) {
      return NextResponse.json({ error: "Jednokratna lozinka mora imati najmanje 6 znakova." }, { status: 400 });
    }

    const success = await setTemporaryPassword(id, tempPassword);
    if (!success) {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Jednokratna lozinka postavljena." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Greška.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: 'Neautorizirano.' }, { status: 401 });
  }
  if (!hasPermission(currentUser, 'users', 'manage')) {
    return NextResponse.json({ error: 'Nemate dozvolu za upravljanje korisnicima.' }, { status: 403 });
  }

  const { id } = await params;

  // Cannot delete self
  if (currentUser.id === id) {
    return NextResponse.json({ error: 'Ne možete obrisati vlastiti račun.' }, { status: 400 });
  }

  try {
    const success = await deleteUser(id);
    if (!success) {
      return NextResponse.json({ error: 'Korisnik nije pronađen.' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Greška pri brisanju.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
