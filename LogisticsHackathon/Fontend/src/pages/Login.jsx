import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast, { Toaster } from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.post('/auth/login', form)
      toast.success('Logged in successfully!')
      
      localStorage.setItem('user', JSON.stringify(response.data))

      setTimeout(() => {
        setLoading(false)
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      setLoading(false)
      toast.error(error.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
      <Toaster position="top-center" />
      <div className="w-full max-w-xl">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-12 py-12">

          {/* Heading */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Sign in to your account</h1>
            <p className="text-gray-400 text-base">Enter your credentials to continue.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input type="email" name="email" placeholder="you@company.com"
                value={form.email} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all bg-gray-50" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <a href="#" className="text-[#5c8a70] text-xs font-semibold hover:underline">Forgot password?</a>
              </div>
              <input type="password" name="password" placeholder="••••••••"
                value={form.password} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-4 text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c8a70]/30 focus:border-[#5c8a70] transition-all bg-gray-50" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#5c8a70] hover:bg-[#4b725c] disabled:opacity-70 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-[#5c8a70]/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-1">
              {loading
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Signing in...</>
                : 'Sign In →'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <p className="text-center text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#5c8a70] font-bold hover:underline">Create account</Link>
          </p>
        </div>

        <div className="text-center mt-5">
          <Link to="/" className="text-gray-400 hover:text-gray-600 text-xs transition-colors">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
