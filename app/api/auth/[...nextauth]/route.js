import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

import User from "@/models/UserModal";
import { connectDB } from "@/lib/dbConnect";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        await connectDB();

        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error("User not found");

        if (!user.password) {
          throw new Error(
            "Account exists via Google. Please login with Google."
          );
        }

        const valid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!valid) throw new Error("Invalid password");

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          isProfileCompleted: user.isProfileCompleted,
          provider: "credentials",
          image: user.userImage || null,  
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async signIn({ user, account, profile }) {
      await connectDB();

      let existing = await User.findOne({ email: user.email });

      if (!existing) {
        const parts = user.name.trim().split(" ");
        const firstName = parts[0] || "";
        const lastName = parts.slice(1).join(" ");

        const seed = encodeURIComponent(`${firstName} ${lastName}`.trim());
        const userImage = `https://api.dicebear.com/5.x/initials/svg?seed=${seed}`;

        existing = await User.create({
          name: user.name || profile?.name,
          email: user.email,
          password: null,
          role: "user",
          provider: account.provider,
          isProfileCompleted: false,
          userImage:  {
            secure_url:userImage
          },  
        });
      }
      user.name = existing?.name;
      user.id = existing?._id?.toString();
      user.email=existing?.email;
      user.role = existing?.role;
      user.isProfileCompleted = existing?.isProfileCompleted;
      user.image = existing?.userImage?.secure_url;  
        console.log("User -> ",user)
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user?.id;
        token.email = user?.email;
        token.role = user?.role;
        token.isProfileCompleted = user?.isProfileCompleted;
        token.name = user?.name;
        token.image = user?.image; 
      }
      console.log("JWT CALLED", { trigger });
      if (trigger === "update" && session?.user) {
        console.log("upadted session... ",session?.user)
        token.email = session.user.email ?? token.email; 
        token.role = session.user.role ?? token.role;
        token.isProfileCompleted =
          session.user.isProfileCompleted ?? token.isProfileCompleted;
        token.name = session.user.name ?? token.name;
        token.image = session.user.image ?? token.image;  
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token?.id,
        email: token?.email,
        name: token?.name,
        role: token?.role,
        isProfileCompleted: token?.isProfileCompleted,
        image: token?.image,  
      };
      return session;
    },
  },
}
const handler = NextAuth(authOptions);
 
export { handler as GET, handler as POST };
