import {z} from "zod";

export const verifyCodeSchema = z.string().length(6, {message: "Verification code must be 6 characters long"}).regex(/^\d+$/, "Verification code must contain only digits");