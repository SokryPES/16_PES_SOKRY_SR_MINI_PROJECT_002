"use client";

import { MoreHorizontal, PencilLine, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import ButtonAddComponent from "../ButtonAddComponent";

function normalizeImageSrc(src) {
	if (typeof src !== "string") {
		return null;
	}

	const value = src.trim();
	if (!value || value === "null" || value === "undefined") {
		return null;
	}

	if (value.startsWith("/")) {
		return value;
	}

	try {
		const url = new URL(value);
		if (url.protocol === "http:" || url.protocol === "https:") {
			return value;
		}
	} catch {
		return null;
	}

	return null;
}

export default function ProductCardComponent({ product, onEdit, onDelete }) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef(null);
	const productName = product?.productName ?? product?.name ?? "Untitled product";
	const productId = product?.productId ?? product?.id;
	const price = Number(product?.price ?? 0);
	const imageSrc = normalizeImageSrc(product?.imageUrl ?? product?.image);
	const categoryName = product?.categoryName ?? "Uncategorized";
	const rating = product?.star ?? product?.rating;
	const hasRating = rating !== null && rating !== undefined && rating !== "";
	const numericRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
	const filledStars = hasRating ? Math.max(0, Math.min(5, Math.round(numericRating))) : 0;

	useEffect(() => {
		const handlePointerDown = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, []);

	return (
		<article className="group relative flex h-full flex-col rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
			<div ref={menuRef} className="absolute right-4 top-4 z-10">
				<button
					type="button"
					onClick={() => setIsMenuOpen((current) => !current)}
					className="inline-flex size-9 items-center justify-center rounded-full border cursor-pointer border-gray-200 bg-white text-gray-500 shadow-sm transition hover:text-gray-900"
					aria-label={`Open actions for ${productName}`}
				>
					<MoreHorizontal className="size-4" />
				</button>

				{isMenuOpen ? (
					<div className="absolute right-0 top-11 w-44 overflow-hidden rounded-2xl border border-gray-100 bg-white py-1 shadow-[0_18px_40px_rgba(15,23,42,0.14)]">
						<button
							type="button"
							onClick={() => {
								setIsMenuOpen(false);
								onEdit?.(product);
							}}
							className="flex w-full items-center gap-3 px-4 py-3 text-sm cursor-pointer text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
						>
							<PencilLine className="size-4" />
							Edit
						</button>
						<button
							type="button"
							onClick={() => {
								setIsMenuOpen(false);
								onDelete?.(product);
							}}
							className="flex w-full items-center gap-3 px-4 py-3 text-sm cursor-pointer text-gray-700 transition hover:bg-red-50 hover:text-red-700"
						>
							<Trash2 className="size-4" />
							Delete
						</button>
					</div>
				) : null}
			</div>

			<Link href={productId ? `/products/${productId}` : "/products"} className="block">
				<div className="overflow-hidden rounded-[20px] border border-gray-100 bg-gray-50">
					<div className="relative aspect-square bg-gradient-to-br from-gray-50 to-lime-50/40">
						{imageSrc ? (
							<Image
								src={imageSrc}
								alt={productName}
								fill
								sizes="(max-width: 768px) 100vw, 25vw"
								className="object-contain p-5 transition duration-300 group-hover:scale-[1.02]"
							/>
						) : (
							<div className="flex size-full items-center justify-center text-5xl text-gray-300">
								◇
							</div>
						)}
					</div>
				</div>
			</Link>

			<div className="mt-4 flex items-center gap-1 text-xs text-amber-400">
				{Array.from({ length: 5 }).map((_, index) => (
					<span key={index} className={index < filledStars ? "text-amber-400" : "text-gray-300"}>
						★
					</span>
				))}
				<span className="ml-1 text-gray-500">{hasRating ? numericRating.toFixed(1) : "—"}</span>
			</div>

			<div className="mt-2 flex-1">
				<p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">{categoryName}</p>
				<h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">{productName}</h3>
			</div>

			<div className="mt-4 flex items-end justify-between gap-3">
				<div>
					<p className="text-xs text-gray-500">Price</p>
					<p className="text-base font-semibold tabular-nums text-gray-900">${price}</p>
				</div>

				<ButtonAddComponent product={product} />
			</div>
		</article>
	);
}
