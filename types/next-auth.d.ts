import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    id?: string;
    name: string;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    access_token?: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    id?: string;
  }
}
