// types/next-auth.d.ts or anywhere in your project
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    email: string;
    apikey?: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    apikey?: string;
  }
}