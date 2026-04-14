"use client";

import { X } from "lucide-react";
import { useMemo, useState } from "react";

const COLOR_OPTIONS = ["green", "gray", "red", "blue", "white"];
const SIZE_OPTIONS = ["s", "m", "l", "xl", "xxl", "xxxl"];

function normalizeVariantList(value) {
	if (Array.isArray(value)) {
		return value.map((item) => String(item).trim()).filter(Boolean);
	}

	if (typeof value === "string") {
		return value
			.split(/[,/|]/)
			.map((item) => item.trim())
			.filter(Boolean);
	}

	return [];
}

function buildInitialFormState(product, categories) {
	const firstCategoryId = categories?.[0]?.categoryId ?? "";
	const productName = product?.productName ?? product?.name ?? "";
	const imageUrl = product?.imageUrl ?? product?.image ?? "";

	return {
		productName,
		price: product?.price ?? "",
		categoryId: product?.categoryId ?? firstCategoryId,
		imageUrl,
		description: product?.description ?? "",
		colors: normalizeVariantList(product?.colors ?? product?.color),
		sizes: normalizeVariantList(product?.sizes ?? product?.size),
	};
}

export default function CreateProductComponent({
	isOpen,
	mode = "create",
	product,
	categories = [],
	isSubmitting = false,
	onClose,
	onSubmit,
}) {
	const [formState, setFormState] = useState(() => buildInitialFormState(product, categories));

	const title = mode === "edit" ? "Update product" : "Create product";
	const submitLabel = mode === "edit" ? "Update product" : "Create product";

	const categoryOptions = useMemo(() => categories.filter(Boolean), [categories]);

	const toggleVariant = (field, value) => {
		setFormState((current) => {
			const values = new Set(current[field]);

			if (values.has(value)) {
				values.delete(value);
			} else {
				values.add(value);
			}

			return {
				...current,
				[field]: Array.from(values),
			};
		});
	};

	const handleChange = (field) => (event) => {
		const nextValue = event.target.value;
		setFormState((current) => ({
			...current,
			[field]: nextValue,
		}));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		const nextPayload = {
			productName: formState.productName.trim(),
			name: formState.productName.trim(),
			description: formState.description.trim(),
			price: Number(formState.price),
			categoryId: String(formState.categoryId).trim(),
			imageUrl: formState.imageUrl.trim() || null,
			image: formState.imageUrl.trim() || null,
			colors: formState.colors,
			color: formState.colors,
			sizes: formState.sizes,
			size: formState.sizes,
		};

		await onSubmit(nextPayload);
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
			<div
				className="relative w-full max-w-3xl rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-7"
				role="dialog"
				aria-modal="true"
				aria-labelledby="manage-product-modal-title"
				onMouseDown={(event) => {
					if (event.target === event.currentTarget && !isSubmitting) {
						onClose();
					}
				}}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-4 top-4 cursor-pointer inline-flex size-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
					aria-label="Close dialog"
					disabled={isSubmitting}
				>
					<X className="size-5" />
				</button>

				<div className="pr-10">
					<h2 id="manage-product-modal-title" className="text-xl font-semibold text-gray-900">
						{title}
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Changes are saved through the products API and will refresh the grid after submit.
					</p>
				</div>

				<form onSubmit={handleSubmit} className="mt-5 space-y-5">
					<div className="grid gap-4 sm:grid-cols-2">
						<label className="space-y-2 text-sm font-medium text-gray-700">
							<span>Name</span>
							<input
								value={formState.productName}
								onChange={handleChange("productName")}
								className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
								placeholder="Product name"
								required
							/>
						</label>

						<label className="space-y-2 text-sm font-medium text-gray-700">
							<span>Price</span>
							<input
								type="text"
								min="0"
								step="0.01"
								value={formState.price}
								onChange={handleChange("price")}
								className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
								placeholder="0.00"
								required
							/>
						</label>

						<label className="space-y-2 text-sm font-medium text-gray-700">
							<span>Category</span>
							<select
								value={formState.categoryId}
								onChange={handleChange("categoryId")}
								className="w-full rounded-2xl cursor-pointer border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
								required
							>
								<option value="">Select...</option>
								{categoryOptions.map((category) => (
									<option key={category.categoryId} value={category.categoryId}>
										{category.categoryName}
									</option>
								))}
							</select>
						</label>

						<label className="space-y-2 text-sm font-medium text-gray-700">
							<span>Image URL (optional)</span>
							<input
								value={formState.imageUrl}
								onChange={handleChange("imageUrl")}
								className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
								placeholder="https://..."
							/>
						</label>
					</div>

					<div className="space-y-3">
						<div className="text-sm font-medium text-gray-700">Colors</div>
						<div className="flex flex-wrap gap-2">
							{COLOR_OPTIONS.map((color) => {
								const selected = formState.colors.includes(color);

								return (
									<button
										key={color}
										type="button"
										onClick={() => toggleVariant("colors", color)}
										className={`inline-flex items-center cursor-pointer gap-2 rounded-full border px-3 py-2 text-sm transition ${
											selected
												? "border-lime-400 bg-lime-50 text-lime-800"
												: "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
										}`}
									>
										<span
											className={`inline-flex size-5 items-center justify-center rounded-full border text-[11px] ${
												selected
													? "border-lime-500 bg-lime-500 text-white"
													: "border-gray-300 text-transparent"
											}`}
										>
											✓
										</span>
										<span className="capitalize">{color}</span>
									</button>
								);
							})}
						</div>
					</div>

					<div className="space-y-3">
						<div className="text-sm font-medium text-gray-700">Sizes</div>
						<div className="flex flex-wrap gap-2">
							{SIZE_OPTIONS.map((size) => {
								const selected = formState.sizes.includes(size);

								return (
									<button
										key={size}
										type="button"
										onClick={() => toggleVariant("sizes", size)}
										className={`inline-flex items-center cursor-pointer gap-2 rounded-full border px-3 py-2 text-sm uppercase transition ${
											selected
												? "border-lime-400 bg-lime-50 text-lime-800"
												: "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
										}`}
									>
										<span
											className={`inline-flex size-5 items-center justify-center rounded-full cursor-pointer border text-[11px] ${
												selected
													? "border-lime-500 bg-lime-500 text-white"
													: "border-gray-300 text-transparent"
											}`}
										>
											✓
										</span>
										<span>{size}</span>
									</button>
								);
							})}
						</div>
					</div>

					<label className="space-y-2 text-sm font-medium text-gray-700">
						<span>Description</span>
						<textarea
							value={formState.description}
							onChange={handleChange("description")}
							rows={5}
							className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-200"
							placeholder="Describe the product"
						/>
					</label>

					<div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="inline-flex items-center cursor-pointer justify-center rounded-full border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center cursor-pointer justify-center rounded-full bg-lime-400 px-6 py-3 text-sm font-semibold text-lime-950 shadow-[0_10px_20px_rgba(132,204,22,0.35)] transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-70"
						>
							{isSubmitting ? "Saving..." : submitLabel}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
