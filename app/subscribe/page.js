'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Subscribe() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState('monthly')
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      setUser(user)
    }
    getUser()
  }, [])

  const handleSubscribe = async () => {
    setLoading(true)
    const renewalDate = new Date()
    if (plan === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1)
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_status: 'active',
        subscription_renewal_date: renewalDate.toISOString().split('T')[0]
      })
      .eq('id', user.id)

    if (!error) {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGives</Link>
          <h1 className="text-4xl font-black mt-4">Choose Your Plan</h1>
          <p className="text-white/50 mt-2">Join thousands of golfers making a difference</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Plan */}
          <div
            onClick={() => setPlan('monthly')}
            className={`cursor-pointer border-2 rounded-2xl p-8 transition ${
              plan === 'monthly'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="text-lg font-bold mb-1">Monthly</div>
            <div className="text-4xl font-black text-green-400 mb-2">£9.99<span className="text-lg text-white/50">/mo</span></div>
            <ul className="text-white/60 space-y-2 text-sm">
              <li>✅ Full platform access</li>
              <li>✅ Monthly prize draws</li>
              <li>✅ Charity contribution</li>
              <li>✅ Score tracking</li>
            </ul>
          </div>

          {/* Yearly Plan */}
          <div
            onClick={() => setPlan('yearly')}
            className={`cursor-pointer border-2 rounded-2xl p-8 transition relative ${
              plan === 'yearly'
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/30'
            }`}
          >
            <div className="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full">
              SAVE 20%
            </div>
            <div className="text-lg font-bold mb-1">Yearly</div>
            <div className="text-4xl font-black text-green-400 mb-2">£95.99<span className="text-lg text-white/50">/yr</span></div>
            <ul className="text-white/60 space-y-2 text-sm">
              <li>✅ Full platform access</li>
              <li>✅ Monthly prize draws</li>
              <li>✅ Charity contribution</li>
              <li>✅ Score tracking</li>
              <li>✅ 2 months free!</li>
            </ul>
          </div>
        </div>

        {/* Charity Note */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-center">
          <div className="text-2xl mb-2">❤️</div>
          <p className="text-white/70">
            <span className="text-white font-bold">10% of your subscription</span> goes directly to your chosen charity every month
          </p>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-5 rounded-2xl text-xl transition"
        >
          {loading ? 'Processing...' : `Subscribe ${plan === 'monthly' ? 'Monthly' : 'Yearly'} →`}
        </button>

        <p className="text-center text-white/30 text-sm mt-4">
          Cancel anytime · Secure payment · No hidden fees
        </p>
      </div>
    </main>
  )
}