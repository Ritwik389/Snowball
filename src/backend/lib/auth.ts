import { NextAuthOptions } from "next-auth";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "./mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./mongodb";
import User from "@/backend/models/User";
import bcrypt from "bcryptjs";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Snowball Account",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const normalizedEmail = credentials.email.trim().toLowerCase();
          const normalizedPassword = credentials.password.trim();

          if (!normalizedEmail || !normalizedPassword) {
            return null;
          }

          await dbConnect();

          const user = await User.findOne({
            email: {
              $regex: `^${escapeRegExp(normalizedEmail)}$`,
              $options: "i",
            },
          }).select("+password");

          if (!user || !user.password) {
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(normalizedPassword, user.password);

          if (!isPasswordCorrect) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (err) {
          console.error("[auth] Credentials authorize failed:", err);
          throw err;
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
  },
  logger: {
    error(code, metadata) {
      console.error("[next-auth] Error:", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth] Warn:", code);
    },
    debug(code, metadata) {
      console.debug("[next-auth] Debug:", code, metadata);
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const user = session.user as typeof session.user & { id?: string };
        user.id = token.sub ?? undefined;
      }
      return session;
    },
  },
};
