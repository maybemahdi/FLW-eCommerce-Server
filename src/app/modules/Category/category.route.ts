import { Router } from "express";
import { CategoryController } from "./category.controller";
import validateRequest from "@/app/middlewares/validateRequest";
import { CreateCategorySchema } from "./category.validation";

const CategoryRoutes = Router();

CategoryRoutes.post(
  "/",
  validateRequest(CreateCategorySchema),
  CategoryController.createCategory,
);

export default CategoryRoutes;
