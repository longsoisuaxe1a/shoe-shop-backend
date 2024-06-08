const express = require("express");
const router = express.Router();
const { ProductController } = require("../controllers/index");
// add product
router.post("/add-product", ProductController.addProduct);
// delete product by id
router.delete("/delete-product-by-id/:_id", ProductController.deleteProductById);
// update product
router.patch(`/update-product/:_id`, ProductController.updateProduct);
// find product by id
router.post("/find-product-by-id", ProductController.findProductById);
// find all product
router.post("/find-all-product", ProductController.findAllProduct);
module.exports = router;
