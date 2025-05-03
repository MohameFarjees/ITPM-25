// Backend - Add these routes to userRouter.js
import express from 'express'
import { loginUser, registerUser, adminLogin, getAllUsers, updateUser, deleteUser } from '../controllers/userController.js'
import adminAuth from '../middleware/adminAuth.js'

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.post('/admin', adminLogin)

// New admin routes with adminAuth middleware
userRouter.get('/all', adminAuth, getAllUsers)
userRouter.put('/update/:id', adminAuth, updateUser)
userRouter.delete('/delete/:id', adminAuth, deleteUser)

export default userRouter