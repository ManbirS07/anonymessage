//todo: implement caching for this endpoint
import { apiJson } from "@/src/helper/verifyApiResponse"
import prisma from "@/src/lib/db";
export async function POST(request: Request) {
    const { username } = await request.json()

    if (!username) {
        return apiJson({
            success: false,
            responseMessage: "Username is required."
        }, 400)
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return apiJson({
                success: false,
                responseMessage: "Username does not exist."
            }, 404);
        }

        return apiJson({
            success: true,
            responseMessage: "Username exists.",
        }, 200);
    } catch (error) {
        return apiJson({
            success: false,
            responseMessage: "Error checking username existence. Please try again later."
        }, 500);
    }
}