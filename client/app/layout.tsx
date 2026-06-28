import { Geist, Geist_Mono, DM_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { cn } from "@/lib/utils";
import Script from "next/script";

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans'})
 
const geist = Geist({
  subsets: ['latin'],
})
const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", dmSans.variable, geist.className)}
    >
      <head>
          <Script
          src="//unpkg.com/react-scan/dist/auto.global.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        <meta name="description" content="Instant Panel" />
        <title>Instant Panel</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://backend5.logicpay.in" />
        <link rel="dns-prefetch" href="https://backend5.logicpay.in" />
      </head>
      <body>
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}