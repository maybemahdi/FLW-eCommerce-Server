/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "@/app/errors/AppError";
import prisma from "@/shared/prisma";
import { StatusCodes } from "http-status-codes";
import { ICreateProduct, IProductFilterRequest } from "./product.interface";
import { IPaginationOptions } from "@/app/interfaces/pagination";
import { paginationHelper } from "@/helpers/paginationHelper";
import { Prisma } from "@prisma/client";
import { productSearchAbleFields } from "./product.constant";

const createProduct = async (payload: ICreateProduct) => {
  const product = await prisma.product.create({
    data: payload,
  });
  return product;
};

const updateProduct = async (
  id: string,
  payload: Partial<ICreateProduct>,
  imageUrls: string[] | null,
) => {
  const isProductExist = await prisma.product.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  if (!isProductExist) {
    throw new AppError(StatusCodes.NOT_FOUND, "Product not found!");
  }
  if (imageUrls && imageUrls.length > 0) {
    payload.images?.push(...imageUrls);
  }
  const product = await prisma.product.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return product;
};

const getAllProducts = async (
  params: IProductFilterRequest,
  options: IPaginationOptions,
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: Prisma.ProductWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: productSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }

  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.ProductWhereInput = { AND: andConditions };

  const products = await prisma.product.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options?.sortBy && options?.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
  });
  const total = await prisma.product.count({
    where: whereConditions,
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: products,
  };
};

const getSingleProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id: id,
      isDeleted: false,
    },
  });
  return product;
};

export const ProductService = {
  createProduct,
  updateProduct,
  getAllProducts,
  getSingleProduct,
};
