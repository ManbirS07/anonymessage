import prisma from "@/src/lib/db";
import { apiJson } from "@/src/helper/verifyApiResponse";


export async function POST(request: Request) {
    //any user can send a message, we dont need to authenticate in order to send a message, but to view messages they must be autheticated
    // const session = await getServerSession(authOptions)

    //  if (!session || !session.user || !session.user.email) {
    //             return apiJson({
    //                 success: false,
    //                 responseMessage: "Unauthorized. Please log in to access this resource."
    //         }, 401)
    //     }
    
    // const user: User = session.user

    const { username, message } = await request.json()

    if (!username || !message) {
        return apiJson({
            success: false,
            responseMessage: "Username and message are required."
        }, 400)
    }

    //find if the recipient exists and is valid
    const recipient = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            isAcceptingMessages: true
        }
    })
    
    if (!recipient) {
        return apiJson({
            success: false,
            responseMessage: "Recipient not found. Please check the username and try again."
        }, 404)
    }

    //if the recipient is not accepting messages, the user cant send message to him
    if(!recipient.isAcceptingMessages) {
        return apiJson({
            success: false,
            responseMessage: "Recipient is not accepting messages right now."
        }, 404)
    }

    try {
        await prisma.user.update({
            where: { id: recipient.id },
            data: {
                messages: {
                    create: {
                        content: message
                    }
                }
            }
        })

        return apiJson({
            success: true,
            responseMessage: "Message sent successfully."
        }, 201)
    } catch (error) {
        return apiJson({
            success: false,
            responseMessage: "Error sending message. Please try again later."
        }, 500);
    }
}