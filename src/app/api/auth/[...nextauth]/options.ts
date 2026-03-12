import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import prisma from "@/src/lib/db"

// Authentication Providers in NextAuth.js are services that can be used to sign in a user.
// Main ways user can be signed in:
// 1. Using a username and password (Credentials Provider)
// 2. Using an OAuth provider (Google, Facebook, etc.)


export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                //creates a form with the username and password fields
                email: { label: "Username", type: "text ", placeholder: "jsmith" },
                password: { label: "Password", type: "password" }   
            },

            async authorize(credentials, req) : Promise<any> {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Invalid credentials")
                }

                try {
                    const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }})

                    if(!user) {
                        throw new Error("No user found")
                    }

                    if(!user.isVerified) {
                        throw new Error("Please verify your email before signing in")   
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials")
                    }

                    //nextAuth stores the user object in a jwt token and a session cookie, so we need to return the user object here
                    return user

                } catch (error) {
                    throw new Error("Invalid credentials")
                }
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    // When authorize() returns the user, this callback receives it
    // and stores custom fields (id, isVerified, isAcceptingMessages, username) into the JWT token.

    // When getServerSession() or useSession() is called anywhere in your app,
    // this callback copies those fields from the token into the session object.

//     The flow is:
// User signs in → authorize() validates credentials and returns user
// jwt callback fires → stores id, isVerified, isAcceptingMessages, username in the token
// On any page/API call → session callback fires → copies those fields from token into session.user
    callbacks: {
        async jwt({ token, user }) {
            //try to send as much as user data possible via the token, so we don't have to query the database for it
            if (user) {
                token.id = user.id
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        },

        async session({ session, token }) {
            if (token) {
                session.user.id = token.id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        }
    }
}