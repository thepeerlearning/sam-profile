import "./globals.css"
import type { Metadata } from "next"
import { Lora } from "next/font/google"

const lora = Lora({ subsets: ["latin"], variable: "--font-lora" })

export const metadata: Metadata = {
  title: "Sam Eseyin — Portfolio",
  description: "STEM educator & robotics advocate. Work and case studies.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={lora.variable}>
      <body>{children}</body>
    </html>
  )
}
