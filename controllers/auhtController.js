import { comparePassword, hashpassword } from "../helpers/authHelper.js";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js"
import jwt from 'jsonwebtoken';

export const registerController = async (req, res) => {
    try {
        const { name, email, password, phone, address, answer } = req.body
        // validation

        if (!name) {
            return res.send({ mesaage: 'name is required' })
        }
        if (!email) {
            return res.send({ mesaage: 'email is required' })
        }
        if (!password) {
            return res.send({ mesaage: 'password is required' })
        }
        if (!phone) {
            return res.send({ mesaage: 'phone number is required' })
        }
        if (!address) {
            return res.send({ mesaage: 'address is required' })
        }
        if (!answer) {
            return res.send({ mesaage: 'answer is required' })
        }

        const existinguser = await userModel.findOne({ email })
        //existing user validation
        if (existinguser) {
            return res.status(200).send({
                success: false,
                message: 'This user ID is alredy in use'
            })
        }

        //register user
        const hashedPassword = await hashpassword(password)
        //save
        const user = await new userModel({
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            answer
        }).save()

        res.status(201).send({
            success: true,
            message: 'User registered successfully',
            user
        })




    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: 'Error in registeration',
            error
        })
    }
};

//POST LOGIN
export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body
        //validation
        if (!email || !password) {
            return res.status(404).send({
                success: false,
                message: "Invalid email or password"
            })
        }

        //check user
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.status(404).send({
                success: false,
                message: 'Email is not registered'
            })
        }

        const match = await comparePassword(password, user.password)

        if (!match) {
            return res.status(200).send({
                success: false,
                message: 'Invalid password'
            })
        }

        //TOKEN

        const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        })

        res.status(200).send({
            success: true,
            message: 'Login successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role
            },
            token,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error in login",
            error
        })
    }
};

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
    try {
        const { email, answer, newPassword } = req.body
        if (!email) {
            res.status(400).send({ mesaage: 'Email is required' })
        }
        if (!answer) {
            res.status(400).send({ mesaage: 'answer is required' })
        }
        if (!newPassword) {
            res.status(400).send({ mesaage: 'New password is required' })
        }

        //check

        const user = await userModel.findOne({ email, answer })
        // validation
        if (!user) {
            return res.status(404).send({
                success: false,
                mesaage: 'Wrong Email or Answer'
            })
        }

        const hashed = await hashpassword(newPassword)
        await userModel.findByIdAndUpdate(user._id, { password: hashed })
        res.status(200).send({
            success: true,
            mesaage: "Password reset successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            error
        })
    }
}

// Test controller
export const testController = (req, res) => {
    res.send('protected routes')
}

//update profile controller
export const updateProfileController = async (req, res) => {
    try {
        const { name, email, password, address, phone } = req.body
        const user = await userModel.findById(req.user._id)
        // password
        if (password && password.length < 6) {
            return res.json({ error: 'password is requird and password minimum length should 6' })
        }

        const hashedPassword = password ? await hashpassword(password) : undefined
        const updatedUser = await userModel.findByIdAndUpdate(req.user._id, {
            name: name || user.name,
            password: hashedPassword || user.password,
            phone: phone || user.phone,
            address: address || user.address
        }, { new: true })

        res.status(200).send({
            success: true,
            mesaage: 'Profile updated successfully',
            updatedUser
        })
    } catch (error) {
        console.log(error)
        res.status(400).send({
            success: false,
            message: "Error while updating profile",
            error
        })
    }
}


//orders

export const getOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ buyer: req.user._id })
            .populate("products", "-image")
            .populate("buyer", "name")
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error while getting order details",
            error
        })
    }
}

// all orders admin dashboard

export const getAllOrdersController = async (req, res) => {
    try {
        const orders = await orderModel
            .find({})
            .populate("products", "-image")
            .populate("buyer", "name")
            .sort({ createdAt: "-1" })
        res.json(orders)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Error while getting order details",
            error
        })
    }
}

// order status

export const orderStatusController = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body
        const orders = await orderModel.findByIdAndUpdate(orderId, { status }, { new: true })
        res.json(orders);
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            mesaage: 'Error while updating order',
            error
        })
    }
}

//get all users

export const getAllUsersController = async (req, res) => {
    try {
        const users = await userModel.find({})
        res.status(200).send({
            success: true,
            message: 'All users',
            users
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: 'Error while getting all users'
        })
    }
}
