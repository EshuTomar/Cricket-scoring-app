import type React from "react"
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Cricket Scoring App</title>
      </head>
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif", backgroundColor: "#f5f5f5" }}>{children}</body>
    </html>
  )
}
