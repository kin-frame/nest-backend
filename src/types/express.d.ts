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
