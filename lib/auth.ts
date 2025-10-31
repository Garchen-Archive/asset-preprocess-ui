import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db/client";
import { users, credentials as credentialsTable } from "./db/schema";
import { eq } from "drizzle-orm";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "admin" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("=== LOGIN ATTEMPT ===");
        console.log("Username:", credentials?.username);

        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // Find user credentials by username
          const [userCred] = await db
            .select({
              credId: credentialsTable.id,
              userId: credentialsTable.userId,
              username: credentialsTable.username,
              password: credentialsTable.password,
              userName: users.name,
              userEmail: users.email,
              userRole: users.role,
            })
            .from(credentialsTable)
            .innerJoin(users, eq(credentialsTable.userId, users.id))
            .where(eq(credentialsTable.username, credentials.username))
            .limit(1);

          if (!userCred) {
            console.log("User not found:", credentials.username);
            return null;
          }

          console.log("User found:", userCred.username);
          console.log("Stored hash:", userCred.password);

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            userCred.password
          );

          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: userCred.userId,
            name: userCred.userName,
            email: userCred.userEmail || userCred.username,
            role: userCred.userRole,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
