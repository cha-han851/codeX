import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
export const authOptions = {
  // Configure one or more authentication providers
  providers: [
	GoogleProvider({
	  clientId: process.env.CLIENT_ID || "",
	  clientSecret: process.env.CLIENT_SECRET || ""
	})
  ],
  callbacks: {
	async jwt({ token, account }: any) {
		// Persist the OAuth access_token to the token right after signin
		if (account) {
			token.accessToken = account.access_token
		}
		return token
	  },
	async session({ session, token, user }:any) {
		// Send properties to the client, like an access_token from a provider.
		session.user.accessToken = token.accessToken;
		session.user.id = token.sub;
		await fetch(process.env.NEXT_PUBLIC_APP_URL+'/api/v1/confirm', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				data: token
			})
		})
		return session
	  }
  },
}
export default NextAuth(authOptions)