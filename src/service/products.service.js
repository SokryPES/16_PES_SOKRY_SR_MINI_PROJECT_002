const TOP_SELLING_URL = "https://homework-api.noevchanmakara.site/api/v1/products/top-selling";

async function requestTopSelling(accessToken) {
  return fetch(TOP_SELLING_URL, {
    cache: "no-store",
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  });
}

function normalizeTopSellingPayload(data) {
  const apiItems = data?.payload ?? data?.data ?? data;
  return Array.isArray(apiItems) ? apiItems : [];
}

export const getBestSellers = async (accessToken) => {
  try {
    let response = await requestTopSelling(accessToken);

    // Some tokens can be expired/invalid for this endpoint; retry publicly.
    if (response.status === 401 && accessToken) {
      response = await requestTopSelling();
    }

    if (!response.ok) {
      console.warn(`Failed to fetch top-selling products: ${response.status}.`);
      return [];
    }

    const data = await response.json();
    return normalizeTopSellingPayload(data);
  } catch (error) {
    console.error("Error fetching top-selling products:", error);
    return [];
  }
};
