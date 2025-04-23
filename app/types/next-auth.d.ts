import 'next-auth';

declare module 'next-auth' {
  interface User {
    role: string;
    twoFactorEnabled?: boolean;
    twoFactorVerified?: boolean;
    sessionStart?: number;
  }

  interface Session {
    user: User & {
      role: string;
      twoFactorEnabled?: boolean;
      twoFactorVerified?: boolean;
      sessionStart?: number;
    };
  }
} 