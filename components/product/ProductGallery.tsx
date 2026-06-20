"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(images[0]);

  return (
    <div className="grid gap-4">
      <div className="relative mx-auto aspect-square max-h-[520px] w-full max-w-[520px] overflow-hidden rounded-md bg-brand-mist sm:aspect-[4/5]">
        <Image
          src={selected}
          alt={name}
          fill
          sizes="(min-width: 1024px) 520px, 100vw"
          className="object-contain object-center p-5 sm:p-6"
          priority
          unoptimized={selected.startsWith("data:")}
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => (
          <button
            key={image}
            type="button"
            onClick={() => setSelected(image)}
            className={`focus-ring relative aspect-square overflow-hidden rounded-md border ${
              selected === image ? "border-brand" : "border-neutral-100"
            }`}
            aria-label={`Ver imagem de ${name}`}
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="120px"
              className="object-contain object-center p-1"
              unoptimized={image.startsWith("data:")}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
