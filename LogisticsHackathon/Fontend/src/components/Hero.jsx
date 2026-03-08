import React from 'react'

const Hero = () => {
  return (
    <section id="home" className="bg-gradient-to-br from-[#e8f0ef] via-[#f8fafc] to-[#e6f2f0] min-h-[88vh] pt-28 pb-20 relative overflow-hidden flex items-center">

      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#64748b 1px, transparent 1px), linear-gradient(90deg, #64748b 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-200/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-200/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-8 w-full relative z-10">
        <div className="max-w-4xl text-left md:ml-12 lg:ml-24 ml-24">

          {/* Label pill */}
          <div className="inline-flex items-center bg-white/80 backdrop-blur-md border border-slate-200/60 text-slate-600 rounded-full px-4 py-1.5 text-xs  font-semibold tracking-wide mb-6 shadow-sm gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Empowering Modern Logistics
          </div>

          {/* Heading — controlled size */}
          <h1 className="text-4xl md:text-5xl lg:text-[2.75rem] font-bold text-slate-900 leading-[1.2] mb-6 tracking-tight">
            Bring Trust Back to
            <span className="block text-teal-600 mt-1">
              Logistics Documents
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-lg font-medium text-slate-600 mb-8 w-fit border-y border-slate-100 py-3">
            LR • POD • Invoices • Finally in Sync
          </p>

          {/* Subtext */}
          <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            CargoIntel helps logistics companies verify shipment documents, calculate carrier payments, and detect suspicious charges before they become financial losses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 justify-start mb-20">
          </div>

          {/* Floating stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '📦', value: '420+', label: 'Shipments', bg: 'bg-white', accent: 'text-teal-600' },
              { icon: '🛡️', value: '12', label: 'Fraud Alerts', bg: 'bg-white', accent: 'text-rose-500' },
              { icon: '💰', value: '₹12.5L', label: 'Payments', bg: 'bg-white', accent: 'text-emerald-600' },
              { icon: '✅', value: '380', label: 'Verified', bg: 'bg-white', accent: 'text-sky-600' },
            ].map(card => (
              <div key={card.label} className={`${card.bg} rounded-xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 hover:border-teal-100 transition-all text-left`}>
                <p className={`text-xl font-bold ${card.accent} mb-1`}>{card.value}</p>
                <p className="text-slate-400 text-[0.7rem] uppercase tracking-wider font-semibold">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Powered by badge */}
          <div className="mt-16 pt-8 border-t border-slate-100/50 flex flex-wrap items-center justify-start gap-x-8 gap-y-4 text-slate-400 text-xs font-medium">
            <span className="flex items-center gap-2 tracking-wide uppercase">AI & OCR DOCUMENTation</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-2 tracking-wide uppercase">REAL-TIME ANOMALY DETECTION</span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-2 tracking-wide uppercase">SECURE AUDIT TRAILS</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
