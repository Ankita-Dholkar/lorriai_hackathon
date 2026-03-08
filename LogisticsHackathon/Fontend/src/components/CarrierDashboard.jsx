import React, { useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CarrierDashboard = ({ user }) => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)

  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [deliveryStep, setDeliveryStep] = useState(1) // 1: Send OTP, 2: Setup GPS, 3: Verify OTP
  const [otpInput, setOtpInput] = useState('')
  const [mockReceivedOtp, setMockReceivedOtp] = useState('') // Just for hackathon display
  const [gpsLocation, setGpsLocation] = useState(null)
  const [deliveryLoading, setDeliveryLoading] = useState(false)
  const [podModalOpen, setPodModalOpen] = useState(false)
  const [podData, setPodData] = useState(null)
  
  // Invoice Request State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false)
  const [invoiceForm, setInvoiceForm] = useState({
    waitingCharges: '',
    loadingUnloadingCharges: '',
    detentionCharges: '',
    tollReceipt: null,
    fuelReceipt: null
  })
  const [invoiceDocOpen, setInvoiceDocOpen] = useState(false)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await api.get('/shipments')
        setShipments(res.data)
      } catch (err) {
        console.error('Failed to fetch shipments:', err)
        toast.error('Failed to load assigned jobs')
      } finally {
        setLoading(false)
      }
    }
    fetchShipments()
  }, [])

  const handleDeleteShipment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    try {
      await api.delete(`/shipments/${id}`)
      setShipments(shipments.filter(s => s._id !== id))
      toast.success('Shipment deleted successfully')
    } catch (err) {
      console.error('Failed to delete shipment', err)
      toast.error('Failed to delete shipment')
    }
  }

  // --- PoD Delivery Flow Handlers ---

  const openDeliveryModal = (shipment) => {
    setSelectedShipment(shipment)
    setDeliveryStep(1)
    setOtpInput('')
    setMockReceivedOtp('')
    setGpsLocation(null)
    setIsDeliveryModalOpen(true)
  }

  const closeDeliveryModal = () => {
    setIsDeliveryModalOpen(false)
    setSelectedShipment(null)
    setDeliveryStep(1)
  }

  const handleSendOTP = async () => {
    try {
      setDeliveryLoading(true)
      const res = await api.post(
        `/shipments/${selectedShipment._id}/deliver/generate-otp`,
        { 
          receiverContact: selectedShipment.consigneeContact,
          receiverEmail: selectedShipment.consigneeEmail
        }
      )
      toast.success('OTP sent to receiver via Email!')
      setDeliveryStep(2) // Move to GPS step
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setDeliveryLoading(false)
    }
  }

  const captureGPS = () => {
    setDeliveryLoading(true)
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: 'Fetched via Browser GPS', // Could use reverse-geocode API here
          })
          toast.success('GPS Location Captured!')
          setDeliveryStep(3) // Move to OTP verification step
          setDeliveryLoading(false)
        },
        (error) => {
          console.error(error)
          toast.error('Failed to get location. Please allow GPS access.')
          setDeliveryLoading(false)
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
      setDeliveryLoading(false)
    }
  }

  const handleVerifyDelivery = async () => {
    if (!otpInput || otpInput.length < 4) {
      return toast.error('Please enter the 4-digit OTP')
    }
    if (!gpsLocation) {
      return toast.error('GPS Location is required')
    }

    try {
      setDeliveryLoading(true)
      const res = await api.post(
        `/shipments/${selectedShipment._id}/deliver/verify`,
        {
          otp: otpInput,
          location: gpsLocation,
        }
      )
      
      toast.success('Delivery Verified Successfully!')
      
      // Update local state and show POD
      const updatedShipment = { ...res.data.shipment, status: 'Delivered' };
      setShipments(shipments.map(s => 
        s._id === selectedShipment._id ? updatedShipment : s
      ))
      setPodData(updatedShipment)
      setPodModalOpen(true)
      closeDeliveryModal()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Invalid OTP or Verification Failed')
    } finally {
      setDeliveryLoading(false)
    }
  }

  // --- Invoice Handlers ---
  const handleInvoiceRequest = async (e) => {
    e.preventDefault()
    setDeliveryLoading(true)
    
    try {
      const formData = new FormData()
      formData.append('waitingCharges', invoiceForm.waitingCharges)
      formData.append('loadingUnloadingCharges', invoiceForm.loadingUnloadingCharges)
      formData.append('detentionCharges', invoiceForm.detentionCharges)
      if (invoiceForm.tollReceipt) formData.append('tollReceipt', invoiceForm.tollReceipt)
      if (invoiceForm.fuelReceipt) formData.append('fuelReceipt', invoiceForm.fuelReceipt)

      const res = await api.post(
        `/shipments/${selectedShipment._id}/request-invoice`,
        formData,
        { 
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      )

      toast.success('Invoice Request Submitted!')
      setShipments(shipments.map(s => s._id === res.data.shipment._id ? res.data.shipment : s))
      setInvoiceModalOpen(false)
      setInvoiceForm({ waitingCharges: '', loadingUnloadingCharges: '', detentionCharges: '', tollReceipt: null, fuelReceipt: null })
      setSelectedShipment(null)
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Failed to submit invoice request')
    } finally {
      setDeliveryLoading(false)
    }
  }

  // --- End Invoice Handlers ---

  // --- End PoD Handlers ---

  const assignedJobsCount = shipments.filter(s => s.status !== 'Delivered' && s.status !== 'Cancelled').length
  const completedDeliveriesCount = shipments.filter(s => s.status === 'Delivered').length

  const pendingRevenue = shipments
    .filter(s => s.status !== 'Cancelled' && s.invoiceStatus !== 'Generated')
    .reduce((sum, s) => sum + (s.totalCharges || s.freightCharges || 0), 0)

  const generatedRevenue = shipments
    .filter(s => s.status !== 'Cancelled' && s.invoiceStatus === 'Generated')
    .reduce((sum, s) => sum + (s.totalCharges || s.freightCharges || 0), 0)

  const totalPotentialRevenue = pendingRevenue + generatedRevenue
  const pendingReceiptsCount = shipments.filter(s => s.invoiceStatus === 'Requested').length

  const pieData = [
    { name: 'Generated', value: generatedRevenue, color: '#10b981' }, // text-emerald-500
    { name: 'Pending', value: pendingRevenue, color: '#f59e0b' } // text-amber-500
  ]

  const stats = [
    {
      label: 'Assigned Jobs',
      value: assignedJobsCount.toString(),
      change: '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        </svg>
      ),
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Completed Deliveries',
      value: completedDeliveriesCount.toString(),
      change: '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Revenue This Month',
      value: `₹${totalPotentialRevenue.toLocaleString()}`,
      change: 'Total potential',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Pending Receipts',
      value: pendingReceiptsCount.toString(),
      change: 'Needs review',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      ),
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ]



  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl p-3">
          <p className="font-bold text-gray-700 text-sm">{payload[0].name} Revenue</p>
          <p className="text-xl font-black" style={{ color: payload[0].payload.color }}>
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-[#5c8a70]">{user.fullName}</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.companyName} — Carrier Dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.change}</p>
              </div>
              <div className={`${s.bg} ${s.iconColor} w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* Revenue Analysis Chart */}
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
          </svg>
          Revenue Distribution
        </h2>
        
        {generatedRevenue === 0 && pendingRevenue === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium">
            No revenue data available yet.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-[300px] w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} className="drop-shadow-sm" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full md:w-1/2 space-y-6">
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <p className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Generated Revenue</p>
                </div>
                <p className="text-3xl font-black text-emerald-900">₹{generatedRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1 font-medium">From delivered & approved work</p>
              </div>

              <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <p className="text-sm font-bold text-amber-800 uppercase tracking-wide">Pending Expected</p>
                </div>
                <p className="text-3xl font-black text-amber-900">₹{pendingRevenue.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1 font-medium">From active assigned deliveries</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Jobs Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Active Jobs</h2>
            <button className="text-[#5c8a70] text-sm font-semibold hover:underline">View All →</button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="w-8 h-8 animate-spin text-[#5c8a70]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
          ) : shipments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">LR Number</th>
                    <th className="px-6 py-4">Route</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Total Charges</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#5c8a70]/10 flex items-center justify-center text-[#5c8a70]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{shipment.lrNumber}</p>
                            <p className="text-xs text-gray-500">Date: {new Date(shipment.shipmentDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {shipment.dispatchLocation ? shipment.dispatchLocation.split(',')[0] : 'Unknown'}
                          </span>
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-900">
                            {shipment.deliveryAddress ? shipment.deliveryAddress.split(',')[0] : 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-md">
                          {shipment.vehicleNumber || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {shipment.totalCharges ? `₹${shipment.totalCharges.toLocaleString()}` : (shipment.freightCharges ? `₹${shipment.freightCharges.toLocaleString()}` : '—')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {shipment.status === 'In Transit' || shipment.status === 'Assigned' ? (
                          <button 
                            onClick={() => openDeliveryModal(shipment)}
                            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                          >
                            Mark Delivered
                          </button>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => { setPodData(shipment); setPodModalOpen(true); }}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100 whitespace-nowrap"
                            >
                              View POD
                            </button>
                            {shipment.invoiceStatus === 'Not Requested' && (
                              <button 
                                onClick={() => { setSelectedShipment(shipment); setInvoiceModalOpen(true); }}
                                className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors border border-orange-100 whitespace-nowrap"
                              >
                                Request Invoice
                              </button>
                            )}
                            {shipment.invoiceStatus !== 'Not Requested' && (
                              <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                                {shipment.invoiceStatus}
                              </span>
                            )}
                            {shipment.invoiceStatus === 'Generated' && (
                              <button 
                                onClick={() => { setSelectedShipment(shipment); setPodModalOpen(false); setInvoiceModalOpen(false); /* We'll use a new state or reuse the modal */ setInvoiceDocOpen(true); }}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100 whitespace-nowrap shadow-sm"
                              >
                                View Invoice
                              </button>
                            )}
                            <button className="text-xs font-bold text-[#5c8a70] hover:text-[#4b725c] bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                              View Details
                            </button>
                            <button 
                              onClick={() => handleDeleteShipment(shipment._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Shipment"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              <p className="text-sm font-medium text-gray-400">No jobs assigned yet</p>
              <p className="text-xs text-gray-300 mt-1">New jobs will appear here when assigned</p>
            </div>
          )}
        </div>


      </div>

      {/* Delivery Verification Modal */}
      {isDeliveryModalOpen && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">Proof of Delivery (PoD)</h3>
              <button 
                onClick={closeDeliveryModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {/* Stepper Header */}
              <div className="flex items-center justify-between mb-8 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-gray-100 -z-10"></div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-blue-600 transition-all duration-300 -z-10" style={{ width: deliveryStep === 1 ? '0%' : deliveryStep === 2 ? '50%' : '100%' }}></div>
                
                {[1, 2, 3].map((stepNum) => (
                  <div key={stepNum} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${deliveryStep >= stepNum ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                    {stepNum}
                  </div>
                ))}
              </div>

              {/* Step 1: Send OTP */}
              {deliveryStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm mb-4">
                    <p className="font-semibold">Step 1: Receiver Verification</p>
                    <p className="mt-1 opacity-90">An OTP will be sent to the receiver's mobile number to verify delivery.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Name</label>
                    <input disabled type="text" value={selectedShipment.consigneeName || 'Unknown'} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2" />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                    <input 
                      type="text" 
                      value={selectedShipment.consigneeContact || ''} 
                      onChange={(e) => {
                        let val = e.target.value
                        // If user enters 10 digits, we can prepend +91 if they didn't
                        if (/^\d{10}$/.test(val)) {
                          val = `+91${val}`
                        }
                        setSelectedShipment({...selectedShipment, consigneeContact: val})
                      }}
                      placeholder="+91 or 10-digit number"
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (for OTP)</label>
                    <input 
                      type="email" 
                      value={selectedShipment.consigneeEmail || ''} 
                      onChange={(e) => setSelectedShipment({...selectedShipment, consigneeEmail: e.target.value})}
                      placeholder="receiver@example.com"
                      className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                    />
                  </div>

                  <button 
                    onClick={handleSendOTP}
                    disabled={deliveryLoading}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {deliveryLoading ? 'Sending...' : 'Send Verification OTP'}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              )}

              {/* Step 2: Capture GPS */}
              {deliveryStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-indigo-50 text-indigo-800 p-4 rounded-xl text-sm mb-4">
                    <p className="font-semibold">Step 2: Location Verification</p>
                    <p className="mt-1 opacity-90">We need to capture your current GPS coordinates to prove delivery at the correct destination.</p>
                  </div>

                  {/* Hackathon Demo Helper */}
                  {/* Hackathon Demo Helper - Hidden for security */}

                  <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-bold mb-1">Destination Location</p>
                    <p className="text-sm text-gray-500 mb-4">{selectedShipment.deliveryAddress || 'Unknown'}</p>
                    
                    <button 
                      onClick={captureGPS}
                      disabled={deliveryLoading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                    >
                      {deliveryLoading ? 'Fetching Location...' : 'Capture My GPS'}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Enter OTP & Verify */}
              {deliveryStep === 3 && (
                <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm mb-2">
                    <p className="font-semibold flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      Location Captured
                    </p>
                    <p className="mt-1 opacity-90 font-mono text-xs">Lat: {gpsLocation?.lat.toFixed(4)}, Lng: {gpsLocation?.lng.toFixed(4)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter 4-Digit Receiver OTP</label>
                    <input 
                      type="text" 
                      maxLength="4"
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-white border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-center text-4xl tracking-[1em] font-mono font-bold text-gray-900 rounded-xl py-4 transition-all" 
                      placeholder="••••"
                    />
                  </div>

                  {/* Hint Hidden for security */}

                  <button 
                    onClick={handleVerifyDelivery}
                    disabled={deliveryLoading || otpInput.length < 4}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none flex justify-center items-center gap-2 mt-4"
                  >
                    {deliveryLoading ? 'Verifying...' : 'Complete Delivery'}
                    {!deliveryLoading && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
      {/* POD Summary Modal */}
      {podModalOpen && podData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">PROOF OF DELIVERY</h2>
                    <p className="text-sm text-gray-500 font-medium">Verified Digital Receipt</p>
                  </div>
                </div>
                <button onClick={() => setPodModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Reference Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-gray-50 p-4 border-r border-b border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Shipment Reference</p>
                    <div className="space-y-2">
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">LR Number</span>
                         <span className="text-sm font-bold font-mono text-gray-900">{podData.lrNumber}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">Transporter</span>
                         <span className="text-sm font-bold text-gray-900">{podData.transporterName || 'Self'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">Vehicle</span>
                         <span className="text-sm font-bold font-mono text-gray-900">{podData.vehicleNumber}</span>
                       </div>
                    </div>
                  </div>
                  <div className="bg-indigo-50/30 p-4 border-b border-gray-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-1">Delivery Details</p>
                    <div className="space-y-2">
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">Delivery Date</span>
                         <span className="text-sm font-bold text-gray-900">{podData.deliveryTimestamp ? new Date(podData.deliveryTimestamp).toLocaleDateString() : 'N/A'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">Delivery Time</span>
                         <span className="text-sm font-bold text-gray-900">{podData.deliveryTimestamp ? new Date(podData.deliveryTimestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-xs text-gray-500">Assigned Carrier</span>
                         <span className="text-sm font-bold text-gray-900">{podData.carrierCompany?.fullName || podData.carrierCompany?.companyName || 'Verified Carrier'}</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Receiver Section */}
                <div className="bg-white border border-gray-100 rounded-xl p-5">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3">Receiver (Consignee) Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400">Company / Name</p>
                      <p className="text-sm font-bold text-gray-900">{podData.consigneeName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Contact Number</p>
                      <p className="text-sm font-bold text-gray-900">{podData.consigneeContact || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-[10px] text-gray-400">Delivery Address</p>
                      <p className="text-sm font-medium text-gray-700">{podData.consigneeAddress || podData.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    </div>
                    <span className="text-emerald-800 font-bold uppercase tracking-wider text-sm">Digitally Verified</span>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-emerald-600 uppercase font-bold">Verification Mode</p>
                    <p className="text-xs font-black text-emerald-800 font-mono">OTP + GPS (STAMPED)</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">

                <button onClick={() => setPodModalOpen(false)} className="px-6 py-3.5 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-all">
                  Close Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Invoice Request Modal */}
      {invoiceModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Generate Invoice</h2>
                  <p className="text-sm text-gray-500">Submit expenses and receipts for LR: <b>{selectedShipment.lrNumber}</b></p>
                </div>
                <button onClick={() => { setInvoiceModalOpen(false); setSelectedShipment(null); }} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleInvoiceRequest} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Waiting Charges</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                      <input 
                        type="number"
                        value={invoiceForm.waitingCharges}
                        onChange={(e) => setInvoiceForm({...invoiceForm, waitingCharges: e.target.value})}
                        required
                        placeholder="0.00"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-7 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Toll Receipt</label>
                    <input 
                      type="file"
                      onChange={(e) => setInvoiceForm({...invoiceForm, tollReceipt: e.target.files[0]})}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Loading/Unloading</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                      <input 
                        type="number"
                        value={invoiceForm.loadingUnloadingCharges}
                        onChange={(e) => setInvoiceForm({...invoiceForm, loadingUnloadingCharges: e.target.value})}
                        required
                        placeholder="0.00"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-7 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fuel Receipt</label>
                    <input 
                      type="file"
                      onChange={(e) => setInvoiceForm({...invoiceForm, fuelReceipt: e.target.files[0]})}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Detention Charges</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₹</span>
                      <input 
                        type="number"
                        value={invoiceForm.detentionCharges}
                        onChange={(e) => setInvoiceForm({...invoiceForm, detentionCharges: e.target.value})}
                        required
                        placeholder="0.00"
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-7 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
                      </div>
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        <b>Verification Check:</b> Invoices are verified against the POD Timestamp (<b>{selectedShipment.deliveryTimestamp ? new Date(selectedShipment.deliveryTimestamp).toLocaleString() : 'N/A'}</b>). Please ensure receipts are from the same date.
                      </p>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={deliveryLoading}
                  className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl transition-all disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-200"
                >
                  {deliveryLoading ? 'Uploading Receipts...' : 'SUBMIT INVOICE REQUEST'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Final Invoice Document Modal */}
      {invoiceDocOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
          {/* Increased max-width for side-by-side layout */}
          <div className="bg-white rounded-none w-full max-w-5xl shadow-2xl animate-in fade-in zoom-in duration-300 border-[8px] border-gray-100 font-sans flex flex-col md:flex-row min-h-[80vh]">
            
            {/* Left Column: Invoice Details */}
            <div className="p-8 md:w-2/3 border-b md:border-b-0 md:border-r border-gray-200">
              <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-6">
                <div>
                  <h1 className="text-3xl font-black text-gray-900 tracking-tighter">INVOICE</h1>
                  <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Digital Freight Receipt</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">LR Number</p>
                  <p className="text-lg font-black text-gray-900">{selectedShipment.lrNumber}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mt-3">Invoice Date</p>
                  <p className="text-xs font-black text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Bill To (Logistics)</p>
                  <p className="text-sm font-black text-gray-900">{selectedShipment.createdBy?.companyName || 'Main Logistics Co.'}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedShipment.createdBy?.fullName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Carrier Provider</p>
                  <p className="text-sm font-black text-gray-900">{selectedShipment.carrierCompany?.companyName || 'Independent Carrier'}</p>
                  <p className="text-xs text-gray-600 mt-1">{selectedShipment.carrierCompany?.fullName}</p>
                  <p className="text-xs text-gray-600 mt-1">Vehicle: <span className="font-bold">{selectedShipment.vehicleNumber}</span></p>
                </div>
              </div>

              <table className="w-full mb-8 text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest text-left">
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Base Freight Charges</p>
                      <p className="text-xs text-gray-500">{selectedShipment.goodsType}</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.freightCharges?.toLocaleString() || '0'}</td>
                  </tr>
                  {selectedShipment.otherCharges > 0 && (
                    <tr>
                      <td className="py-4">
                        <p className="font-black text-gray-900">Pre-agreed Other Charges</p>
                        <p className="text-xs text-gray-500">From initial shipment quote</p>
                      </td>
                      <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.otherCharges?.toLocaleString() || '0'}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Fuel Surcharge (Extracted)</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.fuelAmount?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Toll Expenses (Extracted)</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.tollAmount?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Waiting Charges</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.waitingCharges?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Loading/Unloading</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.loadingUnloadingCharges?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Detention Charges</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.detentionCharges?.toLocaleString() || '0'}</td>
                  </tr>

                </tbody>
              </table>

              <div className="flex justify-end pt-6 border-t-[3px] border-gray-900">
                <div className="w-56">
                   <div className="flex justify-between items-center mb-3 text-xs">
                      <span className="text-gray-400 font-bold uppercase">Base + Extras Subtotal</span>
                      <span className="text-sm font-black text-gray-900">₹{(selectedShipment.totalCarrierPayment + (selectedShipment.totalCharges || selectedShipment.freightCharges || 0)).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pt-3 border-t-[3px] border-gray-900">
                      <span className="text-sm font-black text-gray-900 uppercase">Grand Invoice Total</span>
                      <span className="text-xl font-black text-gray-900 tracking-tighter">₹{(selectedShipment.totalCarrierPayment + (selectedShipment.totalCharges || selectedShipment.freightCharges || 0)).toLocaleString()}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Right Column: POD Sidebar */}
            <div className="p-8 md:w-1/3 bg-gray-50 flex flex-col justify-between">
              <div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest border-b-2 border-gray-200 pb-3 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Proof of Delivery
                </h2>

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="inline-flex py-1.5 px-3 bg-emerald-100 text-emerald-800 rounded font-black text-xs uppercase tracking-wide">
                      Successfully Delivered
                    </div>
                  </div>

                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Timestamp</p>
                     <p className="text-sm font-bold text-gray-900">{selectedShipment.deliveryTimestamp ? new Date(selectedShipment.deliveryTimestamp).toLocaleString() : 'N/A'}</p>
                     <p className="text-[9px] text-gray-400 mt-1 uppercase">Indian Standard Time</p>
                  </div>

                  <div>
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location Verified</p>
                     <p className="text-xs font-bold text-gray-700 leading-relaxed">
                       {selectedShipment.deliveryLocation?.address || 'GPS Coordinates Logged'}
                     </p>
                     {selectedShipment.deliveryLocation?.lat && (
                       <p className="text-[9px] font-mono text-gray-500 mt-1">
                         LAT: {selectedShipment.deliveryLocation.lat.toFixed(4)} | LNG: {selectedShipment.deliveryLocation.lng.toFixed(4)}
                       </p>
                     )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Verification Method</p>
                    <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-900">OTP Match</p>
                        <p className="text-[10px] text-gray-500">Consignee securely validated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Digital Footprint */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                 <div className="flex gap-3 mb-6 opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR" className="w-12 h-12" />
                    <div>
                       <p className="text-[9px] font-black uppercase mb-1">Digital Signature</p>
                       <p className="text-[8px] font-mono leading-none break-all w-32">{selectedShipment._id}</p>
                    </div>
                 </div>
                 <button onClick={() => setInvoiceDocOpen(false)} className="w-full bg-gray-900 text-white px-6 py-3 font-bold text-xs hover:bg-black uppercase tracking-widest transition-colors rounded-none shadow-md">
                   Close Ticket
                 </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CarrierDashboard
