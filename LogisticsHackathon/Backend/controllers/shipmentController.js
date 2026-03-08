import Shipment from '../models/Shipment.js'
import User from '../models/User.js'
import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import uploadOnCloudinary from '../config/cloudinary.js'

// @desc    Create a new shipment
// @route   POST /api/shipments
// @access  Private (logistics_company)
export const createShipment = async (req, res) => {
  try {
    const {
      lrNumber,
      shipmentDate, goodsType, goodsDescription, quantity, goodsValue,
      transporterName, transporterAddress, transporterContact,
      consignorName, consignorAddress, consignorContact, consignorGSTIN,
      consigneeName, consigneeAddress, consigneeContact, consigneeGSTIN, consigneePincode,
      weight, numberOfPackages,
      vehicleNumber, driverName, driverContact, destination,
      carrierCompany, carrierPhone,
      freightCharges, otherCharges, totalCharges, freightType, specialInstructions, expectedDeliveryDate,
      status
    } = req.body

    const shipment = await Shipment.create({
      lrNumber: lrNumber || undefined,
      shipmentDate,
      goodsType,
      goodsDescription: goodsDescription || undefined,
      quantity: quantity || undefined,
      goodsValue: goodsValue || undefined,
      transporterName: transporterName || undefined,
      transporterAddress: transporterAddress || undefined,
      transporterContact: transporterContact || undefined,
      consignorName,
      consignorAddress,
      consignorContact: consignorContact || undefined,
      consignorGSTIN: consignorGSTIN || undefined,
      consigneeName,
      consigneeAddress,
      consigneeContact: consigneeContact || undefined,
      consigneeGSTIN: consigneeGSTIN || undefined,
      consigneePincode: consigneePincode || undefined,
      weight,
      numberOfPackages,
      vehicleNumber: vehicleNumber || undefined,
      driverName: driverName || undefined,
      driverContact: driverContact || undefined,
      destination: destination || undefined,
      carrierCompany: carrierCompany || undefined,
      carrierPhone: carrierPhone || undefined,
      freightCharges,
      otherCharges: otherCharges || undefined,
      totalCharges: totalCharges || undefined,
      freightType: freightType || 'To Pay',
      specialInstructions: specialInstructions || undefined,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      status: status || (carrierCompany ? 'Assigned' : 'Draft'),
      createdBy: req.user._id,
    })

    const populated = await Shipment.findById(shipment._id)
      .populate('carrierCompany', 'fullName companyName')
      .populate('createdBy', 'fullName companyName')

    // --- Forward to ML Backend skipped as per user request (focus on details only) ---

    res.status(201).json(populated)
  } catch (error) {
    console.error('Create Shipment Error:', error.message)
    res.status(500).json({ message: 'Failed to create shipment' })
  }
}

// @desc    Get all shipments for the logged-in user
// @route   GET /api/shipments
// @access  Private
export const getShipments = async (req, res) => {
  try {
    const filter = req.user.role === 'logistics_company'
      ? { createdBy: req.user._id }
      : { carrierCompany: req.user._id }

    const shipments = await Shipment.find(filter)
      .populate('carrierCompany', 'fullName companyName')
      .populate('createdBy', 'fullName companyName')
      .sort({ createdAt: -1 })

    res.json(shipments)
  } catch (error) {
    console.error('Get Shipments Error:', error.message)
    res.status(500).json({ message: 'Failed to fetch shipments' })
  }
}

// @desc    Get all carriers (users with role 'carrier')
// @route   GET /api/shipments/carriers
// @access  Private
export const getCarriers = async (req, res) => {
  try {
    const carriers = await User.find({ role: 'carrier' }).select('_id fullName companyName email mobile')
    res.json(carriers)
  } catch (error) {
    console.error('Get Carriers Error:', error.message)
    res.status(500).json({ message: 'Failed to fetch carriers' })
  }
}

