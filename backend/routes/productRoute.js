import express from 'express'
import { addProduct, listProducts, removeProduct, updateProduct, singleProduct } from '../controllers/productController.js'
import upload from '../middleware/multer.js'
import adminAuth from '../middleware/adminAuth.js'

const productRouter = express.Router()

// Routes
productRouter.post('/add', adminAuth, upload.fields([{ name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }, { name: 'image4', maxCount: 1 }]), addProduct)
productRouter.get('/list', listProducts)
productRouter.post('/remove', adminAuth, removeProduct)
productRouter.post('/update', adminAuth, updateProduct)
productRouter.post('/single', singleProduct)

export default productRouter