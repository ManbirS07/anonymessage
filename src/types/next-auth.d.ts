import "next-auth"

declare module "next-auth" {
    interface User {
        id: string
        isVerified: boolean
        isAcceptingMessages: boolean
        username: string
    }

    interface Session {
        user: {
            id: string
            isVerified: boolean
            isAcceptingMessages: boolean
            username: string
        } & DefaultSession["user"] // This means that the user object in the session will have all the default fields (name, email, image) plus the custom fields we added (id, isVerified, isAcceptingMessages, username)
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        isVerified: boolean
        isAcceptingMessages: boolean
        username: string
    }
}
