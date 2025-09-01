import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt, { TokenExpiredError } from 'jsonwebtoken';

export function middleware(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'minha_chave_secreta');
    return NextResponse.next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return NextResponse.json({ error: 'Token expirado' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/protegida/:path*'],
};
