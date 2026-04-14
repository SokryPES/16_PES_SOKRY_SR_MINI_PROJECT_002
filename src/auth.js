import CredentialsProvider from "next-auth/providers/credentials";
import { loginService } from "./server/auth.service";

export const authOptions = {
	secret: process.env.BETTER_AUTH_SECRET || process.env.NEXTAUTH_SECRET,
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/login",
	},
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) {
					return null;
				}

				const data = await loginService({
					email: credentials.email,
					password: credentials.password,
				});

				const token = data?.payload?.token;

				if (!token) {
					return null;
				}

				const userPayload = data?.payload?.user ?? {};

				return {
					id: String(userPayload.id ?? credentials.email),
					email: userPayload.email ?? credentials.email,
					token,
					...userPayload,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.accessToken = user.token;
				token.user = {
					id: user.id,
					email: user.email,
				};
			}

			return token;
		},
		async session({ session, token }) {
			if (session.user && token.user) {
				session.user.id = token.user.id;
				session.user.email = token.user.email;
			}

			session.accessToken = token.accessToken;

			return session;
		},
	},
};

export default authOptions;
