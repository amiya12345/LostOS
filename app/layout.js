import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react"

export default function RootLayout({ children }) {
  return (
    
    <html lang="en">
      
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>LostOS: The OS of Degens</title>
        <meta name="description" content="LostOS: The operating system for degens" />
      </head>
      <body className="">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}