import config from "@/config";
import bcrypt from "@/libs/bcrypt";
import prisma from "@/shared/prisma";
import { UserRole } from "@prisma/client";

const payload = {
  name: "Admin",
  email: "mh7266391@gmail.com",
  phone: "1234567890",
  password: "12345678",
  role: UserRole.ADMIN,
};

export const seedSuperAdmin = async () => {
  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingSuperAdmin) {
    return;
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds),
  );

  await prisma.user.create({
    data: {
        ...payload,
        password: hashedPassword
    }
  });
};