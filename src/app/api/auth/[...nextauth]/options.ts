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
                //creates a form with the email and password fields
                email: { label: "email", type: "text ", placeholder: "jsmith@gmail.com" },
                password: { label: "password", type: "password" }   
            },

            async authorize(credentials) : Promise<any> {
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

                    if(user.isVerified == false) {
                        throw new Error("Please verify your email before signing in")   
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
                    if (!isPasswordValid) {
                        throw new Error("Invalid credentials")
                    }

                    //nextAuth stores the user object in a jwt token and a session cookie, so we need to return the user object here
                    return user

                } catch (error) {
                    throw new Error(error instanceof Error ? error.message : "An error occurred during authentication")
                }
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ],

// With strategy: "database":
// NextAuth creates a session record in the database. That record has a sessionToken, which is just a random string
// That same token is also stored in the browser cookie.
//  On later requests, NextAuth reads the cookie, finds the matching session row in the database, and knows which user is signed in.
    session: {
        strategy: "jwt",
        maxAge: 3 * 24 * 60 * 60, 
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/sign-in',
    }, 
    // When authorize() returns the user, this callback receives it
    // and stores custom fields (id, isVerified, isAcceptingMessages, username) into the JWT token.

    // When getServerSession() or useSession() is called anywhere in your app,
    // this callback copies those fields from the token into the session object.

//     The flow is:
// User signs in → authorize() validates credentials and returns user
// jwt callback fires → stores id, isVerified, isAcceptingMessages, username in the token
// On any page/API call → session callback fires → copies those fields from token into session.user
    callbacks: {
        async jwt({ token, user, trigger, session, account }) {
            //try to send as much as user data possible via the token, so we don't have to query the database for it
            if (user) {
                token.id = user.id
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }

            // If the session is being updated (e.g. user changes their username or message preferences), we want to update the token as well,
            //  so that the new values are reflected in the session without the user having to sign out and sign back in.
            if (trigger === "update") {
                token.username = session.username
                token.isAcceptingMessages = session.isAcceptingMessages
            }

             // For OAuth sign-ins, user object won't have all fields — fetch from DB
             if(account?.provider === "google" && !token.id) {
                try {
                    const dbUser = await prisma.user.findUnique({
                    where: { email: token.email as string },
                    select: { username: true, id: true, isAcceptingMessages: true, isVerified: true }
                })

                if(dbUser) {
                    token.username = dbUser.username
                    token.id = dbUser.id
                    token.isAcceptingMessages = dbUser.isAcceptingMessages
                    token.isVerified = dbUser.isVerified
                } 
                } catch (error) {
                    console.error("Error fetching user data for OAuth sign-in:", error)
                }
                
            }
            return token
        },

        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string
                session.user.isVerified = token.isVerified as boolean
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean
                session.user.username = token.username as string
            }
            return session
        },

        async signIn({ user, account}) {
  if (account?.provider === 'google') {
    try {
      const existingUser =  await prisma.user.findUnique({
                    where: { email: user.email as string },
                    select: { username: true, id: true, isAcceptingMessages: true, isVerified: true }
                })
      
      if (existingUser && existingUser.isVerified) {
        // Only let them in if they've signed up AND verified
        user.username = existingUser.username;
        user.id = existingUser.id;
        user.isAcceptingMessages = existingUser.isAcceptingMessages;
        return true;
      } 

      return false; // No user found, prevent sign-in and redirect to sign-in page where we can show an error message about needing to sign up first
    } catch (error) {
      console.error('Google sign in error:', error);
      return false;
    }
  }
  return true;
},
    }, 
}