import prisma from "@/src/lib/db";
import { apiJson } from "@/src/helper/verifyApiResponse";

export async function POST(request: Request) {
    try {
        const { username, verifyCode } = await request.json();

        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return Response.json({
                success: false,
                responseMessage: "No user found with this email. Please check the email and try again."
            }, { status: 400 })
        }

        const isCodeValid = user.verifyCode === verifyCode && user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();
        
        const isCodenotExpired = user.verifyCodeExpiry && user.verifyCodeExpiry > new Date();

        if(isCodeValid && isCodenotExpired) {
            user.isVerified = true;
            await prisma.user.update({
                where: { username },
                data: { isVerified: true }
            })

            return apiJson({
                success: true,
                responseMessage: "Email verified successfully. You can now login to your account."
            }, 200)
        }

        if (!isCodeValid) {
            return apiJson({
                success: false,
                responseMessage: "Invalid verification code. Please check the code and try again."
            }, 400)
        }

        if (!isCodenotExpired) {
            return apiJson({
                success: false,
                responseMessage: "Verification code has expired. Please request a new code and try again."
            }, 400)
        }

    }    catch (error) {
        return apiJson({
            success: false,
            responseMessage: "An error occurred while verifying the code. Please try again later."
        }, 500)
    }
}