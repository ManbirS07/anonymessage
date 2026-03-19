import prisma from "@/src/lib/db";
import z from "zod";
import { usernameValidation } from "@/src/schemas/registerSchema";
import { apiJson } from "@/src/helper/verifyApiResponse";

// API route to check if a username is unique or not, used in the frontend to provide instant feedback to the user while registering
const usernameQuerySchema = z.object({
    username: usernameValidation
})

//backend me toh check kar hi rhe h
//this is ki username type karte karte user ko pata chal sakega ki ye username valid hai ya nahi, aur agar valid hai toh unique hai ya nahi

//eg url
//localhost:3000/api/check-username-unique?username=Manbir
//we need to get the param
export async function GET(request: Request) {

    if(request.method !== "GET") {
        return apiJson({
            success: false,
            responseMessage: "Method not allowed. Please use GET method to check username uniqueness."
        }, 405)
    }

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username") || ""
        } //object ke form me le rhe taaki usko zod schema se validate kar sake, kyuki zod schema object ke form me hi hota hai

        //queryparam is the object with the username we get from the url, we need to validate it using zod schema
        const parsedQuery = usernameQuerySchema.safeParse(queryParam);
        if (!parsedQuery.success) {
            return apiJson({
                success: false,
                responseMessage: "Invalid username. Please enter a valid username."
            }, 400)
        }

        const { username } = parsedQuery.data;

        //check only for verified users
        const user = await prisma.user.findUnique({ where: { username, isVerified: true } });

        if (user) {
            return apiJson({
                success: false,
                responseMessage: "Username is already taken. Please choose a different username."
            }, 400)
        }

        return apiJson({
            success: true,
            responseMessage: "Username is available."
        }, 200)
    } catch (error) {
        return apiJson({
            success: false,
            responseMessage: "An error occurred while checking the username. Please try again later."
        }, 500)
    }

}
