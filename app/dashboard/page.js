'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [scores, setScores] = useState([])
  const [wins, setWins] = useState([])
  const [newScore, setNewScore] = useState('')
  const [scoreDate, setScoreDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    getUser()
  }, [])

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setUser(user)
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setProfile(profile)
    const { data: scores } = await supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(5)
    setScores(scores || [])
    setLoading(false)

    const { data: wins } = await supabase
  .from('winners')
  .select('*')
  .eq('user_id', user.id)

setWins(wins || [])
setLoading(false)
  }

 async function handleAddScore(e) {
  e.preventDefault()

  if (!newScore || !scoreDate) {
    setMessage('Please fill all fields')
    return
  }

  const scoreValue = parseInt(newScore)

  if (scoreValue < 1 || scoreValue > 45) {
    setMessage('Score must be between 1 and 45')
    return
  }

  setSaving(true)
  setMessage('')

  // Insert new score
  const { error } = await supabase.from('scores').insert({
    user_id: user.id,
    score: scoreValue,
    score_date: scoreDate
  })

  if (error) {
    if (error.message.includes('duplicate')) {
  setMessage('You already added a score for this date')
} else {
  setMessage('Error: ' + error.message)
}
    setSaving(false)
    return
  }

  // Get all scores sorted by oldest
  const { data: allScores, error: fetchError } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', user.id)
    .order('score_date', { ascending: true })

  if (fetchError) {
    setMessage('Error fetching scores')
    setSaving(false)
    return
  }

  // Keep only latest 5 scores
  if (allScores.length > 5) {
    const toDelete = allScores.slice(0, allScores.length - 5)

    for (const s of toDelete) {
      await supabase.from('scores').delete().eq('id', s.id)
    }
  }

  setMessage('Score saved! ✅')
  setTimeout(() => setMessage(''), 2000)

  setNewScore('')
  setScoreDate('')

  await getUser()

  setSaving(false)
}

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-green-400 text-xl">Loading...</div>
    </div>
  )

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : 0

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold text-green-400">⛳ GolfGives</Link>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm">{profile?.full_name || user?.email}</span>
          <button onClick={handleLogout} className="px-4 py-2 border border-white/20 rounded-lg text-white/70 hover:text-white text-sm transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-4xl font-black">Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'} 👋</h1>
          {wins.length > 0 && (
  <div className="bg-green-500/20 border border-green-500/40 rounded-xl p-4 mt-4">
    🎉 Congratulations! You have winnings!
  </div>
)}
          <p className="text-white/50 mt-2">Track your scores and enter monthly prize draws</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white/50 text-sm mb-1">Subscription</div>
            <div className="text-2xl font-black capitalize">{profile?.subscription_status || 'Inactive'}</div>
            <div className="text-white/40 text-xs mt-1">{profile?.subscription_plan || 'No plan'}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white/50 text-sm mb-1">Scores Entered</div>
            <div className="text-2xl font-black">{scores.length} / 5</div>
            <div className="text-white/40 text-xs mt-1">Last 5 rounds</div>
          </div>
         <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white/50 text-sm mb-1">Avg Score</div>
            <div className="text-2xl font-black text-green-400">{avgScore || '—'}</div>
            <div className="text-white/40 text-xs mt-1">Stableford points</div>
          </div>
          {wins.length > 0 && (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
    <h2 className="text-2xl font-black mb-4">Your Winnings 🏆</h2>

    {wins.map((w) => (
      <div key={w.id} className="flex justify-between items-center mb-3">
        <span className="text-white/70">🏆 {w.prize_tier}</span>
        <span className="text-green-400 font-bold">£{w.prize_amount}</span>
      </div>
    ))}
  </div>
)}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white/50 text-sm mb-1">Charity Contribution</div>
            <div className="text-2xl font-black text-green-400">
              £{profile?.subscription_plan === 'yearly'
                ? (95.99 * 0.10 / 12).toFixed(2)
                : profile?.subscription_plan === 'monthly'
                ? (9.99 * 0.10).toFixed(2)
                : '0.00'}
            </div>
            <div className="text-white/40 text-xs mt-1">Per month to charity</div>
          </div>
        </div>

        {/* Score Entry */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-6">Enter Golf Score</h2>
          <form onSubmit={handleAddScore} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex-1">
              <label className="block text-white/50 text-sm mb-2">Stableford Score (1–45)</label>
              <input
                type="number" min="1" max="45"
                value={newScore} onChange={(e) => setNewScore(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                placeholder="e.g. 36"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white/50 text-sm mb-2">Date Played</label>
              <input
                type="date"
                value={scoreDate} onChange={(e) => setScoreDate(e.target.value)}
                required
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="flex items-end">
              <button
  type="submit"
  disabled={saving}
  className="w-full md:w-auto px-8 py-3 bg-green-500 hover:bg-green-400 text-black font-black rounded-xl transition"
>
  {saving ? 'Saving...' : 'Add Score'}
</button>
            </div>
          </form>
          {message && <p className="mt-4 text-green-400 text-sm">{message}</p>}
        </div>

        {/* Score History */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-black mb-6">Your Last 5 Scores</h2>
          {scores.length === 0 ? (
            <p className="text-white/40 text-center py-6">
  No scores yet — add your first round above ⛳
</p>
          ) : (
            <div className="space-y-3">
              {scores.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-white/5 rounded-xl px-5 py-4">
                  <span className="text-white/60">{new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-2xl font-black text-green-400">{s.score} pts</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/subscribe" className="bg-white/5 border border-white/10 hover:border-green-500/50 rounded-2xl p-5 text-center transition">
            <div className="text-3xl mb-2">💳</div>
            <div className="font-bold">Subscribe</div>
            <div className="text-white/40 text-xs mt-1">Manage plan</div>
          </Link>
          <Link href="/charities" className="bg-white/5 border border-white/10 hover:border-green-500/50 rounded-2xl p-5 text-center transition">
            <div className="text-3xl mb-2">❤️</div>
            <div className="font-bold">Charities</div>
            <div className="text-white/40 text-xs mt-1">Choose yours</div>
          </Link>
          <Link href="/draw" className="bg-white/5 border border-white/10 hover:border-green-500/50 rounded-2xl p-5 text-center transition">
            <div className="text-3xl mb-2">🎰</div>
            <div className="font-bold">Monthly Draw</div>
            <div className="text-white/40 text-xs mt-1">Check results</div>
          </Link>
          <Link href="/admin" className="bg-white/5 border border-white/10 hover:border-green-500/50 rounded-2xl p-5 text-center transition">
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold">Admin</div>
            <div className="text-white/40 text-xs mt-1">Manage platform</div>
          </Link>
        </div>
      </div>
    </main>
  )
}