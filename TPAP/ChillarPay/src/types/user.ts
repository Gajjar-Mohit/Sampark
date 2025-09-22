import z from "zod";

export const CreateUserRequest = z.object({
  contactNo: z.string().min(10).max(10),
  name: z.string().min(2).max(50),
  email: z.string().min(5).max(50),
});