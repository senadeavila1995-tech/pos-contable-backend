import { Router } from "express";
import * as CategoryController from "./categories.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Todas las operaciones de categorías requieren autenticación
router.use(authMiddleware);

router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

export default router;
