/* eslint-disable @typescript-eslint/no-explicit-any */
import AppError from "@/app/errors/AppError";
import catchAsync from "@/shared/catchAsync";
import sendResponse from "@/shared/sendResponse";
import { v2 as cloudinary } from "cloudinary";
import { StatusCodes } from "http-status-codes";
import { ProductService } from "./Product.service";
import pick from "@/shared/pick";
import { productFilterableFields } from "./product.constant";

const createProduct = catchAsync(async (req, res) => {
  const files = req.files as any;

  if (!files || files.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Please upload at least one image!",
    );
  }

  const imageUrls: string[] = [];

  for (const file of files) {
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          resource_type: "image",
          public_id: `${Date.now()}-${file.originalname}`,
        },
        (error, result) => {
          if (error) return reject(error);
          if (result && result.secure_url) {
            imageUrls.push(result.secure_url);
          }
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  }

  // upload images through s3
  // const imageUrls: string[] = await Promise.all(
  //   files.map((file) =>
  //     fileUploadToS3(
  //       req.body.name,
  //       "products",
  //       file.originalname,
  //       file.mimetype,
  //       file.path,
  //     ),
  //   ),
  // );

  const result = await ProductService.createProduct({
    ...req.body,
    images: imageUrls,
  });
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Product created successfully!",
    data: result,
  });
});

const updateProduct = catchAsync(async (req, res) => {
  const files = req.files as any;

  const imageUrls: string[] = [];

  for (const file of files) {
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "products",
          resource_type: "image",
          public_id: `${Date.now()}-${file.originalname}`,
        },
        (error, result) => {
          if (error) return reject(error);
          if (result && result.secure_url) {
            imageUrls.push(result.secure_url);
          }
          resolve(result);
        },
      );
      stream.end(file.buffer);
    });
  }

  const result = await ProductService.updateProduct(
    req.params.id,
    req.body,
    imageUrls,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product updated successfully!",
    data: result,
  });
});

const getAllProducts = catchAsync(async (req, res) => {
  const filters = pick(req.query, productFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await ProductService.getAllProducts(filters, options);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Products retrieved successfully!",
    meta: result?.meta,
    data: result?.data,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const result = await ProductService.getSingleProduct(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Product retrieved successfully!",
    data: result,
  });
});

export const ProductController = {
  createProduct,
  updateProduct,
  getAllProducts,
  getSingleProduct,
};
