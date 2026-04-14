import Link from "next/link";
import Image from "next/image";
import { StarRow } from "../ProductCardComponent";

const categoryTone = {
  Skincare: "bg-sky-50 text-sky-800",
  Makeup: "bg-violet-50 text-violet-800",
  Fragrance: "bg-amber-50 text-amber-900",
  Haircare: "bg-emerald-50 text-emerald-900",
  Hair: "bg-emerald-50 text-emerald-900",
  Face: "bg-cyan-50 text-cyan-800",
};

function badgeClass(label) {
  return categoryTone[label] ?? "bg-indigo-50 text-indigo-800";
}

const btnClass =
  "mt-2 block w-full rounded-xl border border-gray-900 bg-gray-900 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800";

export default function ShopCardComponent({ product }) {
  const categoryLabel = product.categoryName ?? "Uncategorized";
  const imageSrc = product?.imageUrl || "https://via.placeholder.com/300";
  const safePrice = Number(product?.price ?? 0);
  const productHref = product?.productId ? `/products/${product.productId}` : "/products";

  return (
    <article className="group max-w-75 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={imageSrc}
          alt="image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`object-cover`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-semibold leading-snug text-gray-900">
            {product.name}
          </h3>
          <p className="mt-1 min-h-10 line-clamp-2 text-sm leading-5 text-gray-500">
            {product.description}
          </p>
        </div>
        <StarRow productId={product?.productId} rating={product?.star ?? product?.rating ?? null} />
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
          <p className="text-xl font-semibold tabular-nums text-gray-900">
            ${safePrice.toFixed(2)}
          </p>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${badgeClass(categoryLabel)}`}
          >
            {categoryLabel}
          </span>
        </div>
        <Link href={productHref} className={`${btnClass}`}>
          View Product
        </Link>
      </div>
    </article>
  );
}
