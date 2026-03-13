//the route for this is /api/signup
//app holds all the server components

//if user exists, and is verified, return error saying user already exists
//if user exists but is not verified, generate new otp, update user and send mail again
// if user does not exist, create user, generate otp and send mail
import prisma from "@/src/lib/db";
import bcrypt from "bcryptjs";
import sendVerificationMail from "@/src/helper/sendVerificationMail";

//while writing apis in nextjs, we can export functions named after http methods (GET, POST, PUT, DELETE etc.) and nextjs will automatically use them as handlers for requests with those methods to this route
//means what type of request this function will handle, in this case POST requests to /api/signup will be handled by the POST function we export here
export async function POST(request: Request) {
    try {
        //check if user with this username exists
        const { username, email, password } = await request.json(); 

        let user = await prisma.user.findUnique({ where: { username } });
        if (user) {
            return Response.json({
                success: false,
                responseMessage: "User with this username already exists. Please choose a different username."
            }, { status: 400 })
        }

        //hash the password before saving to db for security reasons
        const hashedPassword = await bcrypt.hash(password, 10);
        const expiryTime = new Date(); //object
        expiryTime.setHours(expiryTime.getHours() + 1); //otp expires in 1 hour
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // random 6 digit code converted to string


        let userByEmail = await prisma.user.findUnique({ where: { email } });
        if (userByEmail) {
            //case 2
            if (userByEmail.isVerified) {
                return Response.json({
                    success: false,
                    responseMessage: "User with this email already exists. Please use a different email or login to your account."
                }, { status: 400 })
            } else {
                //generate new otp, update user and send mail again
                userByEmail.password = hashedPassword;
                userByEmail.verifyCode = verifyCode;
                userByEmail.verifyCodeExpiry = expiryTime;

                try {
                    await prisma.user.update({
                        where: { email },
                        data: {
                            password: hashedPassword,
                            verifyCode: verifyCode,
                            verifyCodeExpiry: expiryTime
                        }
                    })
                } catch (error) {
                    console.error("Error updating user:", error);
                    return Response.json({
                        success: false,
                        responseMessage: "An error occurred while updating the user. Please try again later."
                    }, 
                    { 
                        status: 500 
                    });
                }
            }
        }

        try {
            user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                verifyCode:verifyCode,
                verifyCodeExpiry: expiryTime,
                isAcceptingMessages: false,
                messages: {}
            }
        });

        await sendVerificationMail(email, username, verifyCode); //send mail after creating user
        return Response.json({
            success: true,
            responseMessage: "User created successfully. Please check your email for the verification code."
        }, { status: 201}
    )
        } catch (error) {
            console.error("Error creating user:", error);
            return Response.json({
                success: false,
                responseMessage: "An error occurred while creating the user. Please try again later."
            }, 
            { 
                status: 500 
            });
        }

        

    } catch (error) {
        console.error("Error in signup route:", error);
        return Response.json({
            success: false,
            responseMessage: "An error occurred during signup. Please try again later."
        }, { status: 500 });
    }
}

