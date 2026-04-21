'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <div className="text-2xl font-bold text-green-400">⛳ GolfGives</div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 border border-white/20 rounded-xl text-white/70 hover:text-white transition text-sm">
            Login
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition text-sm">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-bold px-4 py-2 rounded-full mb-8">
          ⛳ Golf · Prizes · Charity
        </div>
        <h1 className="text-6xl md:text-7xl font-black leading-tight mb-6">
          Play Golf.<br />
          <span className="text-green-400">Win Prizes.</span><br />
          Give Back.
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
          Submit your golf scores, enter monthly prize draws, and automatically donate to charity — all for £9.99/month.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-black rounded-2xl text-lg transition">
            Start Playing → 
          </Link>
          <Link href="/login" className="px-8 py-4 border border-white/20 hover:border-white/40 text-white font-bold rounded-2xl text-lg transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-4xl font-black text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '🏌️', step: '01', title: 'Submit Your Score', desc: 'Enter your Stableford score after every round of golf' },
            { icon: '🎰', step: '02', title: 'Enter Monthly Draw', desc: 'Your scores automatically enter you into the monthly prize draw' },
            { icon: '❤️', step: '03', title: 'Support Charity', desc: '10% of your subscription goes to your chosen charity every month' },
          ].map(item => (
            <div key={item.step} className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <div className="text-5xl mb-4">{item.icon}</div>
              <div className="text-green-400 text-sm font-bold mb-2">STEP {item.step}</div>
              <h3 className="text-xl font-black mb-3">{item.title}</h3>
              <p className="text-white/50">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-4xl font-black mb-4">Simple Pricing</h2>
        <p className="text-white/50 mb-12">No hidden fees. Cancel anytime.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <div className="text-lg font-bold mb-2">Monthly</div>
            <div className="text-5xl font-black text-green-400 mb-4">£9.99<span className="text-lg text-white/40">/mo</span></div>
            <ul className="text-white/50 space-y-2 text-sm text-left mb-6">
              <li>✅ Unlimited score entries</li>
              <li>✅ Monthly prize draw</li>
              <li>✅ 10% to your charity</li>
            </ul>
            <Link href="/signup" className="block w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition">
              Get Started
            </Link>
          </div>
          <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 relative">
            <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">SAVE 20%</div>
            <div className="text-lg font-bold mb-2">Yearly</div>
            <div className="text-5xl font-black text-green-400 mb-4">£95.99<span className="text-lg text-white/40">/yr</span></div>
            <ul className="text-white/50 space-y-2 text-sm text-left mb-6">
              <li>✅ Everything in Monthly</li>
              <li>✅ 2 months free</li>
              <li>✅ Priority support</li>
            </ul>
            <Link href="/signup" className="block w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition">
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 text-center text-white/30 text-sm">
        © 2025 GolfGives · Golf · Prizes · Charity
      </footer>
    </main>
  )
}