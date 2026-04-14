import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../auth";

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

function normalizeProductPayload(body = {}) {
  const productName = String(body?.productName ?? body?.name ?? "").trim();
  const imageUrl = String(body?.imageUrl ?? body?.image ?? "").trim();

  return {
    productName,
    name: productName,
    description: String(body?.description ?? "").trim(),
    price: Number(body?.price ?? 0),
    categoryId: normalizeCategoryId(body?.categoryId),
    imageUrl: imageUrl || null,
    image: imageUrl || null,
    colors: normalizeVariantList(body?.colors ?? body?.color),
    color: normalizeVariantList(body?.colors ?? body?.color),
    sizes: normalizeVariantList(body?.sizes ?? body?.size),
    size: normalizeVariantList(body?.sizes ?? body?.size),
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

export async function GET() {
  const session = await getServerSession(authOptions);
  const authHeader = buildAuthHeader(session?.accessToken);

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(API_BASE_URL, {
      cache: "no-store",
      headers: {
        Authorization: authHeader,
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { message: "Failed to fetch products.", detail },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ products: extractPayload(data) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to fetch products.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  const authHeader = buildAuthHeader(session?.accessToken);

  if (!authHeader) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(normalizeProductPayload(body)),
    });

    if (!response.ok) {
      const detail = await parseResponseSafely(response);
      return NextResponse.json(
        { message: "Failed to create product.", detail },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json({ product: extractPayload(data) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create product.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}