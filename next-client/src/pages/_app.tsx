import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import Head from 'next/head';

function MyApp({ Component, pageProps:{ session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
				<link
					rel="canonical"
					href={process.env.NEXT_PUBLIC_VERCEL_URL}
					key="canonical"
					/>
			</Head>
      <Component {...pageProps} />
    </SessionProvider>
  )
}

export default MyApp
