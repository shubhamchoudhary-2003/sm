import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) {
            console.log("[auth] missing credentials");
            return null;
          }
          console.log("[auth] looking up:", credentials.username);
          const admin = await prisma.admin.findUnique({
            where: { username: credentials.username },
          });
          console.log("[auth] admin found:", !!admin);
          if (!admin) return null;
          const valid = await bcrypt.compare(credentials.password, admin.password);
          console.log("[auth] password valid:", valid);
          if (!valid) return null;
          return { id: admin.id, name: admin.username };
        } catch (e) {
          console.error("[auth] error:", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
};
