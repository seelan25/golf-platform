'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')
  const [users, setUsers] = useState([])
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])
  const [winners, setWinners] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  // Add Charity Form
  const [charityName, setCharityName] = useState('')
  const [charityDesc, setCharityDesc] = useState('')
  const [charityFeatured, setCharityFeatured] = useState(false)

  // Draw Form
  const [drawMonth, setDrawMonth] = useState('')
  const [drawNumbers, setDrawNumbers] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const { data: users } = await supabase.from('profiles').select('*')
    const { data: charities } = await supabase.from('charities').select('*')
    const { data: draws } = await supabase.from('draws').select('*')
    const { data: winners } = await supabase.from('winners').select('*')

    setUsers(users || [])
    setCharities(charities || [])
    setDraws(draws || [])
    setWinners(winners || [])

    const activeUsers = (users || []).filter(u => u.subscription_status === 'active').length
    const monthlyUsers = (users || []).filter(u => u.subscription_plan === 'monthly').length
    const yearlyUsers = (users || []).filter(u => u.subscription_plan === 'yearly').length
    const prizePool = (monthlyUsers * 9.99 + yearlyUsers * 7.99).toFixed(2)

    setStats({ totalUsers: users?.length || 0, activeUsers, prizePool })
    setLoading(false)
  }

  const addCharity = async () => {
    if (!charityName) return
    await supabase.from('charities').insert({
      name: charityName,
      description: charityDesc,
      is_featured: charityFeatured
    })
    setCharityName('')
    setCharityDesc('')
    setCharityFeatured(false)
    fetchAll()
  }

  const deleteCharity = async (id) => {
    await supabase.from('charities').delete().eq('id', id)
    fetchAll()
  }

