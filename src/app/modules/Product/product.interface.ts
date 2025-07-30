import { Availability, Gender, Material } from "@prisma/client";

export interface ICreateProduct {
  productCode: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  images: string[];

  categoryId: string;
  brandId: string;

  gender: Gender;
  material: Material;

  colors: string[];
  sizes: string[];

  availability?: Availability;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  isDeleted?: boolean;
}

export interface IProductFilterRequest {
  searchTerm?: string;
  category?: string;
  brand?: string;
  gender?: string;
  material?: string;
}