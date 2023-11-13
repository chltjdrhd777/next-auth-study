import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET;
  const session = await getToken({ req, secret }); // 로그인 한 상태라면

  console.log('session from middleware', session);

  if (session === null) {
    return NextResponse.rewrite(new URL('/failRedirect', req.url));
  } else {
    return NextResponse.rewrite(new URL('/result', req.url));
  }
}

export const config = {
  matcher: ['/result', '/testPage/:path*'],
};
