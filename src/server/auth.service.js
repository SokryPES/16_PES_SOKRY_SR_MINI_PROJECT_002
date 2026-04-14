export const loginService = async (credentials) => {
	const response = await fetch(
		`${process.env.NEXT_PUBLIC_AUTH_BASE_URL}/auths/login`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(credentials),
			cache: "no-store",
		},
	);

	let data = null;

	try {
		data = await response.json();
	} catch {
		data = null;
	}

	if (!response.ok) {
		throw new Error(data?.message || "Login failed");
	}

	return data;
};
