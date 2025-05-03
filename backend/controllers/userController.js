import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

// Function to create token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET_KEY)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // Checking user exists or not
        const user = await userModel.findOne({ email })
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Checking password
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = createToken(user._id)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid password' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })   
    }
}

// Route for user registration
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Checking user already exists or not
        const exists = await userModel.findOne({ email })
        if (exists) {
            return res.json({ success: false, message: 'User already exists' })
        }

        // Validating email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: 'Invalid email' })
        }

        // Validating password
        if (password.length < 8) {
            return res.json({ success: false, message: 'Password should be at least 8 characters long' })
        }

        // Hashing password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Creating user object
        const newUser = new userModel({
            name,
            email,
            password: hashedPassword
        })

        // Saving user to database
        const user = await newUser.save()

        const token = createToken(user._id)

        res.json({ success: true, token })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })   
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // Checking admin email and password
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET_KEY)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: 'Invalid email or password' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })   
    }   
}


// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, { password: 0 }) // Exclude password field
        res.json({ success: true, users })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email } = req.body
        
        // Check if user exists
        const user = await userModel.findById(id)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // Validate email if changed
        if (email !== user.email) {
            if (!validator.isEmail(email)) {
                return res.json({ success: false, message: 'Invalid email' })
            }
            
            // Check if new email already exists
            const emailExists = await userModel.findOne({ email, _id: { $ne: id } })
            if (emailExists) {
                return res.json({ success: false, message: 'Email already in use' })
            }
        }

        // Update user
        const updatedUser = await userModel.findByIdAndUpdate(
            id, 
            { name, email },
            { new: true, runValidators: true }
        ).select('-password')
        
        res.json({ success: true, user: updatedUser })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        
        // Check if user exists
        const user = await userModel.findById(id)
        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }
        
        // Delete user
        await userModel.findByIdAndDelete(id)
        
        res.json({ success: true, message: 'User deleted successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export { loginUser, registerUser, adminLogin, getAllUsers, updateUser, deleteUser }