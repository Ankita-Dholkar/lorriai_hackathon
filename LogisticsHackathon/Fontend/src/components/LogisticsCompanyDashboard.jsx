import React, { useState, useEffect } from 'react'
import api from '../utils/api'

const LogisticsCompanyDashboard = ({ user, onCreateShipment }) => {
  const [shipments, setShipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [approving, setApproving] = useState(false)
  const [invoiceDocOpen, setInvoiceDocOpen] = useState(false)

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const res = await api.get('/shipments')
        setShipments(res.data)
      } catch (err) {
        console.error('Failed to fetch shipments:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShipments()
  }, [])

  const handleApproveInvoice = async () => {
    try {
      setApproving(true)
      const res = await api.patch(
        `/shipments/${selectedShipment._id}/approve-invoice`,
        {}
      )
      toast.success('Invoice Approved and Generated!')
      setShipments(shipments.map(s => s._id === res.data.shipment._id ? res.data.shipment : s))
      setReviewModalOpen(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to approve invoice')
    } finally {
      setApproving(false)
    }
  }

  const handleDeleteShipment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this shipment?")) return;
    try {
      await api.delete(`/shipments/${id}`)
      setShipments(shipments.filter(s => s._id !== id))
    } catch (err) {
      console.error('Failed to delete shipment', err)
      // toast.error('Failed to delete shipment')
    }
  }

  const safeShipments = Array.isArray(shipments) ? shipments : []
  const activeCount = safeShipments.filter(s => s && s.status !== 'Delivered' && s.status !== 'Cancelled').length
  const deliveredCount = safeShipments.filter(s => s && s.status === 'Delivered').length
  const inTransitCount = safeShipments.filter(s => s && s.status === 'In Transit').length
  const pendingCount = safeShipments.filter(s => s && (s.status === 'Draft' || s.status === 'Pending')).length

  const stats = [
    {
      label: 'Active Shipments',
      value: activeCount.toString(),
      change: '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Delivered',
      value: deliveredCount.toString(),
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
      label: 'In Transit',
      value: inTransitCount.toString(),
      change: '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: 'Pending Approvals',
      value: pendingCount.toString(),
      change: '—',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ]

  const quickActions = [
    {
      label: 'Create Shipment',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
      primary: true,
      onClick: onCreateShipment,
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="text-[#5c8a70]">{user.fullName}</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.companyName} — Logistics Company Dashboard
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

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map((a, i) => (
          <button
            key={i}
            onClick={a.onClick}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 ${
              a.primary
                ? 'bg-[#5c8a70] text-white shadow-lg shadow-[#5c8a70]/25 hover:bg-[#4b725c]'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Shipments Table */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Recent Shipments</h2>
            <button className="text-[#5c8a70] text-sm font-semibold hover:underline">View All →</button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="w-8 h-8 animate-spin text-[#5c8a70]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            </div>
          ) : safeShipments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-6 py-4">LR Number</th>
                    <th className="px-6 py-4">Consignee</th>
                    <th className="px-6 py-4">Vehicle</th>
                    <th className="px-6 py-4">Total </th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {safeShipments.map((shipment) => (
                    <tr key={shipment._id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#5c8a70]/10 flex items-center justify-center text-[#5c8a70]">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{shipment.lrNumber || 'N/A'}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {shipment._id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900">{shipment.consigneeName || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{(shipment.consigneeAddress || '').substring(0, 20)}...</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                        {shipment.vehicleNumber || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">₹{shipment.totalCharges?.toLocaleString() || '0'}</p>
                        <p className="text-[10px] text-gray-400">{shipment.freightType}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          shipment.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          shipment.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          shipment.status === 'Assigned' ? 'bg-violet-50 text-violet-700 border-violet-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {shipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          {shipment.invoiceStatus === 'Requested' && (
                            <button 
                              onClick={() => { setSelectedShipment(shipment); setReviewModalOpen(true); }}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors border border-orange-100"
                            >
                              Review Invoice
                            </button>
                          )}
                          {shipment.invoiceStatus === 'Generated' && (
                            <button 
                              onClick={() => { setSelectedShipment(shipment); setInvoiceDocOpen(true); }}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-100 shadow-sm"
                            >
                              View Invoice
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteShipment(shipment._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete Shipment"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
              <p className="text-sm font-medium text-gray-400">No shipments yet</p>
              <p className="text-xs text-gray-300 mt-1">Create your first shipment to get started</p>
            </div>
          )}
        </div>

        {/* Fraud Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Fraud Alerts</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border border-gray-100 ${shipments.filter(s => s.invoiceStatus === 'Requested' && s.riskLevel === 'High').length > 0 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              {shipments.filter(s => s.invoiceStatus === 'Requested' && s.riskLevel === 'High').length} New
            </span>
          </div>
          <div className="p-4 space-y-3">
            {shipments.filter(s => s.invoiceStatus === 'Requested' && s.riskLevel === 'High').map(s => (
              <div key={s._id} className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-red-900">LR: {s.lrNumber}</p>
                  <p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">High Risk Detected</p>
                </div>
                <button 
                  onClick={() => { setSelectedShipment(s); setReviewModalOpen(true); }}
                  className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Review
                </button>
              </div>
            ))}
            {shipments.filter(s => s.invoiceStatus === 'Requested' && s.riskLevel === 'High').length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                <svg className="w-10 h-10 text-gray-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No critical alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Review Modal */}
      {reviewModalOpen && selectedShipment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Invoice Review</h2>
                  <p className="text-sm text-gray-500">Carrier Request for LR: <b>{selectedShipment.lrNumber}</b></p>
                </div>
                <button onClick={() => setReviewModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Agent-3 Fraud Detection Engine Header */}
                <div className={`p-6 rounded-3xl border-2 ${selectedShipment.riskLevel === 'High' ? 'bg-red-50 border-red-200' : selectedShipment.riskLevel === 'Medium' ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'} animate-in fade-in slide-in-from-top-4 duration-500`}>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className={`text-lg font-black tracking-tight ${selectedShipment.riskLevel === 'High' ? 'text-red-900' : selectedShipment.riskLevel === 'Medium' ? 'text-orange-900' : 'text-emerald-900'}`}>
                        FRAUD RISK ENGINE (AGENT-3)
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                         {selectedShipment.fraudReasons?.map((reason, i) => (
                           <span key={i} className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${selectedShipment.riskLevel === 'High' ? 'bg-red-200 text-red-900' : 'bg-orange-200 text-orange-900'}`}>
                             {reason}
                           </span>
                         ))}
                      </div>
                    </div>
                    <div className="text-right">
                       <p className={`text-4xl font-black ${selectedShipment.riskLevel === 'High' ? 'text-red-600' : 'text-emerald-600'}`}>{selectedShipment.fraudProbability}%</p>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fraud Probability</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    {/* Graph 1: Probability Gauge */}
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Risk Level: <span className={selectedShipment.riskLevel === 'High' ? 'text-red-900' : 'text-emerald-900'}>{selectedShipment.riskLevel?.toUpperCase()} FRAUD RISK</span></p>
                       <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden border border-gray-100">
                          <div 
                            className={`h-full transition-all duration-1000 ${selectedShipment.riskLevel === 'High' ? 'bg-red-600' : selectedShipment.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-emerald-500'}`}
                            style={{ width: `${selectedShipment.fraudProbability}%` }}
                          ></div>
                       </div>
                    </div>

                    {/* Graph 2: Expected vs Unexpected Price Difference (Horizontal Bar Chart) */}
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Price Variance Analysis</p>
                       <div className="space-y-4">
                         {/* Expected (Total) */}
                         <div>
                           <div className="flex justify-between text-xs font-bold mb-1">
                             <span className="text-gray-500 uppercase">Expected (Total)</span>
                             <span className="text-gray-900">₹{(selectedShipment.totalCharges || selectedShipment.freightCharges || 0).toLocaleString()}</span>
                           </div>
                           <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                           </div>
                         </div>
                         {/* Unexpected / Total Requested */}
                         <div>
                           <div className="flex justify-between text-xs font-bold mb-1">
                             <span className="text-gray-500 uppercase">Requested (Total)</span>
                             <span className={selectedShipment.riskLevel === 'High' ? 'text-red-600' : selectedShipment.riskLevel === 'Medium' ? 'text-orange-500' : 'text-emerald-500'}>
                               ₹{(selectedShipment.totalCarrierPayment || 0).toLocaleString()}
                             </span>
                           </div>
                           <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                             {/* Base matching expected */}
                             <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, ((selectedShipment.totalCharges || selectedShipment.freightCharges || 1) / Math.max(selectedShipment.totalCarrierPayment || 1, selectedShipment.totalCharges || selectedShipment.freightCharges || 1)) * 100)}%` }}></div>
                             {/* Excess/Unexpected part */}
                             {selectedShipment.totalCarrierPayment > (selectedShipment.totalCharges || selectedShipment.freightCharges || 0) && (
                               <div 
                                 className={`h-full ${selectedShipment.riskLevel === 'High' ? 'bg-red-500' : 'bg-orange-400'}`} 
                                 style={{ width: `${((selectedShipment.totalCarrierPayment - (selectedShipment.totalCharges || selectedShipment.freightCharges || 0)) / selectedShipment.totalCarrierPayment) * 100}%` }}
                               ></div>
                             )}
                           </div>
                           {selectedShipment.totalCarrierPayment > (selectedShipment.totalCharges || 0) && (
                              <p className={`text-[9px] font-bold mt-1 text-right uppercase tracking-wider ${selectedShipment.riskLevel === 'High' ? 'text-red-500' : 'text-orange-500'}`}>
                                +₹{(selectedShipment.totalCarrierPayment - (selectedShipment.totalCharges || 0)).toLocaleString()} Unexpected
                              </p>
                           )}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Verification Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 mb-1">POD Verification</p>
                    <p className="text-sm font-black text-emerald-900">{selectedShipment.deliveryTimestamp ? new Date(selectedShipment.deliveryTimestamp).toLocaleString() : 'N/A'}</p>
                    <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                      OTP & GPS Verified
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-blue-600 mb-1">Total Charges Requested</p>
                    <p className="text-sm font-black text-blue-900">₹{(selectedShipment.totalCarrierPayment).toLocaleString()}</p>
                    <p className="text-[10px] text-blue-500 mt-1">Includes extracted fuel/toll & manual entries</p>
                  </div>
                </div>

                {/* Expense Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Expense Details & Receipts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-600 block mb-1">Waiting Charges</span>
                      <span className="text-sm font-black text-gray-900">₹{selectedShipment.waitingCharges?.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-600 block mb-1">Loading/Unloading</span>
                      <span className="text-sm font-black text-gray-900">₹{selectedShipment.loadingUnloadingCharges?.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <span className="text-xs font-bold text-gray-600 block mb-1">Detention Charges</span>
                      <span className="text-sm font-black text-gray-900">₹{selectedShipment.detentionCharges?.toLocaleString()}</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-6">Expense Receipts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Toll */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-600">Toll Receipt (Extracted)</span>
                        <span className="text-sm font-black text-gray-900">₹{selectedShipment.tollAmount?.toLocaleString() || 0}</span>
                      </div>
                      {selectedShipment.tollReceiptUrl ? (
                        <a href={selectedShipment.tollReceiptUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 bg-gray-200 rounded-lg overflow-hidden relative group">
                          <img src={selectedShipment.tollReceiptUrl} alt="Toll Receipt" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            View Receipt
                          </div>
                        </a>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs italic">No Receipt Uploaded</div>
                      )}
                    </div>
                    {/* Fuel */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-600">Fuel Receipt (Extracted)</span>
                        <span className="text-sm font-black text-gray-900">₹{selectedShipment.fuelAmount?.toLocaleString() || 0}</span>
                      </div>
                      {selectedShipment.fuelReceiptUrl ? (
                        <a href={selectedShipment.fuelReceiptUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-32 bg-gray-200 rounded-lg overflow-hidden relative group">
                          <img src={selectedShipment.fuelReceiptUrl} alt="Fuel Receipt" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                            View Receipt
                          </div>
                        </a>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs italic">No Receipt Uploaded</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={handleApproveInvoice}
                    disabled={approving}
                    className="flex-1 bg-[#5c8a70] hover:bg-[#4b725c] text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    {approving ? 'Generating...' : 'APPROVE & GENERATE INVOICE'}
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </button>
                  <button onClick={() => setReviewModalOpen(false)} className="px-8 py-4 bg-gray-50 border border-gray-200 text-gray-600 font-bold rounded-2xl hover:bg-gray-100 transition-all">
                    Reject
                  </button>
                </div>
              </div>
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
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Carrier Provider</p>
                  <p className="text-sm font-black text-gray-900">{selectedShipment.carrierCompany?.companyName || 'Independent Carrier'}</p>
                  <p className="text-xs text-gray-600">Vehicle: <span className="font-bold">{selectedShipment.vehicleNumber}</span></p>
                </div>
              </div>

              <table className="w-full mb-8 text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Base Freight Charges</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.freightCharges?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Fuel Surcharge (Extracted)</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.fuelAmount?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Toll Expenses (Extracted)</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.tollAmount?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Waiting Charges</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.waitingCharges?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Loading/Unloading</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.loadingUnloadingCharges?.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-4">
                      <p className="font-black text-gray-900">Detention Charges</p>
                    </td>
                    <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.detentionCharges?.toLocaleString()}</td>
                  </tr>
                  {selectedShipment.additionalCharges > 0 && (
                    <tr>
                      <td className="py-4">
                        <p className="font-black text-gray-900">Additional Charges</p>
                      </td>
                      <td className="py-4 text-right font-black text-gray-900">₹{selectedShipment.additionalCharges?.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-end pt-6 border-t-[3px] border-gray-900">
                <div className="w-56">
                   <div className="flex justify-between items-center mb-3 text-xs">
                      <span className="text-gray-400 font-bold uppercase">Subtotal</span>
                      <span className="font-black text-gray-900">₹{(selectedShipment.totalCarrierPayment + selectedShipment.freightCharges).toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-sm font-black text-gray-900 uppercase">Grand Total</span>
                      <span className="text-xl font-black text-gray-900 tracking-tighter">₹{(selectedShipment.totalCarrierPayment + selectedShipment.freightCharges).toLocaleString()}</span>
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

export default LogisticsCompanyDashboard
