import VerificationEmail from "@/src/emails/VerificationEmail";
import resend from "../lib/resend";
import { ApiResponse } from "../types/ApiResponse";

export default async function sendVerificationMail(username: string, email: string, verifyCode: string) : Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: "onboarding@resend.dev", 
            to: email,
            subject: "Verify your email for Anonymessage",
            react: VerificationEmail({ username, otp: verifyCode }) //react component that returns jsx to be shown to user in email
        })

        return {
            success: true,
            responseMessage: "Verification email sent successfully"
        }
    } catch (error) {
        console.error("Error sending verification email:", error);
        return {
            success: false,
            responseMessage: "Failed to send verification email. Please try again later."
        }
    }
}

