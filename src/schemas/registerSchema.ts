import {z} from "zod";

export const usernameValidation = z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");

export const registerSchema = z.object({
    username: usernameValidation,
    email: z.email({message: "Invalid email address"}),
    password: z.string().min(6, {message: "Password must be at least 6 characters long"}).max(100),
    confirmPassword: z.string().min(6, {message: "Confirm Password must be at least 6 characters long"}).max(100),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match"
});