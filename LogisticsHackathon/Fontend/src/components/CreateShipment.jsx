import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const goodsTypes = ['Electronics', 'FMCG', 'Pharmaceuticals', 'Textiles', 'Automotive', 'Agriculture', 'Chemicals', 'Other']

const CreateShipment = ({ user, onBack }) => {
  const [carriers, setCarriers] = useState([])
  const [carrierSearchPhone, setCarrierSearchPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)

  const [form, setForm] = useState({
    lrNumber: '',
    shipmentDate: '',
    goodsType: '',
    goodsDescription: '',
    quantity: '',
    weight: '',
    goodsValue: '',
    transporterName: '',
    transporterAddress: '',
    transporterContact: '',
    consignorName: '',
    consignorAddress: '',
    consignorContact: '',
    consignorGSTIN: '',
    consigneeName: '',
    consigneeAddress: '',
    consigneeContact: '',
    consigneeGSTIN: '',
    consigneePincode: '',
    freightType: 'To Pay',
    specialInstructions: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    destination: '',
    carrierCompany: '',
    freightCharges: '',
    otherCharges: '',
    totalCharges: '',
    expectedDeliveryDate: '',
  })

  useEffect(() => {
    const fetchCarriers = async () => {
      try {
        const res = await api.get('/shipments/carriers')
        setCarriers(res.data)
      } catch (err) {
        console.error('Failed to fetch carriers:', err)
        toast.error('Could not load carriers. Please refresh.')
      }
    }
    fetchCarriers()
  }, [])

  // Auto-fill Total Charges whenever Freight or Other charges change
  useEffect(() => {
    const freight = Number(form.freightCharges) || 0
    const other = Number(form.otherCharges) || 0
    const total = (freight + other).toString()
    if (form.totalCharges !== total) {
      setForm(prev => ({ ...prev, totalCharges: total }))
    }
  }, [form.freightCharges, form.otherCharges])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleCarrierChange = (e) => {
    const selectedCarrierId = e.target.value
    setForm({ ...form, carrierCompany: selectedCarrierId })
    
    if (selectedCarrierId) {
      const carrier = carriers.find(c => c._id === selectedCarrierId)
      if (carrier && carrier.mobile) {
        setCarrierSearchPhone(carrier.mobile)
      } else {
        setCarrierSearchPhone('')
      }
    } else {
      setCarrierSearchPhone('')
    }
  }

  const handlePhoneSearchChange = (e) => {
    setCarrierSearchPhone(e.target.value)
    // Clear carrier selection if user starts typing a new phone number
    if (form.carrierCompany) {
      setForm({ ...form, carrierCompany: '' })
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setExtracting(true)
    const formData = new FormData()
    formData.append('receipt', file)

    try {
      const res = await api.post('/shipments/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const data = res.data
      toast.success('Receipt data extracted via ML successfully!')
      
      // Auto-fill form with extracted data
      setForm(prev => ({
        ...prev,
        lrNumber: data.lrNumber || prev.lrNumber || '',
        transporterName: data.transporterName || prev.transporterName || '',
        transporterAddress: data.transporterAddress || prev.transporterAddress || '',
        transporterContact: data.transporterContact || prev.transporterContact || '',
        consignorName: data.consignorName || prev.consignorName || '',
        consignorAddress: data.consignorAddress || prev.consignorAddress || '',
        consignorContact: data.consignorContact || prev.consignorContact || '',
        consignorGSTIN: data.consignorGSTIN || prev.consignorGSTIN || '',
        consigneeName: data.consigneeName || prev.consigneeName || '',
        consigneeAddress: data.consigneeAddress || prev.consigneeAddress || '',
        consigneeContact: data.consigneeContact || prev.consigneeContact || '',
        consigneeGSTIN: data.consigneeGSTIN || prev.consigneeGSTIN || '',
        consigneePincode: data.consigneePincode || prev.consigneePincode || '',
        driverName: data.driverName || prev.driverName || '',
        driverContact: data.driverContact || prev.driverContact || '',
        destination: data.destination || prev.destination || '',
        freightType: data.freightType || prev.freightType || 'To Pay',
        specialInstructions: data.specialInstructions || prev.specialInstructions || '',
        vehicleNumber: data.vehicleNumber || prev.vehicleNumber || '',
        freightCharges: data.freightCharges || prev.freightCharges || '',
        otherCharges: data.otherCharges || prev.otherCharges || '',
        totalCharges: data.totalCharges || prev.totalCharges || '',
        weight: data.weight || prev.weight || '',
        quantity: data.quantity || prev.quantity || '',
        goodsValue: data.goodsValue || prev.goodsValue || '',
        goodsDescription: data.goodsDescription || prev.goodsDescription || '',
        goodsType: data.goodsType || prev.goodsType || '',
        shipmentDate: new Date().toISOString().split('T')[0] // Default to today
      }))
    } catch (err) {
      console.error(err)
      toast.error('Failed to extract receipt data. You can still fill it manually.')
    } finally {
      setExtracting(false)
    }
  }

  const handleSubmit = async (status) => {
    if (!form.shipmentDate || !form.goodsType || !form.consignorAddress || !form.consigneeAddress || !form.consignorName || !form.consigneeName || !form.weight || !form.quantity) {
      toast.error('Please fill in all required fields')
      return
    }

    if (status === 'Assigned' && !form.carrierCompany) {
      toast.error('Please select a system carrier to assign this job')
      return
    }
    const sanitizePhone = (phone) => {
      if (!phone) return phone
      const trimmed = phone.trim()
      return /^\d{10}$/.test(trimmed) ? `+91${trimmed}` : trimmed
    }

    setLoading(true)
    try {
      await api.post('/shipments', {
        ...form,
        consignorContact: sanitizePhone(form.consignorContact),
        consigneeContact: sanitizePhone(form.consigneeContact),
        transporterContact: sanitizePhone(form.transporterContact),
        driverContact: sanitizePhone(form.driverContact),
        weight: Number(form.weight),
        numberOfPackages: Number(form.quantity), // map to DB schema
        quantity: Number(form.quantity),
        goodsValue: form.goodsValue ? Number(form.goodsValue) : undefined,
        freightCharges: form.freightCharges ? Number(form.freightCharges) : undefined,
        otherCharges: form.otherCharges ? Number(form.otherCharges) : undefined,
        totalCharges: form.totalCharges ? Number(form.totalCharges) : undefined,
        carrierCompany: form.carrierCompany || undefined,
        carrierPhone: form.carrierCompany ? carrierSearchPhone : undefined,
        status: status === 'Assigned' && !form.carrierCompany ? 'Pending' : status,
      })
      toast.success(status === 'Draft' ? 'Draft saved!' : (form.carrierCompany ? 'Shipment assigned successfully!' : 'Shipment created!'))
      setTimeout(() => onBack(), 800)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create shipment')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all'
  const labelClass = 'flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create New Shipment</h1>
          <p className="text-gray-500 mt-1">Upload a lorry receipt (LR) or fill in the details manually to create a new shipment record.</p>
        </div>
      </div>

      <div className="space-y-6">

        {/* ━━━ Section 0: ML Auto Fill ━━━ */}
        <div className="bg-gradient-to-br from-emerald-50 to-[#5c8a70]/10 rounded-2xl border border-[#5c8a70]/20 overflow-hidden shadow-sm">
          <div className="px-6 py-5 flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1 w-full">
              <h2 className="text-lg font-bold text-[#2d4a3a] flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Auto-fill with Lorry Receipt 
              </h2>
              <p className="text-[#4b725c] text-sm mt-1">
                Upload a document to automatically generate an LR Number and extract data elements.
              </p>
            </div>
            <div className="w-full md:w-auto flex-shrink-0 relative">
              <input 
                type="file" 
                accept="image/*,.pdf" 
                onChange={handleFileUpload} 
                disabled={extracting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <button disabled={extracting} className="w-full bg-[#5c8a70] hover:bg-[#4b725c] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70">
                {extracting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Extracting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Upload Receipt
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ━━━ Section 1: Transporter Information ━━━ */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">1</div>
              <h2 className="text-base font-bold text-gray-900">Transporter Information</h2>
            </div>
            {form.lrNumber && (
              <div className="bg-[#5c8a70]/10 text-[#5c8a70] px-3 py-1 rounded-full text-xs font-bold border border-[#5c8a70]/20 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                LR NO: {form.lrNumber}
              </div>
            )}
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-1">
                <label className={labelClass}>Transporter Name</label>
                <input type="text" name="transporterName" placeholder="e.g. FastTrack Logistics" value={form.transporterName} onChange={handleChange} className={inputClass} />
              </div>
              <div className="lg:col-span-2">
                <label className={labelClass}>Transporter Address</label>
                <input type="text" name="transporterAddress" placeholder="Full transporter address" value={form.transporterAddress} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contact Details</label>
                <input type="text" name="transporterContact" placeholder="Phone / Email" value={form.transporterContact} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date of Issue (Shipment Date) <span className="text-red-400">*</span></label>
                <input type="date" name="shipmentDate" value={form.shipmentDate} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ Section 2: Consignor & Consignee Details ━━━ */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center text-sm font-bold">2</div>
            <h2 className="text-base font-bold text-gray-900">Consignor & Consignee Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
            {/* Consignor */}
            <div className="space-y-4 lg:pr-4">
              <h3 className="text-[#5c8a70] font-bold text-sm mb-2 uppercase tracking-wider">Consignor (Sender) Details</h3>
              <div>
                <label className={labelClass}>Name <span className="text-red-400">*</span></label>
                <input type="text" name="consignorName" placeholder="e.g. ABC Manufacturing" value={form.consignorName} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address <span className="text-red-400">*</span></label>
                <textarea name="consignorAddress" placeholder="Full sender address" value={form.consignorAddress} onChange={handleChange} required rows={2} className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>GSTIN</label>
                  <input type="text" name="consignorGSTIN" placeholder="GSTIN" value={form.consignorGSTIN} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact</label>
                  <input type="text" name="consignorContact" placeholder="Phone" value={form.consignorContact} onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
            {/* Consignee */}
            <div className="space-y-4 pt-6 lg:pt-0 lg:pl-4">
              <h3 className="text-indigo-600 font-bold text-sm mb-2 uppercase tracking-wider">Consignee (Receiver) Details</h3>
              <div>
                <label className={labelClass}>Name <span className="text-red-400">*</span></label>
                <input type="text" name="consigneeName" placeholder="e.g. XYZ Retail" value={form.consigneeName} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address <span className="text-red-400">*</span></label>
                <textarea name="consigneeAddress" placeholder="Full receiver address" value={form.consigneeAddress} onChange={handleChange} required rows={2} className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>GSTIN</label>
                  <input type="text" name="consigneeGSTIN" placeholder="GSTIN" value={form.consigneeGSTIN} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Contact</label>
                  <input type="text" name="consigneeContact" placeholder="Phone" value={form.consigneeContact} onChange={handleChange} className={inputClass} />
                </div>
              </div>
                <div>
                  <label className={labelClass}>Pincode <span className="text-red-400">*</span></label>
                  <input type="text" name="consigneePincode" placeholder="e.g. 201301" value={form.consigneePincode} onChange={handleChange} required className={inputClass} />
                </div>
            </div>
          </div>
        </div>

        {/* ━━━ Section 3: Transportation Details ━━━ */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">3</div>
            <h2 className="text-base font-bold text-gray-900">Transportation Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div>
              <label className={labelClass}>Vehicle Number</label>
              <input type="text" name="vehicleNumber" placeholder="e.g. MH12AB1234" value={form.vehicleNumber} onChange={handleChange} className={inputClass} />
            </div>
             <div>
                <label className={labelClass}>Assign System Carrier <span className="text-red-400">*</span></label>
                <select name="carrierCompany" value={form.carrierCompany} required onChange={handleCarrierChange} className={`${inputClass} cursor-pointer appearance-none`}>
                  <option value="">Select carrier</option>
                  {carriers.filter(c => !carrierSearchPhone || (c.mobile && c.mobile.includes(carrierSearchPhone))).map(c => (
                    <option key={c._id} value={c._id}>{c.companyName ? `${c.companyName} — ` : ''}{c.fullName}</option>
                  ))}
                </select>
              </div>
             <div>
                <label className={labelClass}>Search Carrier User (Phone)</label>
                <input type="tel" name="carrierSearchPhone" placeholder="Search by phone..." value={carrierSearchPhone} onChange={handlePhoneSearchChange} className={inputClass} />
              </div>
            <div>
              <label className={labelClass}>Destination</label>
              <input type="text" name="destination" placeholder="Final destination" value={form.destination} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* ━━━ Section 4: Charge Type & Amount ━━━ */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-sm font-bold">4</div>
            <h2 className="text-base font-bold text-gray-900">Charge Type & Amount</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Freight Charges (₹)</label>
              <input type="number" name="freightCharges" placeholder="Amount" value={form.freightCharges} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Other Charges (₹)</label>
              <input type="number" name="otherCharges" placeholder="Amount" value={form.otherCharges} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Total Charges (₹)</label>
              <input type="number" name="totalCharges" placeholder="Total" value={form.totalCharges} onChange={handleChange} className={inputClass} />
            </div>
            
            <div className="md:col-span-3 pt-4 border-t border-gray-50 mt-2 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={labelClass}>Charge Type (Payer)</label>
                <select name="freightType" value={form.freightType} onChange={handleChange} className={`${inputClass} cursor-pointer appearance-none`}>
                  <option value="To Pay">To Pay</option>
                  <option value="Paid">Paid</option>
                  <option value="To Be Billed">To Be Billed</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Special Instructions</label>
                <input type="text" name="specialInstructions" placeholder="e.g. Handle with care" value={form.specialInstructions} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="md:col-span-3 bg-amber-50/50 p-6 rounded-xl border border-amber-100/50 mt-2 grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className={`${labelClass} after:content-['*'] after:ml-0.5 after:text-red-500`}>Expected Delivery Date</label>
                <input type="date" name="expectedDeliveryDate" value={form.expectedDeliveryDate} onChange={handleChange} required className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ Section 5: Description of Goods ━━━ */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">5</div>
            <h2 className="text-base font-bold text-gray-900">Description of Goods</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div className="lg:col-span-2">
              <label className={labelClass}>Goods Description</label>
              <input type="text" name="goodsDescription" placeholder="Description of items..." value={form.goodsDescription} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Goods Category <span className="text-red-400">*</span></label>
              <select name="goodsType" value={form.goodsType} onChange={handleChange} required className={`${inputClass} cursor-pointer appearance-none`}>
                <option value="" disabled>Select category</option>
                {goodsTypes.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Quantity <span className="text-red-400">*</span></label>
              <input type="number" name="quantity" placeholder="No. of items" value={form.quantity} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Weight (KG) <span className="text-red-400">*</span></label>
              <input type="number" name="weight" placeholder="e.g. 2400" value={form.weight} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="lg:col-span-2">
              <label className={labelClass}>Value of Goods (₹)</label>
              <input type="number" name="goodsValue" placeholder="e.g. 50000" value={form.goodsValue} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* ━━━ Section 5: Submit Buttons ━━━ */}
        <div className="flex flex-wrap items-center gap-3 pt-2 pb-8">
          <button
            onClick={() => handleSubmit('Assigned')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#5c8a70] hover:bg-[#4b725c] disabled:opacity-70 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#5c8a70]/25 hover:-translate-y-0.5"
          >
            {loading ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processing...</>
            ) : (
              <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg> Assign Shipment</>
            )}
          </button>
          <button
            onClick={() => handleSubmit('Draft')}
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-gray-700 font-bold text-sm rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-70"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
            </svg>
            Save Draft
          </button>
          <button
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3.5 text-gray-500 font-semibold text-sm rounded-xl hover:bg-gray-100 transition-all disabled:opacity-70"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}

export default CreateShipment
