import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Carrom Game - 2 Player Board Game',
  description: 'Play the classic Carrom board game online with realistic physics and 2-player support. Enjoy strategic gameplay with authentic rules.',
  keywords: 'carrom, board game, 2 player, online game, physics, strategy',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}