import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Intelligence Fusion Platform — DBMS Mini Project',
  description: 'Multi-Agency Investigation and Intelligence Information Fusion System by Saatvik Gupta & Satyam Goyal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
      </head>
      <body className="bg-[#0B1120] text-[#F1F5F9] min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
