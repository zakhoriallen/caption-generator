import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Video Caption Generator",
  description: "Upload videos and generate captions automatically.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.className} bg-purple-100 text-gray-900`}>
        <header className="p-4 bg-white shadow-md">
          <h1 className="text-xl font-bold">Caption Generator</h1>
        </header>

        <main className="p-4 max-w-3xl mx-auto">{children}</main>

        <footer className="p-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Caption Generator — Built with Next.js
        </footer>
      </body>
    </html>
  );
}
