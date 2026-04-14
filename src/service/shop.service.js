function normalizeAccessToken(accessToken) {
  if (!accessToken) {
    return null;
  }

  const value = String(accessToken).trim();
  if (!value || value === "undefined" || value === "null") {
    return null;
  }

  return value;
}

function buildAuthHeaders(accessToken) {
  const safeToken = normalizeAccessToken(accessToken);
  return safeToken
    ? {
        Authorization: `Bearer ${safeToken}`,
      }
    : undefined;
}

async function fetchWithOptionalAuthRetry(url, accessToken) {
  const headers = buildAuthHeaders(accessToken);
  let response = await fetch(url, {
    cache: "no-store",
    headers,
  });

  if (response.status === 401 && headers) {
    response = await fetch(url, {
      cache: "no-store",
    });
  }

  return response;
}

export const getAllCategories = async (accessToken) => {
  const normalizeCategories = (items = []) =>
    items.map((item) => ({
      categoryId: item?.categoryId,
      categoryName: item?.categoryName ?? item?.name,
    }));

  try {
    const response = await fetchWithOptionalAuthRetry(
      "https://homework-api.noevchanmakara.site/api/v1/categories",
      accessToken,
    );

    if (!response.ok) {
      console.warn(`Failed to fetch categories: ${response.status}.`);
      return [];
    }

    const data = await response.json();
    const apiItems = data?.payload ?? data?.data ?? data;
    if (Array.isArray(apiItems)) {
      return normalizeCategories(apiItems);
    }

    return [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

//  ALL PRODUCT
export const getAllProducts = async (accessToken) => {
  const normalizeVariantList = (value) => {
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim())
        .filter(Boolean);
    }

    if (typeof value === "string") {
      return value
        .split(/[,/|]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const normalizeProducts = (items = []) =>
    items.map((item) => ({
      productId: item?.productId ?? item?.id ?? item?.uuid,
      productName: item?.productName ?? item?.name,
      name: item?.name ?? item?.productName,
      description: item?.description ?? "",
      colors: normalizeVariantList(item?.colors ?? item?.color),
      sizes: normalizeVariantList(item?.sizes ?? item?.size),
      star: item?.star ?? null,
      imageUrl: item?.imageUrl ?? null,
      price: item?.price ?? 0,
      categoryId: item?.categoryId,
    }));

  try {
    const response = await fetchWithOptionalAuthRetry(
      "https://homework-api.noevchanmakara.site/api/v1/products",
      accessToken,
    );

    if (!response.ok) {
      console.warn(`Failed to fetch products: ${response.status}.`);
      return [];
    }

    const data = await response.json();
    const apiItems = data?.payload ?? data?.data ?? data;

    if (Array.isArray(apiItems)) {
      return normalizeProducts(apiItems);
    }

    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

// GE T PRODUCT BY CATEGORY ID
export const getProductsByCategoryId = async (categoryId, accessToken) => {
  try {
    const response = await fetchWithOptionalAuthRetry(
      `https://homework-api.noevchanmakara.site/api/v1/categories/${categoryId}/products`,
      accessToken,
    );

    if (!response.ok) {
      console.warn(`Failed to fetch products for category ${categoryId}: ${response.status}.`);
      return [];
    }

    const data = await response.json();
    const apiItems = data?.payload ?? data?.data ?? data;

    if (Array.isArray(apiItems)) {
      return normalizeProducts(apiItems);
    }

    return [];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
};

export const getProductRating = async (productId, accessToken) => {
  if (!productId) {
    return null;
  }

  try {
    const response = await fetch(
      `/api/products/${productId}/rating?t=${Date.now()}`,
      {
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
      },
    );

    if (!response.ok) {
      console.warn(`Failed to fetch rating for product ${productId}: ${response.status}.`);
      return null;
    }

    const data = await response.json();
    const ratingValue = data?.payload?.rating ?? data?.payload?.star ?? data?.rating ?? data?.star;

    if (ratingValue === undefined || ratingValue === null) {
      return null;
    }

    const parsedRating = Number(ratingValue);
    return Number.isFinite(parsedRating) ? parsedRating : null;
  } catch (error) {
    console.error(`Error fetching rating for product ${productId}:`, error);
    return null;
  }
};

export const updateProductRating = async (productId, rating, accessToken) => {
  if (!productId || !Number.isFinite(Number(rating))) {
    return null;
  }

  const nextRating = Math.max(1, Math.min(5, Math.round(Number(rating))));
  try {
    const response = await fetch(`/api/products/${productId}/rating?star=${nextRating}`, {
      method: "PATCH",
      cache: "no-store",
      headers: {
        ...(accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn(
        `Failed to update rating for product ${productId}: ${response.status}. ${errorBody}`,
      );
      return null;
    }

    const data = await response.json();
    const ratingValue = data?.rating ?? data?.payload?.rating ?? data?.payload?.star ?? data?.star;
    const parsedRating = Number(ratingValue);
    return Number.isFinite(parsedRating) ? parsedRating : nextRating;
  } catch (error) {
    console.error(`Error updating rating for product ${productId}:`, error);
    return null;
  }
};


