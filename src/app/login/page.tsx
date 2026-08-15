import type { Metadata } from 'next';
import LoginPageClient from './LoginPageClient';

export const metadata: Metadata = {
  title: 'Login | GYMatrix Admin',
  description: 'Secure sign in for GYMatrix staff and administrators.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string | string[] }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirect =
    typeof resolvedSearchParams.redirect === 'string'
      ? resolvedSearchParams.redirect
      : resolvedSearchParams.redirect?.[0];

  return <LoginPageClient redirectTo={redirect ?? null} />;
}
