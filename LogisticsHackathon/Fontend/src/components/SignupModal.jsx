import React, { useState } from 'react'

const SignupModal = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState('signup') // 'signup' or 'login'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'carrier' })

  if (!isOpen) return null

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = e => {
    e.preventDefault()
    // TODO: connect to backend API
    alert(`${tab === 'signup' ? 'Account created' : 'Logged in'} as ${form.email}!`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Top color bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 to-green-600" />

        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-gray-900 font-bold text-lg">CargoIntel</span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Login
            </button>
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            {tab === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {tab === 'signup' ? 'Start verifying logistics documents with AI.' : 'Sign in to your CargoIntel dashboard.'}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ananya Sharma"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all"
              />
            </div>

            {tab === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition-all bg-white"
                >
                  <option value="carrier">Carrier / Transporter</option>
                  <option value="logistics">Logistics Manager</option>
                  <option value="admin">Admin</option>
                  <option value="finance">Finance / Accounts</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-green-600/20 text-sm"
            >
              {tab === 'signup' ? '🚀 Create Account' : '→ Sign In'}
            </button>
          </form>

          {/* Switch tab link */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {tab === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
            <button onClick={() => setTab(tab === 'signup' ? 'login' : 'signup')} className="text-green-600 font-semibold hover:underline">
              {tab === 'signup' ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>

        {/* Close button */}
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default SignupModal
