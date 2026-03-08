import React from 'react'

const brands = [
  { name: 'FreightMan', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Frontier_Airlines_logo.svg/512px-Frontier_Airlines_logo.svg.png' },
  { name: 'Delhivery', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Delhivery_Logo.svg/512px-Delhivery_Logo.svg.png' },
  { name: 'PIGEON', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Pigeon_logo.svg/512px-Pigeon_logo.svg.png' },
  { name: 'BlueDart', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Dart_logo.svg/512px-Blue_Dart_logo.svg.png' },
  { name: 'MAERSK', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Maersk_Group_Logo.svg/512px-Maersk_Group_Logo.svg.png' },
]

const Partners = () => (
  <section className="bg-white border-b border-gray-100 py-16">
    <div className="max-w-[1400px] mx-auto px-8">
      <div className="flex flex-wrap items-center justify-center gap-x-24 gap-y-10 opacity-70">
        {brands.map(b => (
          <div key={b.name} className="flex items-center gap-3 grayscale hover:grayscale-0 transition-all cursor-pointer opacity-70 hover:opacity-100">
            {/* Very simple placeholder styling since we don't have real logos */}
            <span className="font-bold text-2xl text-gray-500 tracking-wider">
              {b.name.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default Partners