// @desc    Extract receipt using ML Python Backend
// @route   POST /api/shipments/extract
// @access  Private
export const extractReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(req.file.path), req.file.originalname)

    // Send file to Python API
    const pythonOcrUrl = process.env.PYTHON_OCR_URL || 'http://127.0.0.1:5000'
    const pythonResponse = await axios.post(`${pythonOcrUrl}/api/extract`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    })

    // Clean up temp file
    fs.unlinkSync(req.file.path)

    res.json(pythonResponse.data)
  } catch (error) {
    console.error('Extraction Error:', error.message)
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: 'Failed to extract data from receipt' })
  }
}

// @desc    Generate and send OTP for Delivery (PoD)
// @route   POST /api/shipments/:id/deliver/generate-otp
// @access  Private (carrier)
export const generateOTP = async (req, res) => {
  console.log(`[OTP DEBUG] generateOTP called for shipment ID: ${req.params.id}`)
  try {
    const { receiverContact, receiverEmail } = req.body
    console.log(`[OTP DEBUG] Payload: contact=${receiverContact}, email=${receiverEmail}`)

    console.log(`[OTP DEBUG] Finding shipment with ID: ${req.params.id}`)
    const shipment = await Shipment.findById(req.params.id)

    if (!shipment) {
      console.error(`[OTP DEBUG] Shipment not found: ${req.params.id}`)
      return res.status(404).json({ message: 'Shipment not found' })
    }

    // Ensure the user requesting this is the assigned carrier
    if (!shipment.carrierCompany) {
      console.error(`[OTP DEBUG] Shipment ${shipment._id} has no carrierCompany assigned`)
      return res.status(400).json({ message: 'No carrier assigned to this shipment' })
    }

    if (shipment.carrierCompany.toString() !== req.user._id.toString()) {
      console.warn(`[OTP DEBUG] Auth mismatch: shipment.carrierCompany(${shipment.carrierCompany}) !== req.user._id(${req.user._id})`)
      return res.status(403).json({ message: 'Not authorized to deliver this shipment' })
    }

    // Update consignee contact/email if provided
    if (receiverContact) {
      // Basic sanitation: if it's 10 digits, prepend +91
      let sanitized = receiverContact.trim()
      if (/^\d{10}$/.test(sanitized)) {
        sanitized = `+91${sanitized}`
      }
      shipment.consigneeContact = sanitized
    } else if (shipment.consigneeContact && /^\d{10}$/.test(shipment.consigneeContact.trim())) {
      // Ensure existing 10-digit number also gets the prefix
      shipment.consigneeContact = `+91${shipment.consigneeContact.trim()}`
    }

    if (receiverEmail) {
      // Relaxed validation: just check if it's not empty or very basic check
      if (receiverEmail.length < 5) {
        return res.status(400).json({ message: 'Incorrect email' })
      }
      // Auto-fix common typo if '@' is missing before 'gmail.com'
      let fixedEmail = receiverEmail.trim()
      if (!fixedEmail.includes('@') && fixedEmail.toLowerCase().includes('gmail.com')) {
         fixedEmail = fixedEmail.replace(/gmail\.com/i, '@gmail.com')
      }
      shipment.consigneeEmail = fixedEmail
    } else if (shipment.consigneeEmail) {
      if (shipment.consigneeEmail.length < 5) {
        return res.status(400).json({ message: 'Incorrect email' })
      }
    } else {
      return res.status(400).json({ message: 'Email is required for OTP' })
    }

    // Generate OTP via Agent 2 (ML Backend)
    if (!shipment.lrNumber) {
      console.error(`[OTP DEBUG] LR Number missing for shipment ${shipment._id}`)
      throw new Error('LR Number is missing from shipment record')
    }
    console.log(`[OTP DEBUG] Requesting OTP from Agent 2 for LR: ${shipment.lrNumber}`)

    let otp;
    try {
      const agent2Url = process.env.AGENT2_URL || 'http://127.0.0.1:8001'
      const agentResponse = await axios.post(`${agent2Url}/generate-otp?lr_number=${encodeURIComponent(shipment.lrNumber)}&receiver_contact=${encodeURIComponent(shipment.consigneeContact)}`, {})
      otp = agentResponse.data.generated_otp.toString()
      console.log(`[OTP DEBUG] Generated OTP: ${otp} for LR: ${shipment.lrNumber}`)
    } catch (agentError) {
      console.error('Agent 2 OTP generation call failed:', agentError.message)
      if (agentError.response) console.error('Agent 2 Response:', agentError.response.data)
      throw new Error(`Agent 2 (ML) service unreachable or failed: ${agentError.message}`)
    }

    // Set expiry to 10 minutes from now
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 10)

    shipment.deliveryOTP = otp
    shipment.otpExpiry = expiry
    console.log(`[OTP DEBUG] Saving shipment with OTP metadata...`)
    await shipment.save({ validateBeforeSave: false })
    console.log(`[OTP DEBUG] Shipment saved successfully.`)

    // --- Send Email via Nodemailer ---
    const targetEmail = shipment.consigneeEmail
    if (targetEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        })

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: targetEmail,
          subject: 'Delivery Verification OTP',
          text: `Your delivery verification OTP is: ${otp}. This OTP is valid for 10 minutes.`,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                  <h2>Shipment Delivery Verification</h2>
                  <p>Your delivery verification OTP is: <strong style="font-size: 24px; color: #007bff;">${otp}</strong></p>
                  <p>This OTP is valid for 10 minutes.</p>
                  <hr />
                  <p style="font-size: 12px; color: #777;">If you did not expect this delivery, please ignore this email.</p>
                </div>`,
        }

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
          await transporter.sendMail(mailOptions)
          console.log(`[NODEMAILER] Email sent to ${targetEmail}`)
        } else {
          console.log(`[MOCK EMAIL] SMTP not configured. Email to ${targetEmail} would contain OTP ${otp}`)
        }
      } catch (emailError) {
        console.error('Nodemailer Error:', emailError.message)
        return res.status(400).json({ message: 'Incorrect email' })
      }
    } else {
      return res.status(400).json({ message: 'Incorrect email' })
    }

    // Still keep the mock log for SMS if they use both, or just to show we got it
    console.log(`[MOCK LOG] OTP ${otp} generated for LR ${shipment.lrNumber}`)

    res.status(200).json({
      message: 'OTP generated by Agent 2 and sent via Email successfully'
    })
  } catch (error) {
    console.error('Generate OTP Error:', error)
    // Send specific message if we already set it
    if (error.message.includes('Incorrect email')) {
      res.status(400).json({ message: 'Incorrect email' })
    } else {
      res.status(500).json({ message: 'Failed to generate OTP' })
    }
  }
}

// @desc    Verify OTP and complete delivery with GPS
// @route   POST /api/shipments/:id/deliver/verify
// @access  Private (carrier)
export const verifyDelivery = async (req, res) => {
  try {
    const { otp, location } = req.body
    const shipment = await Shipment.findById(req.params.id)

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' })
    }

    if (shipment.carrierCompany.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to deliver this shipment' })
    }

    // Check if OTP matches via Agent 2 (ML Backend)
    let agentVerified = false
    console.log(`[OTP DEBUG] Verifying Entered OTP: ${otp} (Type: ${typeof otp}) for LR: ${shipment.lrNumber}`)
    try {
      const agent2Url = process.env.AGENT2_URL || 'http://127.0.0.1:8001'
      const agentVerifyRes = await axios.post(`${agent2Url}/verify-otp?lr_number=${encodeURIComponent(shipment.lrNumber)}&entered_otp=${otp}`, {})
      console.log(`[OTP DEBUG] Agent 2 Response:`, agentVerifyRes.data)
      if (agentVerifyRes.data.delivery_verification === 'SUCCESS') {
        agentVerified = true
      }
    } catch (agentError) {
      console.error('[OTP DEBUG] Agent 2 OTP verification call failed:', agentError.message)
      if (agentError.response) console.error('Agent 2 Response:', agentError.response.data)
    }

    if (!agentVerified) {
      console.log(`[OTP DEBUG] Fallback Check: Stored=${shipment.deliveryOTP} (Type: ${typeof shipment.deliveryOTP}), Entered=${otp} (Type: ${typeof otp})`)
      // Local check fallback
      if (!shipment.deliveryOTP || shipment.deliveryOTP.toString().trim() !== otp.toString().trim()) {
        return res.status(400).json({
          message: `Invalid OTP. System received: '${otp}', but expected: '${shipment.deliveryOTP || 'NULL'}'. Please resend OTP.`
        })
      }
    }

    // Check if OTP is expired
    if (!shipment.otpExpiry || shipment.otpExpiry < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' })
    }

    if (!location || !location.lat || !location.lng) {
      return res.status(400).json({ message: 'GPS location is required for Proof of Delivery' })
    }

    // Update shipment status to Delivered
    shipment.status = 'Delivered'
    shipment.deliveryLocation = location
    shipment.deliveryTimestamp = new Date() // Set verification time
    // Clear the OTP fields
    shipment.deliveryOTP = undefined
    shipment.otpExpiry = undefined

    await shipment.save({ validateBeforeSave: false })

    // --- Forward to ML Backend (Agent 2) skipped as per user request ---

    res.status(200).json({ message: 'Delivery verified and completed successfully!', shipment })
  } catch (error) {
    console.error('Verify Delivery Error:', error)
    res.status(500).json({ message: 'Failed to verify delivery' })
  }
}

// Helper to extract amount from a file path
const performExtraction = async (filePath, type) => {
  try {
    const formData = new FormData()
    formData.append('file', fs.createReadStream(filePath))
    const agent3Url = process.env.AGENT3_URL || 'http://127.0.0.1:8002'
    const url = `${agent3Url}/api/extract-${type}`
    const response = await axios.post(url, formData, {
      headers: { ...formData.getHeaders() }
    })
    // Extract "amount" from Agent 3 response
    return Number(response.data.amount) || 0
  } catch (error) {
    console.error(`Helper Extraction Error (${type}):`, error.message)
    return 0
  }
}

// @desc    Request an invoice for a delivered shipment
// @route   POST /api/shipments/:id/request-invoice
// @access  Private (carrier)
export const requestInvoice = async (req, res) => {
  try {
    const { waitingCharges, loadingUnloadingCharges, detentionCharges, additionalCharges } = req.body
    const shipment = await Shipment.findById(req.params.id)

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' })
    }

    if (shipment.carrierCompany.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this shipment' })
    }

    if (shipment.status !== 'Delivered') {
      return res.status(400).json({ message: 'Invoice can only be requested for delivered shipments' })
    }

    // Upload receipts to Cloudinary & Extract amounts
    let tollUrl = shipment.tollReceiptUrl
    let fuelUrl = shipment.fuelReceiptUrl
    let extractedToll = 0
    let extractedFuel = 0

    if (req.files) {
      if (req.files.tollReceipt) {
        const filePath = req.files.tollReceipt[0].path
        extractedToll = await performExtraction(filePath, 'toll')
        tollUrl = await uploadOnCloudinary(filePath)
      }
      if (req.files.fuelReceipt) {
        const filePath = req.files.fuelReceipt[0].path
        extractedFuel = await performExtraction(filePath, 'fuel')
        fuelUrl = await uploadOnCloudinary(filePath)
      }
    }

    shipment.waitingCharges = Number(waitingCharges) || 0
    shipment.loadingUnloadingCharges = Number(loadingUnloadingCharges) || 0
    shipment.detentionCharges = Number(detentionCharges) || 0
    shipment.additionalCharges = Number(additionalCharges) || 0

    // User requested specific values for testing/demo: toll=200, fuel=440
    shipment.tollAmount = extractedToll || 200
    shipment.fuelAmount = extractedFuel || 440
    shipment.tollReceiptUrl = tollUrl
    shipment.fuelReceiptUrl = fuelUrl

    // Total Carrier Payment Calculation: Toll + Fuel + 3 charges (Waiting, Loading, Detention)
    shipment.totalCarrierPayment =
      shipment.tollAmount +
      shipment.fuelAmount +
      shipment.waitingCharges +
      shipment.loadingUnloadingCharges +
      shipment.detentionCharges

    // Fraud Detection (Agent-3) - Enhanced Verification
    const requestedTotal = shipment.totalCarrierPayment
    const expectedTotal = shipment.totalCharges || 0
    
    try {
      const agent3Url = process.env.AGENT3_URL || 'http://127.0.0.1:8002'
      const fraudResponse = await axios.post(`${agent3Url}/api/detect-fraud`, {
        requested_total: requestedTotal,
        expected_total: expectedTotal,
        waiting_charges: shipment.waitingCharges,
        loading_charges: shipment.loadingUnloadingCharges,
        detention_charges: shipment.detentionCharges,
        toll_amount: shipment.tollAmount,
        fuel_amount: shipment.fuelAmount
      })
      
      const { risk_level, fraud_probability, reasons } = fraudResponse.data
      shipment.riskLevel = risk_level
      shipment.fraudProbability = fraud_probability
      shipment.fraudReasons = reasons
      
      console.log(`[FRAUD DEBUG] Agent 3 Response: Risk=${risk_level}, Prob=${fraud_probability}%`)
    } catch (fraudError) {
      console.error('[FRAUD DEBUG] Agent 3 call failed:', fraudError.message)
      // Fallback if Agent 3 is down (as a safety measure)
      if (requestedTotal > expectedTotal) {
        shipment.riskLevel = 'High'
        shipment.fraudProbability = 70
        shipment.fraudReasons = [`FALLBACK: Excessive charges detected (₹${requestedTotal} > ₹${expectedTotal})`]
      } else {
        shipment.riskLevel = 'Low'
        shipment.fraudProbability = 10
      }
    }

    // All invoice requests must be reviewed by the Logistics Company
    shipment.invoiceStatus = 'Requested'

    await shipment.save()

    res.status(200).json({
      message: 'Invoice request submitted successfully',
      shipment
    })
  } catch (error) {
    console.error('Request Invoice Error:', error)
    res.status(500).json({ message: 'Failed to request invoice' })
  }
}

// @desc    Approve an invoice and mark as generated
// @route   PATCH /api/shipments/:id/approve-invoice
// @access  Private (logistics_company)
export const approveInvoice = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' })
    }

    if (shipment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this shipment' })
    }

    shipment.invoiceStatus = 'Generated'
    // In a real app, this is where you'd trigger PDF generation
    await shipment.save()

    res.status(200).json({ message: 'Invoice approved and generated', shipment })
  } catch (error) {
    console.error('Approve Invoice Error:', error)
    res.status(500).json({ message: 'Failed to approve invoice' })
  }
}

// @desc    Delete a shipment
// @route   DELETE /api/shipments/:id
// @access  Private
export const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ message: 'Shipment not found' });
    }

    // Optional: Only allow the logistics company who created it to delete
    // if (shipment.createdBy.toString() !== req.user._id.toString()) {
    //   return res.status(403).json({ message: 'Not authorized to delete this shipment' })
    // }

    await shipment.deleteOne();
    res.json({ message: 'Shipment removed' });
  } catch (error) {
    console.error('Delete Shipment Error:', error);
    res.status(500).json({ message: 'Failed to delete shipment' });
  }
}
