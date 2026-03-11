import {z} from "zod";

//format validation before sending to the database
export const signInSchema = z.object({
    email: z.email(),
    password: z.string()
})