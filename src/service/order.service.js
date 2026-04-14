export async function getOrders() {
  const response = await fetch("/api/orders", {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Failed to fetch orders: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data?.orders) ? data.orders : [];
}

export async function createOrder(orderDetailRequests) {
  const response = await fetch("/api/orders", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderDetailRequests }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Failed to create order: ${response.status}`);
  }

  const data = await response.json();
  return data?.order ?? null;
}