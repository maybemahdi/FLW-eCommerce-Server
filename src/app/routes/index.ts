import { Router } from "express";
import AuthRoutes from "../modules/Auth/auth.route";
import ProductRoutes from "../modules/Product/product.route";

const router = Router();
const routes = [
  {
    path: "/auth",
    destination: AuthRoutes,
  },
  {
    path: "/products",
    destination: ProductRoutes,
  }
];

routes.forEach((route) => router.use(route.path, route.destination));
export default router;
