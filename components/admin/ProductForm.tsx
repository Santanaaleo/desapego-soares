"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categories } from "@/lib/constants";
import { slugify } from "@/lib/formatters";
import type { Product, ProductInput } from "@/types/product";
import { ImageUpload } from "./ImageUpload";

type Props = {
  product?: Product;
  onSubmit: (input: ProductInput) => void;
};

export function ProductForm({ product, onSubmit }: Props) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price.toString() || "");
  const [category, setCategory] = useState<ProductInput["category"]>(product?.category || "Polos");
  const [brand, setBrand] = useState(product?.brand || "");
  const [sizesText, setSizesText] = useState(product?.sizes.join(", ") || "");
  const [condition, setCondition] = useState(product?.condition || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active ?? true);
  const [soldOut, setSoldOut] = useState(product?.sold_out ?? false);
  const [images, setImages] = useState(product?.images || []);
  const [error, setError] = useState("");

  const slug = useMemo(() => slugify(name), [name]);

  function parsePrice(value: string) {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : NaN;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const sizes = sizesText
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);
    const numericPrice = parsePrice(price);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }

    if (!slug) {
      setError("Informe um nome válido para gerar o slug do produto.");
      return;
    }

    setError("");

    onSubmit({
      name,
      slug,
      description,
      price: numericPrice,
      category,
      brand,
      sizes,
      condition,
      featured,
      active,
      sold_out: soldOut,
      images: images.length ? images : ["/produtos/polos/polo-3.jpeg"]
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-md border border-neutral-100 bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do produto" />
        <Input
          required
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          placeholder="Preço"
          inputMode="decimal"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value as ProductInput["category"])}
          className="focus-ring h-11 rounded-md border border-neutral-200 bg-white px-4 text-sm"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Marca" />
        <Input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Condição" />
      </div>

      <div className="grid gap-3">
        <p className="text-sm font-black uppercase text-neutral-950">Tamanhos disponíveis</p>
        <Input
          value={sizesText}
          onChange={(event) => setSizesText(event.target.value)}
          placeholder="Ex: P, M, G, GG ou 38, 39, 40, 41"
        />
        <p className="text-xs font-bold text-neutral-500">
          Separe por vírgula. Deixe vazio para produtos sem tamanho, como óculos.
        </p>
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descrição"
        className="focus-ring min-h-28 rounded-md border border-neutral-200 p-4 text-sm"
      />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Ativo
        </label>
        <label className="flex items-center gap-2 text-sm font-bold">
          <input type="checkbox" checked={soldOut} onChange={(event) => setSoldOut(event.target.checked)} />
          Produto esgotado
        </label>
      </div>
      <ImageUpload images={images} onChange={setImages} />
      {error ? <p className="text-sm font-bold text-red-600">{error}</p> : null}
      <Button type="submit">{product ? "Salvar alterações" : "Cadastrar produto"}</Button>
    </form>
  );
}
