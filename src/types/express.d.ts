import { JwtPayload } from 'jsonwebtoken';

import { GoogleUser } from 'src/auth/auth.controller';

interface AuthenticatedRequest extends Request {
  user: GoogleUser;
}

interface AuthJwtPayload extends JwtPayload {
  id: number;
  email: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: GoogleUser;
    cookies?: { [key: string]: string }; // 👈 추가
    jwt: JwtPayload;
  }
}

export interface CustomJwtPayload extends JwtPayload {
  payload: {
    id: number; // 사용자 ID
    email: string; // 이메일
    role: string; // 권한
  };
}
