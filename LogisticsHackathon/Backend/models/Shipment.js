import mongoose from 'mongoose'

const shipmentSchema = new mongoose.Schema({
  shipmentId: {
    type: String,
    unique: true,
  },
  lrNumber: {
    type: String,
    unique: true,
  },
  shipmentDate: {
    type: Date,
    required: true,
  },
  goodsType: {
    type: String,
    enum: ['Electronics', 'FMCG', 'Pharmaceuticals', 'Textiles', 'Automotive', 'Agriculture', 'Chemicals', 'Other'],
    required: true,
  },
  goodsDescription: { type: String },
  quantity: { type: Number },
  goodsValue: { type: Number },
  transporterName: { type: String },
  transporterAddress: { type: String },
  transporterContact: { type: String },
  consignorName: {
    type: String,
    required: true,
  },
  consignorAddress: {
    type: String,
    required: true,
  },
  consignorContact: {
    type: String,
  },
  consignorGSTIN: { type: String },
  consigneeName: {
    type: String,
    required: true,
  },
  consigneeAddress: {
    type: String,
    required: true,
  },
  consigneeContact: { type: String },
  consigneeEmail: { type: String },
  consigneeGSTIN: { type: String },
  consigneePincode: {
    type: String,
  },
  weight: {
    type: Number,
    required: true,
  },
  numberOfPackages: {
    type: Number,
    required: true,
  },
  vehicleNumber: {
    type: String,
  },
  driverName: { type: String },
  driverContact: { type: String },
  destination: { type: String },
  carrierCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  carrierPhone: {
    type: String,
  },
  freightCharges: {
    type: Number,
  },
  otherCharges: { type: Number },
  totalCharges: { type: Number },
  freightType: {
    type: String,
    enum: ['To Pay', 'Paid', 'To Be Billed'],
    default: 'To Pay',
  },
  specialInstructions: {
    type: String,
  },
  expectedDeliveryDate: {
    type: Date,
  },
  deliveryOTP: {
    type: String, // will store a 4-digit code temporarily
  },
  otpExpiry: {
    type: Date,
  },
  deliveryTimestamp: {
    type: Date,
  },
  deliveryLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
  },
  tollReceiptUrl: { type: String },
  fuelReceiptUrl: { type: String },
  tollAmount: { type: Number, default: 0 },
  fuelAmount: { type: Number, default: 0 },
  waitingCharges: { type: Number, default: 0 },
  loadingUnloadingCharges: { type: Number, default: 0 },
  detentionCharges: { type: Number, default: 0 },
  additionalCharges: { type: Number, default: 0 },
  totalCarrierPayment: { type: Number, default: 0 },
  fraudProbability: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  fraudReasons: [{ type: String }],
  invoiceStatus: {
    type: String,
    enum: ['Not Requested', 'Requested', 'Approved', 'Generated'],
    default: 'Not Requested',
  },
  invoiceUrl: { type: String },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Assigned', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true })

// Auto-generate shipment ID and LR number before saving
shipmentSchema.pre('save', async function () {
  if (!this.shipmentId) {
    const count = await mongoose.model('Shipment').countDocuments()
    this.shipmentId = `SH-${(count + 4822).toString()}`
  }
  if (!this.lrNumber) {
    this.lrNumber = 'LR-' + Date.now()
  }
})

const Shipment = mongoose.model('Shipment', shipmentSchema)
export default Shipment
