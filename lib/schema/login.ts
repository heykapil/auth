import { z } from "zod"
export const loginSchemaCredentials = z.object({
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  })
})

export const loginSchemaUsernameCredentials = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  })
})

export const loginSchemaMagicLink = z.object({
  email: z.string().email("Enter a valid email.")
})

export const signUpSchema = z.object({
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  email: z.string().email("Enter a valid email."),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
  image: z.string().optional()

})
