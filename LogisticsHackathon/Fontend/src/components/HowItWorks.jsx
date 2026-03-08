import React from 'react'

const steps1 = [
  { icon: '📄', title: 'LR Document Processing', desc: 'Extract shipment data from LR documents using OCR.' },
  { icon: '🛡️', title: 'AI Extracts Data', desc: 'Confirm delivery authenticity using OTP and GPS validation.' },
  { icon: '🔍', title: 'Fraud Detection', desc: 'Detect mismatched invoices and abnormal carrier charges.' },
]

const steps2 = [
  { icon: '📂', title: 'Upload LR Document', desc: 'Logistics company uploads LR documents using OCR-based document intelligence.' },
  { icon: '📍', title: 'AI Extracts Shipment Data', desc: 'System extracts shipment data' },
  { icon: '📋', title: 'Fraud Updates', desc: 'Carrier uploads POD' },
]

const ArrowIcon = () => (
  <div className="hidden lg:flex items-center justify-center text-teal-300 w-8 flex-shrink-0">
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  </div>
)

const HowItWorks = () => {
  return (
    <>
      {/* Section 1 — white background */}
      <section id="workflow" className="bg-[#fdfdfd] py-32 border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5 tracking-tight">
              From Document Upload to Fraud Detection —{' '}
              <span className="text-[#5c8a70]">Automatically</span>
            </h2>
            <p className="text-gray-500 text-xl max-w-2xl mx-auto">
              CargoIntel automates the entire logistics document reconciliation process.
            </p>
          </div>

          {/* Horizontal flow */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-2 justify-center max-w-6xl mx-auto">
            {steps1.map((step, i) => (
              <React.Fragment key={step.title}>
                <div className="flex-1 bg-white border border-gray-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all group flex gap-6 items-start">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-[#e6f2f0] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl mb-3">{step.title}</h3>
                    <p className="text-gray-500 text-base leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < steps1.length - 1 && <ArrowIcon />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2 — light grey bg with landscape background illusion */}
      <section className="bg-[#f4f7f6] py-32 relative overflow-hidden">
        {/* Decorative curvy background blob */}
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white to-transparent opacity-60" />
        
        <div className="max-w-[1400px] mx-auto px-8 relative z-10">


          {/* Horizontal flow with dark green steps matching reference */}
          <div className="flex flex-col lg:flex-row items-stretch gap-6 lg:gap-2 justify-center max-w-6xl mx-auto">
            {steps2.map((step, i) => (
              <React.Fragment key={step.title}>
                <div className="flex-1 bg-white/80 backdrop-blur-md border border-white/40 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all group flex gap-6 items-center">
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-[#5c8a70] to-[#3a6850] flex items-center justify-center text-white text-3xl shadow-lg shadow-[#5c8a70]/30 group-hover:scale-105 transition-transform">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold text-xl mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-base leading-relaxed">{step.desc}</p>
                  </div>
                </div>
                {i < steps2.length - 1 && <ArrowIcon />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

    </>
  )
}

export default HowItWorks
