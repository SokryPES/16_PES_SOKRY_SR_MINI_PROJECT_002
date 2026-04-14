"use client";

import { X } from "lucide-react";

export default function ModalComponent({
	isOpen,
	product,
	isDeleting = false,
	onClose,
	onConfirm,
}) {
	if (!isOpen) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
			<div
				className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/5"
				role="dialog"
				aria-modal="true"
				aria-labelledby="delete-product-modal-title"
				onMouseDown={(event) => {
					if (event.target === event.currentTarget && !isDeleting) {
						onClose();
					}
				}}
			>
				<button
					type="button"
					onClick={onClose}
					className="absolute right-3 cursor-pointer top-3 inline-flex size-6 items-center justify-center text-gray-400 transition hover:text-gray-700"
					aria-label="Close dialog"
					disabled={isDeleting}
				>
					<X className="size-4" />
				</button>

				<div className="pr-6">
					<h2 id="delete-product-modal-title" className="text-xl font-semibold text-gray-900">
						Delete product?
					</h2>
					<p className="mt-3 text-sm text-gray-500">
						This will remove {product?.productName ?? product?.name ?? "this product"}.
					</p>
				</div>

				<div className="mt-6 flex items-center justify-end gap-2">
					<button
						type="button"
						onClick={onClose}
						disabled={isDeleting}
						className="inline-flex items-center cursor-pointer justify-center rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={isDeleting}
						className="inline-flex items-center cursor-pointer justify-center rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			</div>
		</div>
	);
}
