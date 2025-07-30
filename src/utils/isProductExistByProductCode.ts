import AppError from "@/app/errors/AppError";
import prisma from "@/shared/prisma";
import { StatusCodes } from "http-status-codes";

const isProductExistByProductCode = async (productCode: string) => {
  const isProductExist = await prisma.product.findUnique({
    where: {
      productCode: productCode,
      isDeleted: false,
    },
  });

  if (isProductExist) {
    throw new AppError(StatusCodes.CONFLICT, "Product already exist!");
  }
};
export default isProductExistByProductCode;