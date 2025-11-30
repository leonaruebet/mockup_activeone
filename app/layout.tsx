import type { ReactNode } from 'react';
import './globals.css';
import '@shared/ui/design-system/styles/globals.css';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: 'ActiveOne - Fitness Class Booking',
  description: 'Book fitness classes across Bangkok with ActiveOne',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans min-h-screen text-foreground antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
