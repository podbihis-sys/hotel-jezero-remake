"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = "Slika" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError("");
    setUploading(true);

    const token = localStorage.getItem("admin_token") || "";
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-token": token },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Greška pri uploadu.");
        return;
      }

      const data = await res.json();
      onChange(data.url);
    } catch {
      setError("Greška u komunikaciji.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <div className="relative h-40 w-full">
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-600 text-white p-1.5 rounded-lg shadow hover:bg-red-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-3 py-2 bg-white border-t border-gray-200">
            <p className="text-xs text-gray-500 truncate">{value}</p>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-[#00c0f7] bg-[#00c0f7]/5"
              : "border-gray-300 hover:border-[#00c0f7] hover:bg-gray-50"
          } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-[#163c6f] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600 font-medium">
                Kliknite ili povucite sliku ovdje
              </p>
              <p className="text-xs text-gray-400">JPG, PNG, WebP, GIF do 10MB</p>
            </div>
          )}
        </div>
      )}

      {/* Manual URL input as fallback */}
      <div className="mt-2 flex items-center gap-2">
        <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ili unesite URL slike (/images/...)"
          className="flex-1 text-xs px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#00c0f7] focus:border-transparent outline-none"
        />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
