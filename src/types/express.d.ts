import { GoogleUser } from 'src/auth/auth.controller';

interface AuthenticatedRequest extends Request {
  user: GoogleUser;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: GoogleUser;
  }
}
