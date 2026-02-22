"use client";
import React, { useState } from 'react';

export default function ImageUploader({ onUpload }: { onUpload?: (file: File) => void }) {
  const [fileName, setFileName] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      onUpload?.(f);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h4 className="font-semibold">Upload Images</h4>
      <div className="mt-3">
        <input type="file" accept="image/*" onChange={handleChange} />
        {fileName && <div className="mt-2 text-sm text-gray-600">Selected: {fileName}</div>}
      </div>
    </div>
  );
}
