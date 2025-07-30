/* eslint-disable @typescript-eslint/no-explicit-any */
import auth from "@/app/middlewares/auth";
import validateRequest from "@/app/middlewares/validateRequest";
import { memoryUpload } from "@/utils/cloudinary/sendImageToCloudinary";
import isProductExistByProductCode from "@/utils/isProductExistByProductCode";
import { UserRole } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import { ProductController } from "./product.controller";
import { CreateProductSchema, UpdateProductSchema } from "./product.validation";

const ProductRoutes = Router();

ProductRoutes.post(
  "/",
  auth(UserRole.ADMIN),
  // s3Uploader.array("images", 5),
  memoryUpload.array("images", 5),
  async (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req?.body?.data);
    await isProductExistByProductCode(req?.body?.productCode);
    next();
  },
  validateRequest(CreateProductSchema),
  ProductController.createProduct,
);

ProductRoutes.patch(
  "/:id",
  auth(UserRole.ADMIN),
  // s3Uploader.array("images", 5),
  memoryUpload.array("images", 5),
  async (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req?.body?.data);
    next();
  },
  validateRequest(UpdateProductSchema),
  ProductController.updateProduct,
);

ProductRoutes.get(
  "/",
  ProductController.getAllProducts,
);

ProductRoutes.get("/:id", ProductController.getSingleProduct);

export default ProductRoutes;
