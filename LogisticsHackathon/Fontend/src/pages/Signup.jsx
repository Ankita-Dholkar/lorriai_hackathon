import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast, { Toaster } from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', password: '', confirmPassword: '', role: '', companyName: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!')
      return
    }
    setLoading(true)

    try {
      const response = await api.post('/auth/register', form)
      toast.success('Account created successfully!')
      
      localStorage.setItem('user', JSON.stringify(response.data))

      setTimeout(() => {
        setLoading(false)
        navigate('/login')
      }, 1500)
    } catch (error) {
      setLoading(false)
      toast.error(error.response?.data?.message || 'Failed to register account')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-10 py-25">
      <Toaster position="top-right" />
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 px-10 pt-10 pb-10">

          {/* Top icon */}
          <div className="flex flex-col items-center mt-10 mb-7">
            <div className="w-16 h-16 rounded-full bg-[#5c8a70] flex items-center justify-center mb-4 shadow-lg shadow-[#5c8a70]/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Create your Account</h1>
            <p className="text-gray-500 text-sm mt-1">Register to get started with CargoIntel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Name
              </label>
              <input type="text" name="fullName" placeholder="e.g. Ananya Sharma"
                value={form.fullName} onChange={handleChange} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all" />
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input type="email" name="email" placeholder="you@company.com"
                value={form.email} onChange={handleChange} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all" />
            </div>

            {/* Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <input type="password" name="password" placeholder="Minimum 8 characters"
                value={form.password} onChange={handleChange} required minLength={8}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all" />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Confirm Password
              </label>
              <input type="password" name="confirmPassword" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={handleChange} required minLength={8}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all" />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Mobile Number
              </label>
              <input type="tel" name="mobile" placeholder="e.g. 9876543210"
                value={form.mobile} onChange={handleChange} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all" />
            </div>

            {/* Role */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Role
              </label>
              <select name="role" value={form.role} onChange={handleChange} required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all cursor-pointer appearance-none">
                <option value="" disabled>Select your role</option>
                <option value="logistics_company">Logistics Company</option>
                <option value="carrier">Carrier</option>
              </select>
            </div>

            {/* Company Name - only for Logistics Company */}
            {form.role === 'logistics_company' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <svg className="w-4 h-4 text-[#5c8a70]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Company Name
                </label>
                <input type="text" name="companyName" placeholder="e.g. Delhivery Pvt. Ltd."
                  value={form.companyName} onChange={handleChange} required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all" />
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full bg-[#5c8a70] hover:bg-[#4b725c] disabled:opacity-70 text-white font-bold text-base py-4 rounded-xl transition-all shadow-lg shadow-[#5c8a70]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Creating account...</>
              ) : (
                <><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg> Create Account</>
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#5c8a70] font-bold hover:underline">Login here</Link>
          </p>
        </div>

        {/* Back to home */}
        <div className="text-center mt-5">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
