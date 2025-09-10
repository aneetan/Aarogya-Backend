import z, { email } from "zod";

export const registerUserSchema = z.object({
    body: z.object({
        fullName: z.string()
            .min(5, "Full name must be at least 5 characters")
            .max(100, "Full name must be less that 100 characters"),
        email: z.string()
            .email("Invalid email address"),
        password: z.string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[a-z]/, "Password must contain at least one lowercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
        role: z.enum(["user", "local_body"]),
        confirmPassword: z.string()
    }).refine(data => data.password === data.confirmPassword, {
        message: "Password doesn't match",
        path: ["confirmPassword"]
    })
});

export const loginUserSchema = z.object({
   body: z.object({
      email: z.string()
         .email("Invalid email address"),
      password: z.string()
         .min(8, "Password must be at least 8 characters")
         .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
         .regex(/[a-z]/, "Password must contain at least one lowercase letter")
         .regex(/[0-9]/, "Password must contain at least one number")
   })
})

export const updateUserData = z.object({
   body: registerUserSchema.shape.body.partial()
}) 

export type RegisterUserInput = z.infer<typeof registerUserSchema>
export type LoginUserInput = z.infer<typeof loginUserSchema>
export type UpdateUserData = z.infer<typeof updateUserData>