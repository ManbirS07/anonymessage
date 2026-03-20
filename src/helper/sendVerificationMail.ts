import VerificationEmail from "@/src/emails/VerificationEmail";
import resend from "../lib/resend";
import { ApiResponse } from "../types/ApiResponse";

export default async function sendVerificationMail(email:string, username: string, verifyCode: string) : Promise<ApiResponse> {
    try {
        console.log("Sending verification email to:", email, "for username:", username);
        const response = await resend.emails.send({
            from: "Manbir <onboarding@resend.dev>", 
            to: email,
            subject: "Verify your email for Anonymessage",
            react: VerificationEmail({ username, otp: verifyCode }) //react component that returns jsx to be shown to user in email
        })

        console.log("Email sent successfully:", response);
        return {
            success: true,
            responseMessage: "Verification email sent successfully"
        }
    } catch (error) {
        console.error("Error sending verification email:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        return {
            success: false,
            responseMessage: "Failed to send verification email. Please try again later."
        }
    }
}

