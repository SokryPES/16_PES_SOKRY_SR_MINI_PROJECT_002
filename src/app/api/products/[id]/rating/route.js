import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "../../../../../auth";

const API_BASE_URL = "https://homework-api.noevchanmakara.site/api/v1/products";

function extractRatingValue(data) {
  const ratingValue = data?.payload?.rating ?? data?.payload?.star ?? data?.rating ?? data?.star;
  if (ratingValue === undefined || ratingValue === null) {
    return null;
  }

  const parsed = Number(ratingValue);
  return Number.isFinite(parsed) ? parsed : null;
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

export async function GET(_request, { params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    return NextResponse.json({ message: "Product id is required." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  try {
    const response = await fetch(`${API_BASE_URL}/${productId}/rating?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
    });

    if (!response.ok) {
      return NextResponse.json({ message: "Failed to fetch rating." }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ rating: extractRatingValue(data) }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Failed to fetch rating." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const resolvedParams = await params;
  const productId = resolvedParams?.id;

  if (!productId) {
    return NextResponse.json({ message: "Product id is required." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const accessToken = session?.accessToken;

  if (!accessToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const fromQuery = Number(url.searchParams.get("star") ?? url.searchParams.get("rating"));

  let requestedRating = Number.isFinite(fromQuery) ? fromQuery : null;

  if (requestedRating === null) {
    try {
      const body = await request.json();
      const fromBody = Number(body?.rating ?? body?.star);
      requestedRating = Number.isFinite(fromBody) ? fromBody : null;
    } catch {
      requestedRating = null;
    }
  }

  if (!Number.isFinite(requestedRating)) {
    return NextResponse.json({ message: "Rating is required." }, { status: 400 });
  }

  const normalizedRating = Math.max(1, Math.min(5, Math.round(requestedRating)));

  const requestConfigs = [
    { method: "PATCH", url: `${API_BASE_URL}/${productId}/rating?star=${normalizedRating}` },
    { method: "PATCH", url: `${API_BASE_URL}/${productId}/rating`, body: { rating: normalizedRating } },
    { method: "PATCH", url: `${API_BASE_URL}/${productId}/rating`, body: { star: normalizedRating } },
    { method: "PATCH", url: `${API_BASE_URL}/${productId}/rating`, body: { value: normalizedRating } },
    { method: "PUT", url: `${API_BASE_URL}/${productId}/rating`, body: { rating: normalizedRating } },
    { method: "PUT", url: `${API_BASE_URL}/${productId}/rating`, body: { star: normalizedRating } },
    { method: "POST", url: `${API_BASE_URL}/${productId}/rating`, body: { rating: normalizedRating } },
    { method: "POST", url: `${API_BASE_URL}/${productId}/rating`, body: { star: normalizedRating } },
    { method: "POST", url: `${API_BASE_URL}/${productId}/rating`, body: { value: normalizedRating } },
    { method: "PATCH", url: `${API_BASE_URL}/${productId}/rating?rating=${normalizedRating}` },
    { method: "PUT", url: `${API_BASE_URL}/${productId}/rating?rating=${normalizedRating}` },
    { method: "PUT", url: `${API_BASE_URL}/${productId}/rating?star=${normalizedRating}` },
    { method: "POST", url: `${API_BASE_URL}/${productId}/rating/${normalizedRating}` },
    { method: "PUT", url: `${API_BASE_URL}/${productId}/rating/${normalizedRating}` },
    { method: "PATCH", url: `${API_BASE_URL}/${productId}/rating/${normalizedRating}` },
  ];

  try {
    let lastFailure = null;

    for (const config of requestConfigs) {
      const response = await fetch(config.url, {
        method: config.method,
        cache: "no-store",
        headers: {
          ...(config.body ? { "Content-Type": "application/json" } : {}),
          Authorization: `Bearer ${accessToken}`,
        },
        ...(config.body ? { body: JSON.stringify(config.body) } : {}),
      });

      if (!response.ok) {
        const failData = await parseResponseSafely(response);
        lastFailure = {
          method: config.method,
          url: config.url,
          status: response.status,
          detail: failData,
        };
        continue;
      }

      const data = await parseResponseSafely(response);
      const rating = extractRatingValue(data) ?? normalizedRating;
      return NextResponse.json({ rating }, { status: 200 });
    }

    return NextResponse.json(
      {
        message: "Failed to update rating.",
        upstream: lastFailure,
      },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update rating.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}