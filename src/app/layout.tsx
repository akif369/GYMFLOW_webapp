import type { Metadata } from 'next';
import ThemeRegistry from '@/components/ThemeRegistry';

export const metadata: Metadata = {
  title: 'GymFlow Admin',
  description: 'Manage your Gym, Members, and Operations effortlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Load Outfit font via standard link tag — avoids build-time network requirement */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning style={{ margin: 0, padding: 0, fontFamily: "'Outfit', 'Inter', 'Roboto', sans-serif" }}>
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
