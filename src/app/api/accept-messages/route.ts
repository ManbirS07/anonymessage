import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import prisma from "@/src/lib/db";
import { User } from "@/src/model/User";
import { apiJson } from "@/src/helper/verifyApiResponse";

// API route to accept messages from users, only authenticated users can access this route
// This route will update the user's isAcceptingMessages field to true, allowing them to receive messages from other 
// this is for the user, not sender


//function if user wants to toggle between accepting and not accepting messages -> toggle button in the dashboard
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return apiJson({
                success: false,
                responseMessage: "Unauthorized. Please log in to access this resource."
            }, 401)
        }

        const user: User = session.user
        const userId = user.id

        //flag that will be used to determine if the user is accepting messages or not, this will be sent in the request body from the client
        const {acceptingMessages} = await request.json();

        try {
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { isAcceptingMessages: acceptingMessages }
            })

            //token me bhi toh update karna padega, otherwise the user would have to log out and log in again to see the changes in the session
            //I added a trigger update in the options to update the session whenever user is updated
            //well ye sab ke liye session se depend rehne se acha we can directly query the database instead of stale data in the session, but I want to minimize the number of database queries, so I will update the session as well
            if(!updatedUser) {
                return apiJson({
                    success: false,
                    responseMessage: "User not found. Please check your account and try again."
                }, 404)
            }

            return apiJson({
                success: true,
                responseMessage: acceptingMessages ? "You are now accepting messages from other users." : "You are no longer accepting messages from other users.",
                isAcceptingMessages: updatedUser.isAcceptingMessages
            }, 200)

        } catch (error) {
            return apiJson({
                success: false,
                responseMessage: "An error occurred while processing your request. Please try again later."
            }, 500)
        }

    } catch (error) {
        return apiJson({
            success: false,
            responseMessage: "An error occurred while processing your request. Please try again later."
        }, 500)
    }
}


//for the recipient, I will check his acceptance status before sending a message

//function for the user if he toggles and to check his status
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);    
        if (!session || !session.user || !session.user.email) {
            return apiJson({
                success: false,
                responseMessage: "Unauthorized. Please log in to access this resource."
            }, 401)
        }

        const user: User = session.user
        const userId = user.id

        try {
            const currentUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { isAcceptingMessages: true }
            })

            if (!currentUser) {
                return apiJson({
                    success: false,
                    responseMessage: "User not found. Please check your account and try again."
                }, 404)
            }

            return apiJson({
                success: true,
                responseMessage: "User status retrieved successfully.",
                isAcceptingMessages: currentUser.isAcceptingMessages
            }, 200)

        } catch (error) {
            return apiJson({
                success: false,
                responseMessage: "An error occurred while processing your request. Please try again later."
            }, 500)
        }
    } catch (error) {
        return apiJson({
            success: false,
            responseMessage: "An error occurred while processing your request. Please try again later."
        }, 500)
    }
}