import { Router } from "express";
import { createProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controller/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
// router.route('/product')
router
.route("/products")
.post(upload.fields([{ name: "image", maxCount: 1 }]),createProduct);


router.route('/products/:id').get(getProductById);
router.route('/products').get(getProducts);
router.route('/products/:id').delete(deleteProduct)

//update product
router.route('/products/:id').post(upload.fields([{ name: "image", maxCount: 1 }]),updateProduct)

export default router;
