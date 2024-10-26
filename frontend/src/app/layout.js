import localFont from "next/font/local";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "./_components/Navbar";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Weather App",
  description: "Get latest Weather updates",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 to-slate-800`}
      >
        <Navbar/>
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
