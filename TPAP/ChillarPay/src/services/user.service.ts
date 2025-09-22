import prisma from "../db";

export const createUser = async (
  contactNo: string,
  name: string,
  email: string
) => {
  if (contactNo.length < 10 || contactNo.length > 10) {
    throw new Error("Invalid contact number");
  }
  if (name.length < 2 || name.length > 50) {
    throw new Error("Invalid name");
  }
  if (email.length < 5 || email.length > 50) {
    throw new Error("Invalid email");
  }

  const ifUserExists = await prisma.user.findFirst({
    where: {
      phone: contactNo,
    },
  });

  if (ifUserExists) {
    throw new Error("User already exists");
  }

  const user = await prisma.user.create({
    data: {
      name,
      phone: contactNo,
      email,
    },
  });

  return user;
};
