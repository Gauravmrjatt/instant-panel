import { Geist_Mono, DM_Sans } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { cn } from "@/lib/utils";

const dmSans = DM_Sans({subsets:['latin'],variable:'--font-sans', display:'swap'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})
import { Roboto } from 'next/font/google'
 
const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
})
 
import { Geist } from 'next/font/google'
 
const geist = Geist({
  subsets: ['latin'],
})
export const metadata: Metadata = {
  title: "Earning Area - Campaign Management Dashboard",
  description: "Enterprise-grade campaign management and payment processing platform.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // className={cn(fontMono.variable, dmSans.variable)}
      className={geist.className}
    >
      <head>
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
