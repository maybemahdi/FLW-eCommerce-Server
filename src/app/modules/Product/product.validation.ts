import { Availability, Gender, Material } from "@prisma/client";
import { z } from "zod";

export const CreateProductSchema = z.object({
  productCode: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().nonnegative(),
  discountPrice: z.number().nonnegative(),
  images: z.array(z.string().url()).optional(),

  categoryId: z.string().min(1),
  brandId: z.string().min(1),

  gender: z.enum([...(Object.values(Gender) as [string, ...string[]])]),
  material: z.enum([...(Object.values(Material) as [string, ...string[]])]),

  colors: z.array(z.string()).min(1),
  sizes: z.array(z.string()).min(1),

  availability: z
    .enum([...(Object.values(Availability) as [string, ...string[]])])
    .optional(),
  isNewArrival: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();
