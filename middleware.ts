import { withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';

export default withAuth(
  function middleware(req) {
    // Add custom logic here if needed
    return;
  },
  {
    callbacks: {
      authorized: async ({ token, req }) => {
        // Allow access if logged in
        return !!token;
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - signin, signup, reset-password, verify-email (public auth pages)
     * - unauthorized (public error page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|signin|signup|reset-password|verify-email|unauthorized|_next/static|_next/image|favicon.ico|.*\\..*$|.*\\.svg$).*)',
  ],
};
