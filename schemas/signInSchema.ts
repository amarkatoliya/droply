import { z } from "zod";

export const signInSchema = z.object({
    identifier: z
        .string()
        .min(1, { message: "email is required" })
        .email( { message: "please enter valid email" }),
    password: z
        .string()
        .min(1, { message: "password is required" })
        .min(8, { message: "min 8 character is required in pass" }),
});