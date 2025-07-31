import prisma from "@/shared/prisma";
import { ICreateCategory } from "./category.interface";
import AppError from "@/app/errors/AppError";
import { StatusCodes } from "http-status-codes";

const createCategory = async (payload: ICreateCategory) => {
  const isExist = await prisma.category.findUnique({
    where: {
      name: payload.name,
    },
  });
  if(isExist){
    throw new AppError(StatusCodes.CONFLICT, "Category already exist!");
  }
  const category = await prisma.category.create({
    data: payload,
  });
  return category;
};

const getCategories = async () => {
  const categories = await prisma.category.findMany();
  return categories;
};

export const CategoryService = {
  createCategory,
  getCategories,
};
