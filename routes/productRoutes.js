import express from "express"
import { isAdmin, requireSignIn } from './../middlewares/authMiddleware.js';
import {
    braintreePaymentController,
    braintreeTokenController,
    createProductController,
    deleteProductController,
    getProductController,
    getSingleProductController,
    productCategoryController,
    productCountController,
    productFilterController,
    productImageController,
    productListController,
    relatedProductController,
    searchProductController,
    updateProductController
} from "../controllers/productController.js";
import formidable from 'express-formidable';

const router = express.Router()

//routes
router.post('/create-product', requireSignIn, isAdmin, formidable(), createProductController)

//get products
router.get('/get-product', getProductController)

//get single product
router.get('/get-product/:slug', getSingleProductController)


//get product image
router.get('/product-image/:pid', productImageController)

//delete product
router.delete('/delete-product/:pid', requireSignIn, isAdmin, deleteProductController)

//update product
router.put('/update-product/:pid', requireSignIn, isAdmin, formidable(), updateProductController)

//filter product
router.post('/product-filter', productFilterController)


//product count
router.get('/product-count', productCountController)

//product on page
router.get('/product-list/:page', productListController)

//search product
router.get('/search/:keyword', searchProductController)

//similar product
router.get('/related-product/:pid/:cid', relatedProductController)

//category wise product
router.get('/product-category/:slug', productCategoryController)

// payment routes
// token
router.get('/braintree/token', braintreeTokenController)

//payments
router.post('/braintree/payment', requireSignIn, braintreePaymentController)

export default router