import { NextRequest, NextResponse } from "next/server";
import { validateAdminSession } from "@/lib/admin-auth";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  if (!(await validateAdminSession(request))) {
    return NextResponse.json({ error: "Neovlašteni pristup." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Nema datoteke." }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Nedozvoljeni tip datoteke. Dozvoljeni: JPG, PNG, WebP, GIF." }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Datoteka prevelika. Maksimum 10MB." }, { status: 400 });
    }

    // Sanitize filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const baseName = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);
    const timestamp = Date.now();
    const fileName = `images/${baseName}-${timestamp}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      fileName: blob.pathname,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Greška pri uploadu." }, { status: 500 });
  }
}
