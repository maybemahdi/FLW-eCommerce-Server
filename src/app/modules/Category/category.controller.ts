import catchAsync from "@/shared/catchAsync";
import { CategoryService } from "./category.service";
import { StatusCodes } from "http-status-codes";
import sendResponse from "@/shared/sendResponse";

const createCategory = catchAsync(async (req, res) => {
  const result = await CategoryService.createCategory(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Category created successfully!",
    data: result,
  });
});

export const CategoryController = {
  createCategory,
};
