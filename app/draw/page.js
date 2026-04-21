'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Draw() {
  const [draws, setDraws] = useState([])
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)

      const { data: draws } = await supabase
        .from('draws').select('*').order('draw_month', { ascending: false })
      setDraws(draws || [])

      const { data: scores } = await supabase
        .from('scores').select('*').eq('user_id', user.id)
      setScores(scores || [])

      setLoading(false)
    }
    init()
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-green-400 text-xl">Loading draws...</div>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white">
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGives</Link>
        <Link href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3">Monthly Draw 🎰</h1>
          <p className="text-white/50">Your scores enter you into the monthly prize draw</p>
        </div>

        {/* User's scores summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-10">
          <h2 className="text-xl font-bold mb-4">Your Entry Numbers</h2>
          {scores.length === 0 ? (
            <p className="text-white/40">No scores submitted yet. <Link href="/dashboard" className="text-green-400 underline">Submit a score</Link> to enter the draw!</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {scores.map((score, i) => (
                <div key={score.id} className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 text-center">
                  <div className="text-green-400 font-black text-lg">{score.score}</div>
                  <div className="text-white/40 text-xs">{score.course_name || 'Score ' + (i+1)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Draw Results */}
        <h2 className="text-2xl font-black mb-6">Draw Results</h2>
        {draws.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <div className="text-5xl mb-4">🎰</div>
            <p>No draws have been run yet</p>
            <p className="text-sm mt-2">Check back after the monthly draw!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {draws.map(draw => (
              <div key={draw.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{draw.draw_month}</h3>
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                    {draw.status}
                  </span>
                </div>
                <div className="flex gap-3 mb-4">
                  {(draw.drawn_numbers || []).map((num, i) => (
                    <span key={i} className="w-12 h-12 bg-green-500 text-black font-black rounded-full flex items-center justify-center text-lg">
                      {num}
                    </span>
                  ))}
                </div>
                <div className="text-white/50 text-sm">Prize Pool: £{draw.prize_pool_total}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}