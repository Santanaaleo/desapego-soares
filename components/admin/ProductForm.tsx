"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { categories } from "@/lib/constants";
import { formatPrice, slugify } from "@/lib/formatters";
import {
  getDefaultNumericSizes,
  getProductSizeGrid,
  inferProductSizeType,
  isNumericSize,
  letterSizes,
  normalizeSizes,
  type ProductSizeType
} from "@/lib/product-sizes";
import type { Product, ProductInput } from "@/types/product";
import { ImageUpload } from "./ImageUpload";

type Props = {
  product?: Product;
  onSubmit: (input: ProductInput) => void | Promise<void>;
};

function validateRenderedImage(url: string, index: number) {
  return new Promise<void>((resolve, reject) => {
    const image = new window.Image();

    image.onload = () => {
      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve();
        return;
      }

      reject(new Error(`A imagem ${index + 1} não possui dimensões válidas.`));
    };
    image.onerror = () => reject(new Error(`A imagem ${index + 1} não pôde ser carregada. Remova-a ou envie novamente.`));
    image.src = url;
  });
}

export function ProductForm({ product, onSubmit }: Props) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product?.price.toString() || "");
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() || "");
  const [saleActive, setSaleActive] = useState(product?.sale_active ?? false);
  const [category, setCategory] = useState<ProductInput["category"]>(product?.category || "Polos");
  const [brand, setBrand] = useState(product?.brand || "");
  const [sizeType, setSizeType] = useState<ProductSizeType>(() =>
    inferProductSizeType({ sizes: product?.sizes ?? [], size_options: product?.size_options })
  );
  const [sizes, setSizes] = useState(() => normalizeSizes(product?.sizes));
  const [sizeOptions, setSizeOptions] = useState(() =>
    product ? getProductSizeGrid(product) : [...letterSizes]
  );
  const [customNumbersText, setCustomNumbersText] = useState(() =>
    product && inferProductSizeType(product) === "numbers" ? getProductSizeGrid(product).join(", ") : ""
  );
  const [variationsText, setVariationsText] = useState(product?.variations?.join(", ") || "");
  const [condition, setCondition] = useState(product?.condition || "");
  const [featured, setFeatured] = useState(product?.featured || false);
  const [active, setActive] = useState(product?.active ?? true);
  const [soldOut, setSoldOut] = useState(product?.sold_out ?? false);
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity.toString() || "1");
  const [images, setImages] = useState(product?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const slug = useMemo(() => slugify(name), [name]);
  const previewPrice = parsePrice(price);
  const previewCompareAtPrice = compareAtPrice.trim() ? parsePrice(compareAtPrice) : null;
  const hasInvalidSalePrice =
    saleActive &&
    previewCompareAtPrice !== null &&
    Number.isFinite(previewPrice) &&
    previewCompareAtPrice <= previewPrice;
  const previewSavings =
    saleActive && previewCompareAtPrice !== null && Number.isFinite(previewPrice) && previewCompareAtPrice > previewPrice
      ? previewCompareAtPrice - previewPrice
      : null;
  const previewPercentOff = previewSavings && previewCompareAtPrice ? Math.round((previewSavings / previewCompareAtPrice) * 100) : null;
  const usesCustomNumericSizes = category !== "Tênis" && category !== "Calças";

  function changeSizeType(nextType: ProductSizeType) {
    if (nextType === sizeType) return;

    const compatibleSizes = sizes.filter((size) => {
      if (nextType === "none") return false;
      return nextType === "numbers" ? isNumericSize(size) : !isNumericSize(size);
    });
    const standardCurrentOptions = new Set(sizeType === "letters" ? letterSizes : getDefaultNumericSizes(category));
    const hasIncompatibleCustomOptions = sizeOptions.some((size) => {
      if (standardCurrentOptions.has(size)) return false;
      if (nextType === "none") return true;
      return nextType === "numbers" ? !isNumericSize(size) : isNumericSize(size);
    });

    if (compatibleSizes.length !== sizes.length || hasIncompatibleCustomOptions) {
      const confirmed = window.confirm("Mudar o tipo limpará tamanhos ou opções incompatíveis. Deseja continuar?");
      if (!confirmed) return;
    }

    setSizeType(nextType);
    setSizes(compatibleSizes);

    if (nextType === "none") {
      setSizeOptions([]);
      setCustomNumbersText("");
      return;
    }

    if (nextType === "letters") {
      const nextOptions = normalizeSizes([...letterSizes, ...sizeOptions.filter((size) => !isNumericSize(size)), ...compatibleSizes]);
      setSizeOptions(nextOptions);
      return;
    }

    const nextOptions = normalizeSizes([
      ...getDefaultNumericSizes(category),
      ...sizeOptions.filter(isNumericSize),
      ...compatibleSizes
    ]);
    setSizeOptions(nextOptions);
    setCustomNumbersText(nextOptions.join(", "));
  }

  function changeCategory(nextCategory: ProductInput["category"]) {
    if (sizeType === "numbers") {
      const previousDefaults = new Set(getDefaultNumericSizes(category));
      const preservedOptions = sizeOptions.filter((size) => !previousDefaults.has(size) || sizes.includes(size));
      const nextOptions = normalizeSizes([...getDefaultNumericSizes(nextCategory), ...preservedOptions, ...sizes]);
      setSizeOptions(nextOptions);
      setCustomNumbersText(nextOptions.join(", "));
    }

    setCategory(nextCategory);
  }

  function toggleSize(size: string) {
    setSizes((current) => current.includes(size) ? current.filter((item) => item !== size) : [...current, size]);
  }

  function changeCustomNumericSizes(value: string) {
    setCustomNumbersText(value);
    const parsedOptions = value
      .split(/[\s,]+/)
      .map((size) => size.trim())
      .filter((size) => isNumericSize(size));
    setSizeOptions(normalizeSizes([...parsedOptions, ...sizes.filter(isNumericSize)]));
  }

  function parsePrice(value: string) {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : NaN;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const variations = variationsText
      .split(",")
      .map((variation) => variation.trim())
      .filter(Boolean);
    const numericPrice = parsePrice(price);
    const numericCompareAtPrice = compareAtPrice.trim() ? parsePrice(compareAtPrice) : null;
    const numericStock = Number(stockQuantity);

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError("Informe um preço maior que zero.");
      return;
    }

    if (!slug) {
      setError("Informe um nome válido para gerar o slug do produto.");
      return;
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError("Informe uma quantidade em estoque igual ou maior que zero.");
      return;
    }

    if (saleActive && numericCompareAtPrice !== null && (!Number.isFinite(numericCompareAtPrice) || numericCompareAtPrice <= 0)) {
      setError("Informe um preço antigo maior que zero ou deixe o campo vazio.");
      return;
    }

    if (saleActive && numericCompareAtPrice !== null && numericCompareAtPrice <= numericPrice) {
      setError("O preço antigo precisa ser maior que o preço atual.");
      return;
    }

    if (!images.length) {
      setError("Envie pelo menos uma imagem do produto.");
      return;
    }

    if (sizeType === "numbers" && !sizeOptions.length) {
      setError("Informe pelo menos uma opção para a grade numérica.");
      return;
    }

    if (uploadingImages) {
      setError("Aguarde o envio de todas as imagens antes de salvar.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await Promise.all(images.map(validateRenderedImage));
      await onSubmit({
        name,
        slug,
        description,
        price: numericPrice,
        compare_at_price: numericCompareAtPrice,
        sale_active: saleActive,
        category,
        brand,
        sizes: sizeType === "none" ? [] : normalizeSizes(sizes),
        size_options: sizeType === "none" ? [] : normalizeSizes([...sizeOptions, ...sizes]),
        variations,
        condition,
        featured,
        active,
        sold_out: numericStock === 0 ? true : soldOut,
        stock_quantity: numericStock,
        images
      });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível validar as imagens do produto.");
    } finally {
      setSaving(false);
    }
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
          onChange={(event) => changeCategory(event.target.value as ProductInput["category"])}
          className="focus-ring h-11 rounded-md border border-neutral-200 bg-white px-4 text-sm font-normal"
        >
          {categories.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <Input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Marca" />
        <Input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Condição" />
        <Input
          required
          min="0"
          step="1"
          type="number"
          value={stockQuantity}
          onChange={(event) => setStockQuantity(event.target.value)}
          placeholder="Quantidade em estoque"
        />
      </div>

      <div className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-semibold uppercase text-neutral-950">Promoção opcional</p>
        <label className="flex items-center gap-2 text-sm font-semibold text-neutral-950">
          <input type="checkbox" checked={saleActive} onChange={(event) => setSaleActive(event.target.checked)} />
          Este produto está em promoção
        </label>
        {saleActive ? (
          <div className="grid gap-3">
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase text-neutral-700" htmlFor="compare-at-price">
                Preço antigo
              </label>
              <Input
                id="compare-at-price"
                value={compareAtPrice}
                onChange={(event) => setCompareAtPrice(event.target.value)}
                placeholder="Digite o valor original antes da promoção"
                inputMode="decimal"
              />
              <p className="text-xs font-normal leading-5 text-neutral-500">
                Se o produto custa R$ 199,90 e antes custava R$ 299,90, coloque 299,90 aqui.
              </p>
            </div>
            {hasInvalidSalePrice ? (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-normal text-red-700">
                O preço antigo precisa ser maior que o preço atual.
              </p>
            ) : null}
            {previewPercentOff ? (
              <div className="rounded-md border border-neutral-200 bg-white p-3 text-sm">
                <p className="mb-2 text-xs font-semibold uppercase text-neutral-500">Como aparecerá na loja:</p>
                <p className="text-neutral-500">De: {formatPrice(previewCompareAtPrice!)}</p>
                <p className="font-bold text-neutral-950">Por: {formatPrice(previewPrice)}</p>
                <p className="font-semibold text-brand">{previewPercentOff}% OFF</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-md border border-neutral-200 p-4">
        <fieldset>
          <legend className="text-sm font-semibold uppercase text-neutral-950">Tipo de tamanho</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {([
              ["letters", "Letras"],
              ["numbers", "Números"],
              ["none", "Sem tamanho"]
            ] as const).map(([value, label]) => (
              <label
                key={value}
                className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold ${
                  sizeType === value ? "border-brand bg-brand-mist text-brand" : "border-neutral-200 bg-white text-neutral-800"
                }`}
              >
                <input
                  type="radio"
                  name="size-type"
                  value={value}
                  checked={sizeType === value}
                  onChange={() => changeSizeType(value)}
                  className="accent-brand"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {sizeType === "letters" ? (
          <fieldset>
            <legend className="text-sm font-semibold text-neutral-950">Marque os tamanhos disponíveis</legend>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {sizeOptions.map((size) => (
                <label key={size} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={sizes.includes(size)}
                    onChange={() => toggleSize(size)}
                    className="accent-brand"
                  />
                  {size}
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {sizeType === "numbers" ? (
          <div className="grid gap-3">
            {usesCustomNumericSizes ? (
              <div className="grid gap-2">
                <label htmlFor="custom-size-options" className="text-sm font-semibold text-neutral-950">
                  Opções da grade numérica
                </label>
                <Input
                  id="custom-size-options"
                  value={customNumbersText}
                  onChange={(event) => changeCustomNumericSizes(event.target.value)}
                  placeholder="Ex: 2, 4, 6, 8 ou 38, 40, 42"
                  inputMode="numeric"
                />
                <p className="text-xs font-normal text-neutral-500">Separe os números por vírgula e marque abaixo os disponíveis.</p>
              </div>
            ) : null}
            <fieldset>
              <legend className="text-sm font-semibold text-neutral-950">Marque os números disponíveis</legend>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {sizeOptions.map((size) => (
                  <label key={size} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-3 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={sizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="accent-brand"
                    />
                    {size}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        ) : null}

        {sizeType === "none" ? (
          <p className="text-sm font-normal text-neutral-600">Este produto será vendido sem seleção de tamanho.</p>
        ) : null}
      </div>

      <div className="grid gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-4">
        <p className="text-sm font-semibold uppercase text-neutral-950">Variações (Opcional)</p>
        <Input
          value={variationsText}
          onChange={(event) => setVariationsText(event.target.value)}
          placeholder="Ex: Preto/Azul, Preto/Branco, Preto/Vermelho"
        />
        <p className="text-xs font-normal text-neutral-500">Separe as variações por vírgula. Deixe vazio se o produto não possuir opções.</p>
      </div>

      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Descrição"
        className="focus-ring min-h-28 rounded-md border border-neutral-200 p-4 text-sm font-normal placeholder:font-normal"
      />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Destaque
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />
          Ativo
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={soldOut || Number(stockQuantity) === 0} onChange={(event) => setSoldOut(event.target.checked)} />
          Produto esgotado
        </label>
      </div>
      <ImageUpload images={images} onChange={setImages} onUploadingChange={setUploadingImages} />
      {error ? <p className="text-sm font-normal text-red-600">{error}</p> : null}
      <Button type="submit" disabled={uploadingImages || saving}>
        {uploadingImages ? "Enviando imagens..." : saving ? "Validando imagens..." : product ? "Salvar alterações" : "Cadastrar produto"}
      </Button>
    </form>
  );
}
