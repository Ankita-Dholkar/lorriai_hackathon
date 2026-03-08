import express from 'express'
import { 
  createShipment, 
  getShipments, 
  getCarriers, 
  extractReceipt, 
  generateOTP, 
  verifyDelivery,
  requestInvoice,
  approveInvoice,
  deleteShipment
} from '../controllers/shipmentController.js'
import { protect } from '../middleware/authMiddleware.js'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' }) // Temp stoarge before forwarding

const router = express.Router()

router.post('/', protect, createShipment)
router.get('/', protect, getShipments)
router.delete('/:id', protect, deleteShipment)
router.post('/extract', protect, upload.single('receipt'), extractReceipt)
router.get('/carriers', protect, getCarriers)

// Delivery PoD Routes
router.post('/:id/deliver/generate-otp', protect, generateOTP)
router.post('/:id/deliver/verify', protect, verifyDelivery)

// Invoice Routes
router.post('/:id/request-invoice', protect, upload.fields([
  { name: 'tollReceipt', maxCount: 1 },
  { name: 'fuelReceipt', maxCount: 1 }
]), requestInvoice)
router.patch('/:id/approve-invoice', protect, approveInvoice)

export default router
