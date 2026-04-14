"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ChevronRight , ChevronLeft} from "lucide-react";    

function normalizeImageSrc(src) {
	if (typeof src !== "string") return null;

	const value = src.trim();
	if (!value || value === "null" || value === "undefined") return null;

	if (value.startsWith("/")) return value;

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

export default function SwitchProduct({
	productName,
	images = [],
	onPrevProduct,
	onNextProduct,
	canGoPrevProduct,
	canGoNextProduct,
	productThumbnails = [],
	onSelectProduct,
}) {
	const validImages = useMemo(() => {
		const normalized = images.map(normalizeImageSrc).filter(Boolean);
		return normalized.length > 0 ? normalized : [null];
	}, [images]);

	const [activeIndex, setActiveIndex] = useState(0);
	const [startIndex, setStartIndex] = useState(0);

	const maxStartIndex = Math.max(validImages.length - 3, 0);
	const visibleImages = validImages.slice(startIndex, startIndex + 3);

	const hasProductNavigation = typeof onPrevProduct === "function" || typeof onNextProduct === "function";

	const handlePrev = () => {
		if (typeof onPrevProduct === "function") {
			onPrevProduct();
			return;
		}

		setStartIndex((prev) => Math.max(prev - 1, 0));
	};

	const handleNext = () => {
		if (typeof onNextProduct === "function") {
			onNextProduct();
			return;
		}

		setStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
	};

	const prevDisabled = hasProductNavigation ? !canGoPrevProduct : startIndex === 0;
	const nextDisabled = hasProductNavigation ? !canGoNextProduct : startIndex >= maxStartIndex;

	return (
		<div>
			<div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 p-8">
				<div className="relative aspect-4/5 w-full">
					{validImages[activeIndex] ? (
						<Image
							src={validImages[activeIndex]}
							alt={productName ?? "Product"}
							fill
							sizes="(max-width: 1024px) 100vw, 50vw"
							className="object-contain"
							priority
						/>
					) : (
						<div className="flex size-full items-center justify-center text-sm text-gray-400">
							No image available
						</div>
					)}
				</div>
			</div>

			<div className="mt-4 flex items-center justify-between gap-3">
				<button
					type="button"
					onClick={handlePrev}
					disabled={prevDisabled}
					className="cursor-pointer grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-lg text-gray-600 transition hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-45"
					aria-label={hasProductNavigation ? "Show previous product" : "Show previous images"}
				>
					<ChevronLeft />
				</button>

				<div className="grid flex-1 grid-cols-3 gap-2">
					{hasProductNavigation && productThumbnails.length > 0
						? productThumbnails.map((item, index) => {
							const thumbSrc = normalizeImageSrc(item?.imageSrc);
							const isActive = Boolean(item?.isActive);

							return (
								<button
									key={`${item?.productId ?? "product"}-${index}`}
									type="button"
									onClick={() => onSelectProduct?.(item?.productId)}
									className={`relative aspect-square overflow-hidden rounded-2xl border bg-gray-100 p-1 transition ${
										isActive ? "border-blue-500" : "border-gray-200"
									}`}
									aria-label={`Open ${item?.productName ?? "product"}`}
								>
									{thumbSrc ? (
										<Image
											src={thumbSrc}
											alt=""
											fill
											sizes="120px"
											className="object-contain"
										/>
									) : (
										<span className="grid size-full place-items-center text-xs text-gray-400">No image</span>
									)}
								</button>
							);
						})
						: visibleImages.map((src, localIndex) => {
							const index = startIndex + localIndex;
							const isActive = index === activeIndex;

							return (
								<button
									key={`${src ?? "thumb"}-${index}`}
									type="button"
									onClick={() => setActiveIndex(index)}
									className={`relative aspect-square overflow-hidden rounded-2xl border bg-gray-100 p-1 transition ${
										isActive ? "border-blue-500" : "border-gray-200"
									}`}
									aria-label={`Select image ${index + 1}`}
								>
									{src ? (
										<Image
											src={src}
											alt=""
											fill
											sizes="120px"
											className="object-contain"
										/>
									) : (
										<span className="grid size-full place-items-center text-xs text-gray-400">No image</span>
									)}
								</button>
							);
						})}
				</div>

				<button
					type="button"
					onClick={handleNext}
					disabled={nextDisabled}
					className="grid size-9 place-items-center rounded-full border border-gray-200 bg-white text-lg text-gray-600 transition cursor-pointer hover:border-gray-300 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-45"
					aria-label={hasProductNavigation ? "Show next product" : "Show next images"}
				>
					<ChevronRight />
				</button>
			</div>
		</div>
	);
}
