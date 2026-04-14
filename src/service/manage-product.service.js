const API_BASE_URL = "/api/products";

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

export function normalizeProduct(item) {
	return {
		productId: item?.productId ?? item?.id ?? item?.uuid,
		productName: item?.productName ?? item?.name,
		name: item?.name ?? item?.productName,
		description: item?.description ?? "",
		colors: normalizeVariantList(item?.colors ?? item?.color),
		sizes: normalizeVariantList(item?.sizes ?? item?.size),
		star: item?.star ?? item?.rating ?? null,
		imageUrl: item?.imageUrl ?? item?.image ?? null,
		price: item?.price ?? 0,
		categoryId: item?.categoryId ?? null,
		categoryName: item?.categoryName ?? null,
	};
}

function extractProducts(data) {
	const items = data?.products ?? data?.payload ?? data?.data ?? data;
	return Array.isArray(items) ? items.map(normalizeProduct) : [];
}

function extractProduct(data) {
	const item = data?.product ?? data?.payload ?? data?.data ?? data;
	return item ? normalizeProduct(item) : null;
}

async function parseJson(response) {
	const text = await response.text();
	if (!text) {
		return null;
	}

	try {
		return JSON.parse(text);
	} catch {
		return { raw: text };
	}
}

function extractErrorMessage(detail, fallback) {
	if (!detail) {
		return fallback;
	}

	const upstreamDetail = detail?.upstream?.detail;
	const sampledFailure = Array.isArray(detail?.sampledFailures) ? detail.sampledFailures[0] : null;
	const sampledDetail = sampledFailure?.detail;

	const message = (
		upstreamDetail?.message ??
		upstreamDetail?.error ??
		upstreamDetail?.raw ??
		(typeof upstreamDetail === "string" ? upstreamDetail : null) ??
		sampledDetail?.message ??
		sampledDetail?.error ??
		sampledDetail?.raw ??
		(typeof sampledDetail === "string" ? sampledDetail : null) ??
		detail?.error ??
		detail?.detail?.message ??
		detail?.detail?.error ??
		detail?.detail?.raw ??
		(typeof detail?.detail === "string" ? detail.detail : null) ??
		detail?.raw ??
		detail?.message ??
		fallback
	);

	if (message === "Failed to update product." && detail?.upstream?.method && detail?.upstream?.status) {
		return `Update rejected by upstream (${detail.upstream.method} ${detail.upstream.status}).`;
	}

	return message;
}

export async function getManageProducts() {
	try {
		const response = await fetch(API_BASE_URL, {
			cache: "no-store",
			headers: {
				"Cache-Control": "no-cache",
				Pragma: "no-cache",
			},
		});

		if (!response.ok) {
			return [];
		}

		const data = await response.json();
		return extractProducts(data);
	} catch (error) {
		console.error("Error fetching managed products:", error);
		return [];
	}
}

export async function createManageProduct(payload) {
	try {
		const response = await fetch(API_BASE_URL, {
			method: "POST",
			cache: "no-store",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const detail = await parseJson(response);
			throw new Error(detail?.message ?? "Failed to create product.");
		}

		const data = await response.json();
		return extractProduct(data);
	} catch (error) {
		console.error("Error creating product:", error);
		throw error;
	}
}

export async function updateManageProduct(productId, payload) {
	try {
		const response = await fetch(`${API_BASE_URL}/${productId}`, {
			method: "PATCH",
			cache: "no-store",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const detail = await parseJson(response);
			const message = extractErrorMessage(detail, "Failed to update product.");
			throw new Error(`${message} (status ${response.status})`);
		}

		const data = await response.json();
		return extractProduct(data);
	} catch (error) {
		console.error(`Error updating product ${productId}:`, error);
		throw error;
	}
}

export async function deleteManageProduct(productId) {
	try {
		const response = await fetch(`${API_BASE_URL}/${productId}`, {
			method: "DELETE",
			cache: "no-store",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const detail = await parseJson(response);
			throw new Error(detail?.message ?? "Failed to delete product.");
		}

		return true;
	} catch (error) {
		console.error(`Error deleting product ${productId}:`, error);
		throw error;
	}
}
