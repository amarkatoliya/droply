import { z } from "zod";

export const signUpSchema = z.object({
    email: z
        .string()
        .min(1, { message: "email is required" })
        .email({ message: "please enter valid email" }),
    password: z
        .string()
        .min(1, { message: "password is required" })
        .min(8, { message: "min 8 character is required in pass" }),
    confpassword: z
        .string()
        .min(1, { message: "conform password is required" })
        .min(8, { message: "min 8 character is required in pass" }),
})
    .refine((data) => data.password === data.confpassword, {
        message: "password do not match",
        path: ["confpassword"]
    });