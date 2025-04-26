import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="">
      
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
