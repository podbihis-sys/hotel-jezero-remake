import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/admin-auth";
import { getUsers, saveUsers, hashPassword, validatePassword } from "@/lib/users-store";

const TOKEN_EXPIRY_MS = 8 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const currentUser = await getUserFromRequest(request);
  if (!currentUser) {
    return NextResponse.json({ error: "Neautorizirano." }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword, forceChange } = await request.json();

    if (!newPassword) {
      return NextResponse.json({ error: "Nova lozinka je obavezna." }, { status: 400 });
    }

    // If force-change (mustChangePassword), skip current password check
    if (!forceChange) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Oba polja su obavezna." }, { status: 400 });
      }
      const currentHash = hashPassword(currentPassword);
      if (currentHash !== currentUser.passwordHash) {
        return NextResponse.json({ error: "Trenutna lozinka nije ispravna." }, { status: 400 });
      }
    } else if (!currentUser.mustChangePassword) {
      return NextResponse.json({ error: "Neautorizirano." }, { status: 403 });
    }

    const validation = validatePassword(newPassword);
    if (validation) {
      return NextResponse.json({ error: validation }, { status: 400 });
    }

    const users = await getUsers();
    const user = users.find((u) => u.id === currentUser.id);
    if (!user) {
      return NextResponse.json({ error: "Korisnik nije pronađen." }, { status: 404 });
    }

    user.passwordHash = hashPassword(newPassword);
    user.mustChangePassword = false;
    await saveUsers(users);

    // Generate new token with expiry
    const token = Buffer.from(
      JSON.stringify({
        username: user.username,
        hash: user.passwordHash,
        exp: Date.now() + TOKEN_EXPIRY_MS,
      })
    ).toString("base64");

    return NextResponse.json({ success: true, token });
  } catch {
    return NextResponse.json({ error: "Neispravan zahtjev." }, { status: 400 });
  }
}
