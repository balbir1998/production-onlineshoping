import slugify from "slugify"
import productModel from "../models/productModel.js"
import categoryModel from "../models/categoryModel.js"
import fs from 'fs'
import braintree from "braintree"
import orderModel from "../models/orderModel.js"
import dotenv from "dotenv"

dotenv.config();

//payment getway
var gateway = new braintree.BraintreeGateway({
    environment: braintree.Environment.Sandbox,
    merchantId: process.env.BRAINTREE_MERCHENT_ID,
    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
    privateKey: process.env.BRAINTREE_PRIVATE_KEY,
});


export const createProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { image } = req.files

        //validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Product name is required' })
            case !description:
                return res.status(500).send({ error: 'Description is required' })
            case !price:
                return res.status(500).send({ error: 'Price is required' })
            case !category:
                return res.status(500).send({ error: 'Category is required' })
            case !quantity:
                return res.status(500).send({ error: 'quantity is required' })
            case image && image.size > 1000000:
                return res.status(500).send({ error: 'Image is required and should be less than 1mb' })
        }
        const products = new productModel({ ...req.fields, slug: slugify(name) })
        if (image) {
            products.image.data = fs.readFileSync(image.path)
            products.image.contentType = image.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'Product addedd successfully',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in adding product"
        })
    }
}


//get all products

export const getProductController = async (req, res) => {
    try {
        const products = await productModel.find({}).populate('category').select("-image").limit(12).sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            totalCount: products.length,
            message: 'All Products',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in getting products',
            error: error.message,
        })
    }
}

//get single product

export const getSingleProductController = async (req, res) => {
    try {
        const product = await productModel.findOne({ slug: req.params.slug }).select("-image").populate('category')
        res.status(200).send({
            success: true,
            message: 'Single product fecthed',
            product
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while getting single product',
            error
        })
    }
}

//get product image

export const productImageController = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid).select("image");
        if (product.image.data) {
            res.set("Content-type", product.image.contentType)
            return res.status(200).send(product.image.data)
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while getting product image',
            error
        })
    }
}

//delete product controller

export const deleteProductController = async (req, res) => {
    try {
        await productModel.findByIdAndDelete(req.params.pid).select("-image")
        res.status(200).send({
            success: true,
            message: "Product deleted successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error while delete product',
            error
        })
    }
}

//upadate product controller
export const updateProductController = async (req, res) => {
    try {
        const { name, slug, description, price, category, quantity, shipping } = req.fields
        const { image } = req.files

        //validation
        switch (true) {
            case !name:
                return res.status(500).send({ error: 'Product name is required' })
            case !description:
                return res.status(500).send({ error: 'Description is required' })
            case !price:
                return res.status(500).send({ error: 'Price is required' })
            case !category:
                return res.status(500).send({ error: 'Category is required' })
            case !quantity:
                return res.status(500).send({ error: 'quantity is required' })
            case image && image.size > 1000000:
                return res.status(500).send({ error: 'Image is required and should be less than 1mb' })
        }
        const products = await productModel.findByIdAndUpdate(req.params.pid, {
            ...req.fields, slug: slugify(name)
        }, { new: true })
        if (image) {
            products.image.data = fs.readFileSync(image.path)
            products.image.contentType = image.type
        }
        await products.save()
        res.status(201).send({
            success: true,
            message: 'Product updated successfully',
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in updating product"
        })
    }
}

// product filter controller

export const productFilterController = async (req, res) => {
    try {
        const { checked, radio } = req.body
        let args = {}
        if (checked.length > 0) args.category = checked
        if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] }
        const products = await productModel.find(args)
        res.status(200).send({
            success: true,
            products
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error while filtering products',
            error
        })
    }
}


//product count controller

export const productCountController = async (req, res) => {
    try {
        const total = await productModel.find({}).estimatedDocumentCount()
        res.status(200).send({
            success: true,
            total
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: 'Error in product count'
        })
    }
}

//product list base on page

export const productListController = async (req, res) => {
    try {
        const perPage = 6
        const page = req.params ? req.params.page : 1
        const products = await productModel
            .find({})
            .select("-image")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .sort({ createdAt: -1 })
        res.status(200).send({
            success: true,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: 'Error in per page ctrl',
            error
        })
    }
}

// search product

export const searchProductController = async (req, res) => {
    try {
        const { keyword } = req.params
        const results = await productModel.find({
            $or: [
                { name: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } }
            ]
        }).select("-image")
        res.json(results)
    } catch (error) {
        console.log(error)
        res.status(400).status({
            success: false,
            message: "Error in search product"
        })
    }
}

// similar product

export const relatedProductController = async (req, res) => {
    try {
        const { pid, cid } = req.params
        const products = await productModel.find({
            category: cid,
            _id: { $ne: pid }
        }).select("-image").limit(4).populate("category")
        res.status(200).send({
            success: true,
            products
        })

    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error while getting related prodcts",
            error
        })
    }
}

//get product by category
export const productCategoryController = async (req, res) => {
    try {
        const category = await categoryModel.findOne({ slug: req.params.slug })
        const products = await productModel.find({ category }).populate('category')
        res.status(200).send({
            success: true,
            category,
            products
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            error,
            message: "Error while getting product by category"
        })
    }
}

// payment getway api
// token
export const braintreeTokenController = async (req, res) => {
    try {
        gateway.clientToken.generate({}, function (err, respose) {
            if (err) {
                res.status(500).send(err)
            } else {
                res.send(respose);
            }
        })
    } catch (error) {
        console.log(error)
    }
}


// payment
export const braintreePaymentController = async (req, res) => {
    try {
        const { cart, nonce } = req.body
        let total = 0
        cart.map((i) => {
            total += i.price
        })
        let newTransaction = gateway.transaction.sale({
            amount: total,
            paymentMethodNonce: nonce,
            options: {
                submitForSettlement: true
            }
        },
            function (error, result) {
                if (result) {
                    const order = new orderModel({
                        products: cart,
                        payment: result,
                        buyer: req.user._id
                    }).save()
                    res.json({ ok: true })
                } else {
                    res.status(500).send(error)
                }
            }
        )
    } catch (error) {
        console.log(error)
    }
}
