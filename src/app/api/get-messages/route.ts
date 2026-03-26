import { getServerSession } from "next-auth";
import prisma from "@/src/lib/db";
import { apiJson } from "@/src/helper/verifyApiResponse";
import { User } from "@/src/model/User";
import { authOptions } from "../auth/[...nextauth]/options";


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

        //implementing pagination for messages, to avoid sending all messages at once if the user has many messages
        const url = new URL(request.url);
        //the url is something like /api/get-messages?page=1 we need to extract the page query parameters for pagination
        //we can also ask the user for the page size, and the query would be /api/get-messages?page=1&pageSize=10 
        const pageParam = Number(url.searchParams.get("page") || "1")
        const pageSizeParam = Number(url.searchParams.get("pageSize") || "5")

        const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
        // Cap pageSize to avoid heavy queries from very large values.
        const pageSize = Number.isInteger(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 50): 5
        const skip = (page - 1) * pageSize //offset

        //SELECT * FROM messages
        //WHERE userId = userId
        //ORDER BY createdAt DESC
        //LIMIT pageSize OFFSET skip

        try {
            //fetch messages for the user with pagination, ordered by createdAt in descending order (newest messages first)
            const [userMessages, totalMessages] = await prisma.$transaction([
                prisma.message.findMany({
                    where: { userId },
                    orderBy: { createdAt: "desc" }, //newest messages first
                    skip, //this is the offset, i.e how many messages to skip based on the current page
                    take: pageSize
                }),
                prisma.message.count({
                    where: { userId }
                })
            ])

            const totalPages = Math.max(1, Math.ceil(totalMessages / pageSize))

            return apiJson({
                success: true,
                responseMessage: "Messages retrieved successfully.",
                messages: userMessages,
                pagination: {
                    page,
                    pageSize,
                    totalMessages,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
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