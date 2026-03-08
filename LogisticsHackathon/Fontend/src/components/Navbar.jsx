import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const links = ['Home', 'Platform', 'Workflow', 'Demo', 'Team']

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-8 py-5 flex items-center justify-between">
          
          {/* Logo */}
          <a href="#home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0FA4A8] to-[#10b981] flex items-center justify-center shadow-lg shadow-teal-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span className="text-gray-900 font-extrabold text-2xl tracking-tight">CargoIntel</span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-10">
            {links.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} 
                className="text-gray-500 hover:text-gray-900 text-base font-semibold transition-colors">
                {link}
              </a>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900 text-base font-semibold px-4 py-2 hover:bg-gray-50 rounded-xl transition-all">
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="border border-[#5c8a70] text-[#5c8a70] hover:bg-[#5c8a70]/5 text-base font-semibold px-6 py-2.5 rounded-xl transition-all">
              Sign Up
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-[#5c8a70] hover:bg-[#4b725c] text-white text-base font-semibold px-7 py-3 rounded-xl transition-all shadow-lg shadow-[#5c8a70]/30 hover:-translate-y-0.5"
            >
              Try Demo
            </button>
          </div>

          {/* Mobile toggle */}
          <button className="lg:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 px-8 py-6 flex flex-col gap-4 shadow-xl">
            {links.map(link => (
              <a key={link} href={`#${link.toLowerCase()}`} 
                className="text-gray-600 hover:text-gray-900 py-2 text-lg font-semibold"
                onClick={() => setMenuOpen(false)}>
                {link}
              </a>
            ))}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <button className="w-full bg-gray-50 text-gray-900 text-lg font-semibold py-3 rounded-xl">Login</button>
              <button 
                onClick={() => { navigate('/signup'); setMenuOpen(false); }} 
                className="w-full bg-[#5c8a70] text-white text-lg font-semibold py-3 rounded-xl shadow-lg"
              >
                Try Demo
              </button>
            </div>
          </div>
        )}
      </nav>

    </>  
  )
}

export default Navbar
