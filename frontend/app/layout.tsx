import type React from "react"
import type { Metadata } from "next"
import { Outfit } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"

const outfit = Outfit({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ericsson Data Visualization",
  description: "Advanced Ericsson request data visualization and analysis",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <Providers>
            <main className="min-h-screen bg-gradient-to-b from-ericsson-background-dark to-ericsson-background">
              {children}
            </main>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
