import NextAuth from "next-auth";
import { authOptions } from "./options";

// This file is the main entry point for NextAuth.js authentication in our application.
//  It exports a handler function that NextAuth.js will use to handle authentication requests.
//  The handler function is created by calling the NextAuth function and passing in our authentication options, which we defined in the options.ts file.
//  The handler function is then exported as both GET and POST, which means it will handle both GET and POST requests to the /api/auth/[...nextauth] endpoint.
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
