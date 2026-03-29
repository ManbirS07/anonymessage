import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_KEY,
    },
    // Avoid hanging API requests when SMTP provider is slow/unreachable.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 30_000,
});

let isSmtpVerified = false;
let verifyInFlight: Promise<void> | null = null;

const verifySmtpConnection = async () => {
    if (isSmtpVerified) return;
    if (!verifyInFlight) {
        verifyInFlight = new Promise<void>((resolve, reject) => {
            transporter.verify((error, _success) => {
                if (error) {
                    console.error("SMTP connection failed:", error);
                    verifyInFlight = null;
                    reject(new Error(`SMTP connection failed: ${error.message}`));
                    return;
                }

                console.log("SMTP server is ready");
                isSmtpVerified = true;
                resolve();
            });
        });
    }

    await verifyInFlight;
};

const sendVerificationMail = async (email: string, username: string, otp: string) => {
    if (!process.env.SMTP_USERNAME || !process.env.SMTP_KEY || !process.env.SENDER_EMAIL) {
        throw new Error("Missing SMTP configuration: SMTP_USERNAME, SMTP_KEY, or SENDER_EMAIL");
    }

    await verifySmtpConnection();

    const mailOptions = {
        from: `"Anonymessage" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: "Verify your email to continue to Anonymessage!!",

        text: `Hi ${username}, your OTP is ${otp}. It will expire in 1 hour.`,

        html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Email Verification</h2>
        <p>Hi ${username},</p>
        <p>Your OTP is:</p>
        <h1 style="color: #4CAF50;">${otp}</h1>
        <p>This OTP will expire in 1 hour.</p>
      </div>
    `
    };

    const res = await transporter.sendMail(mailOptions);

    if (!res.accepted || res.accepted.length === 0) {
        throw new Error("Email provider did not accept the verification email");
    }
};

export default sendVerificationMail;