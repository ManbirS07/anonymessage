//resend functionality
//a new 6 digit code will be generated and updated in the database, then mail will be sent to user with new code
import prisma from "@/src/lib/db";
import sendVerificationMail from "@/src/helper/sendVerificationMail";

export async function POST(request: Request) {
    try {
        const expiryTime = new Date(); //object
        expiryTime.setHours(expiryTime.getHours() + 1); //otp expires in 1 hour
        const resentCode = Math.floor(100000 + Math.random() * 900000).toString(); // random 6 digit code converted to string

        const { username } = await request.json();
        const user = await prisma.user.findUnique({ where: { username } });

        //edge case: if user tries to resend code without signing up, toh user null hoga, toh us case me error denge ki user not found
        if (!user) {
            return Response.json({
                success: false,
                responseMessage: "User not found. Please sign up first."
            }, { status: 404 })
        }

        //update user with new code and expiry time
        user.verifyCode = resentCode;
        user.verifyCodeExpiry = expiryTime;
        await prisma.user.update({ where: { username }, data: user });

        //send verification email with new code
        await sendVerificationMail(user.email, username, resentCode);

        return Response.json({
            success: true,
            responseMessage: "Verification code resent successfully."
        });

    } catch (error) {
        console.error("Error resending verification code:", error);
        return Response.json({
            success: false,
            responseMessage: "An error occurred while resending the verification code. Please try again later."
        }, { status: 500 })
    }
}
