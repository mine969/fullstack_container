import { Outfit, Bangers } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

export const metadata = {
  title: "Burger Delivery",
  description: "Best burgers in town",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${bangers.variable} antialiased bg-cream-50 text-brown-900`}
      >
        {children}
      </body>
    </html>
  );
}