const runDraw = async () => {
  if (!drawMonth) return

  // Generate 5 random numbers 1-45
  const generateUniqueNumbers = () => {
  const nums = new Set()
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(nums)
}

const numbers = generateUniqueNumbers()

  // Save draw
  const { data: draw, error } = await supabase.from('draws').insert({
    draw_month: drawMonth,
    drawn_numbers: numbers,
    status: 'published',
    prize_pool_total: parseFloat(stats.prizePool) || 0
  }).select().single()

  if (error) { alert('Draw error: ' + error.message); return }

  // Find all active subscribers with scores
  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('id')
    .eq('subscription_status', 'active')

  if (!activeUsers || activeUsers.length === 0) {
    setDrawMonth('')
    fetchAll()
    return
  }

  // Check each user's scores against drawn numbers
  for (const u of activeUsers) {
    const { data: userScores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', u.id)

    if (!userScores) continue
    const userNumbers = userScores.map(s => s.score)
    const matches = userNumbers.filter(n => numbers.includes(n)).length

    // Award prizes based on matches
    let prizeTier = null
    let prizeAmount = 0

    if (matches >= 5) { prizeTier = '🥇 Jackpot'; prizeAmount = parseFloat(stats.prizePool) * 0.6 }
    else if (matches >= 3) { prizeTier = '🥈 Second Prize'; prizeAmount = parseFloat(stats.prizePool) * 0.25 }
    else if (matches >= 2) { prizeTier = '🥉 Third Prize'; prizeAmount = parseFloat(stats.prizePool) * 0.1 }

    if (prizeTier) {
      await supabase.from('winners').insert({
        user_id: u.id,
        draw_id: draw.id,
        prize_tier: prizeTier,
        prize_amount: prizeAmount,
        verification_status: 'pending',
        payment_status: 'unpaid'
      })
    }
  }

  setDrawMonth('')
  fetchAll()
  alert(`Draw complete! Numbers: ${numbers.join(', ')}`)
}

  const updateSubscription = async (userId, status) => {
    await supabase.from('profiles').update({ subscription_status: status }).eq('id', userId)
    fetchAll()
  }

  const verifyWinner = async (winnerId, status) => {
  const { error } = await supabase
    .from('winners')
    .update({ verification_status: status })
    .eq('id', winnerId)
  
  if (error) {
    alert('Error: ' + error.message)
  } else {
    fetchAll()
  }
}

  const markPaid = async (winnerId) => {
  const { error } = await supabase
    .from('winners')
    .update({ payment_status: 'paid' })
    .eq('id', winnerId)
  
  if (error) {
    alert('Error: ' + error.message)
  } else {
    alert('Marked as paid! ✅')
    fetchAll()
  }
}

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-green-400 text-xl">Loading admin panel...</div>
    </div>
  )

  const tabs = ['overview', 'users', 'charities', 'draws', 'winners']

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGives Admin</Link>
        <Link href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
          ← Dashboard
        </Link>
      </nav>

      {/* Tabs */}
      <div className="flex gap-2 px-8 py-4 border-b border-white/10 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl capitalize font-bold transition ${
              activeTab === tab
                ? 'bg-green-500 text-black'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <h2 className="text-3xl font-black mb-8">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
                { label: 'Active Subscribers', value: stats.activeUsers, icon: '✅' },
                { label: 'Prize Pool', value: `£${stats.prizePool}`, icon: '🏆' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-black text-green-400">{stat.value}</div>
                  <div className="text-white/50 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-3xl font-black mb-8">Users ({users.length})</h2>
            <div className="space-y-4">
              {users.map(user => (
                <div key={user.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-lg">{user.full_name || 'No name'}</div>
                    <div className="text-white/50 text-sm">{user.email}</div>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        user.subscription_status === 'active'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.subscription_status}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/60">
                        {user.subscription_plan}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSubscription(user.id, 'active')}
                      className="px-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 transition"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => updateSubscription(user.id, 'inactive')}
                      className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHARITIES */}
        {activeTab === 'charities' && (
          <div>
            <h2 className="text-3xl font-black mb-8">Charities</h2>

            {/* Add Charity Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Add New Charity</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={charityName}
                  onChange={(e) => setCharityName(e.target.value)}
                  placeholder="Charity name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500"
                />
                <textarea
                  value={charityDesc}
                  onChange={(e) => setCharityDesc(e.target.value)}
                  placeholder="Charity description"
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={charityFeatured}
                    onChange={(e) => setCharityFeatured(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="featured" className="text-white/70">Featured charity</label>
                </div>
                <button
                  onClick={addCharity}
                  className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition"
                >
                  Add Charity
                </button>
              </div>
            </div>

            {/* Charity List */}
            <div className="space-y-4">
              {charities.map(charity => (
                <div key={charity.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
                  <div>
                    <div className="font-bold">{charity.name}</div>
                    <div className="text-white/50 text-sm">{charity.description}</div>
                    {charity.is_featured && <span className="text-yellow-400 text-xs">⭐ Featured</span>}
                  </div>
                  <button
                    onClick={() => deleteCharity(charity.id)}
                    className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DRAWS */}
        {activeTab === 'draws' && (
          <div>
            <h2 className="text-3xl font-black mb-8">Draw Management</h2>

            {/* Run Draw */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Run Monthly Draw</h3>
              <div className="flex gap-4">
                <input
                  type="month"
                  value={drawMonth}
                  onChange={(e) => setDrawMonth(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={runDraw}
                  className="px-6 py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition"
                >
                  🎰 Run Draw
                </button>
              </div>
            </div>

            {/* Draw History */}
            <div className="space-y-4">
              {draws.map(draw => (
                <div key={draw.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-lg">{draw.draw_month}</div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                      draw.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {draw.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {(draw.drawn_numbers || []).map((num, i) => (
                      <span key={i} className="w-10 h-10 bg-green-500 text-black font-black rounded-full flex items-center justify-center">
                        {num}
                      </span>
                    ))}
                  </div>
                  <div className="text-white/50 text-sm mt-2">Prize Pool: £{draw.prize_pool_total}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WINNERS */}
        {activeTab === 'winners' && (
          <div>
            <h2 className="text-3xl font-black mb-8">Winners</h2>
            {winners.length === 0 ? (
              <div className="text-center py-20 text-white/40">
                <div className="text-5xl mb-4">🏆</div>
                <p>No winners yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {winners.map(winner => (
                  <div key={winner.id} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">{winner.prize_tier}</div>
                        <div className="text-white/50 text-sm">£{winner.prize_amount}</div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold mt-2 inline-block ${
                          winner.verification_status === 'approved'
                            ? 'bg-green-500/20 text-green-400'
                            : winner.verification_status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {winner.verification_status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => verifyWinner(winner.id, 'approved')}
                          className="px-3 py-2 bg-green-500/20 text-green-400 rounded-xl text-sm hover:bg-green-500/30 transition">
                          Approve
                        </button>
                        <button onClick={() => verifyWinner(winner.id, 'rejected')}
                          className="px-3 py-2 bg-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition">
                          Reject
                        </button>
                        <button onClick={() => markPaid(winner.id)}
                          className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm hover:bg-blue-500/30 transition">
                          Mark Paid
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}