import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../auth";

const API_BASE_URL = "https://homework-api.noevchanmakara.site/api/v1/products";

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

function extractPayload(data) {
  return data?.payload ?? data?.data ?? data;
}

function buildAuthHeader(accessToken) {
  const raw = String(accessToken ?? "").trim();
  if (!raw) {
    return null;
  }

  return raw.toLowerCase().startsWith("bearer ") ? raw : `Bearer ${raw}`;
}

function normalizeCategoryId(value) {
  const next = String(value ?? "").trim();
  return next || null;
}

function buildUpdatePayload(body = {}) {
  const payload = {};
  const productName = String(body?.productName ?? body?.name ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const imageUrl = String(body?.imageUrl ?? body?.image ?? "").trim();
  const price = Number(body?.price);
  const categoryId = normalizeCategoryId(body?.categoryId);
  const colors = normalizeVariantList(body?.colors ?? body?.color);
  const sizes = normalizeVariantList(body?.sizes ?? body?.size);

  if (productName) {
    payload.productName = productName;
    payload.name = productName;
  }

  if (description) {
    payload.description = description;
  }

  if (Number.isFinite(price)) {
    payload.price = price;
  }

  if (categoryId) {
    payload.categoryId = categoryId;
  }

  if (imageUrl) {
    payload.imageUrl = imageUrl;
    payload.image = imageUrl;
  }

  if (colors.length > 0) {
    payload.colors = colors;
    payload.color = colors;
  }

  if (sizes.length > 0) {
    payload.sizes = sizes;
    payload.size = sizes;
  }

  return payload;
}

function buildUpdatePayloadVariants(body = {}) {
  const normalized = buildUpdatePayload(body);
  const productName = String(body?.productName ?? body?.name ?? "").trim();
  const description = String(body?.description ?? "").trim();
  const imageUrl = String(body?.imageUrl ?? body?.image ?? "").trim();
  const price = Number(body?.price);
  const categoryId = normalizeCategoryId(body?.categoryId);
  const colors = normalizeVariantList(body?.colors ?? body?.color);
  const sizes = normalizeVariantList(body?.sizes ?? body?.size);
  const firstColor = colors[0] ?? "";
  const firstSize = sizes[0] ?? "";

  const normalizedWithStringVariants = {
    ...normalized,
    ...(colors.length > 0 ? { color: colors.join(",") } : {}),
    ...(sizes.length > 0 ? { size: sizes.join(",") } : {}),
  };

  const minimalPayload = {
    ...(productName ? { name: productName } : {}),
    ...(description ? { description } : {}),
    ...(Number.isFinite(price) ? { price } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(firstColor ? { color: firstColor } : {}),
    ...(firstSize ? { size: firstSize } : {}),
  };

  const minimalProductNamePayload = {
    ...(productName ? { productName } : {}),
    ...(description ? { description } : {}),
    ...(Number.isFinite(price) ? { price } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(firstColor ? { color: firstColor } : {}),
    ...(firstSize ? { size: firstSize } : {}),
  };

  return [
    normalized,
    { product: normalized },
    minimalPayload,
    { product: minimalPayload },
    minimalProductNamePayload,
    { product: minimalProductNamePayload },
    normalizedWithStringVariants,
    body,
    { product: body },
  ].filter((item) => item && Object.keys(item).length > 0);
}

async function fetchExistingProduct(productId, authHeader) {
  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await parseResponseSafely(response);
    return extractPayload(data);
  } catch {
    return null;
  }
}

function mergeWithExistingProduct(existingProduct = {}, body = {}) {
  const existingName = String(existingProduct?.productName ?? existingProduct?.name ?? "").trim();
  const nextName = String(body?.productName ?? body?.name ?? "").trim() || existingName;

  const existingDescription = String(existingProduct?.description ?? "").trim();
  const nextDescription = String(body?.description ?? "").trim() || existingDescription;

  const nextPriceRaw = Number(body?.price);
  const existingPriceRaw = Number(existingProduct?.price);
  const nextPrice = Number.isFinite(nextPriceRaw)
    ? nextPriceRaw
    : (Number.isFinite(existingPriceRaw) ? existingPriceRaw : undefined);

  const nextCategoryRaw = normalizeCategoryId(body?.categoryId);
  const existingCategoryRaw = normalizeCategoryId(existingProduct?.categoryId);
  const nextCategoryId = nextCategoryRaw || existingCategoryRaw || undefined;

  const incomingImage = String(body?.imageUrl ?? body?.image ?? "").trim();
  const existingImage = String(existingProduct?.imageUrl ?? existingProduct?.image ?? "").trim();
  const nextImage = incomingImage || existingImage;

  const incomingColors = normalizeVariantList(body?.colors ?? body?.color);
  const existingColors = normalizeVariantList(existingProduct?.colors ?? existingProduct?.color);
  const nextColors = incomingColors.length > 0 ? incomingColors : existingColors;

  const incomingSizes = normalizeVariantList(body?.sizes ?? body?.size);
  const existingSizes = normalizeVariantList(existingProduct?.sizes ?? existingProduct?.size);
  const nextSizes = incomingSizes.length > 0 ? incomingSizes : existingSizes;

  return {
    ...(nextName ? { productName: nextName, name: nextName } : {}),
    ...(nextDescription ? { description: nextDescription } : {}),
    ...(Number.isFinite(nextPrice) ? { price: nextPrice } : {}),
    ...(nextCategoryId ? { categoryId: nextCategoryId } : {}),
    ...(nextImage ? { imageUrl: nextImage, image: nextImage } : {}),
    ...(nextColors.length > 0 ? { colors: nextColors, color: nextColors } : {}),
    ...(nextSizes.length > 0 ? { sizes: nextSizes, size: nextSizes } : {}),
  };
}

async function parseResponseSafely(response) {
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

export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    return NextResponse.json({ message: "Product id is required." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const authHeader = buildAuthHeader(session?.accessToken);

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    let body = {};

    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const existingProduct = await fetchExistingProduct(productId, authHeader);
    const mergedBody = existingProduct ? mergeWithExistingProduct(existingProduct, body) : body;
    const payloadVariants = buildUpdatePayloadVariants(mergedBody);
    const requestConfigs = payloadVariants.flatMap((payloadVariant) => [
      { method: "PATCH", url: `${API_BASE_URL}/${productId}`, body: payloadVariant },
      { method: "PUT", url: `${API_BASE_URL}/${productId}`, body: payloadVariant },
      { method: "POST", url: `${API_BASE_URL}/${productId}`, body: payloadVariant },
    ]);

    let lastFailure = null;
    let bestFailure = null;
    const failures = [];

    for (const config of requestConfigs) {
      try {
        const response = await fetch(config.url, {
          method: config.method,
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify(config.body),
        });

        if (!response.ok) {
          const failure = {
            method: config.method,
            url: config.url,
            status: response.status,
            detail: await parseResponseSafely(response),
          };

          failures.push(failure);
          lastFailure = failure;

          if (!bestFailure) {
            bestFailure = failure;
          } else if ((bestFailure.status === 401 || bestFailure.status === 403) && !(failure.status === 401 || failure.status === 403)) {
            bestFailure = failure;
          }

          continue;
        }

        const data = await parseResponseSafely(response);
        return NextResponse.json({ product: extractPayload(data) }, { status: 200 });
      } catch (error) {
        const failure = {
          method: config.method,
          url: config.url,
          status: 502,
          detail: {
            message: error instanceof Error ? error.message : "Upstream fetch failed",
          },
        };

        failures.push(failure);
        lastFailure = failure;
        if (!bestFailure) {
          bestFailure = failure;
        }
      }
    }

    const failureToReturn = bestFailure ?? lastFailure;

    return NextResponse.json(
      {
        message: "Failed to update product.",
        upstream: failureToReturn,
        attempts: requestConfigs.length,
        sampledFailures: failures.slice(0, 3),
      },
      { status: failureToReturn?.status ?? 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update product.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request, { params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    return NextResponse.json({ message: "Product id is required." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const authHeader = buildAuthHeader(session?.accessToken);

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${productId}`, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const detail = await parseResponseSafely(response);
      return NextResponse.json(
        { message: "Failed to delete product.", detail },
        { status: response.status },
      );
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to delete product.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}