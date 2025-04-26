import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
      
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
