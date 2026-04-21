'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Charities() {
  const [charities, setCharities] = useState([])
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(null)
  const [search, setSearch] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      const { data: charities, error: charityError } = await supabase
  .from('charities')
  .select('*')
  .order('is_featured', { ascending: false })

console.log('Charities:', charities, 'Error:', charityError)
      setCharities(charities || [])
      setLoading(false)
    }
    init()
  }, [])

  const selectCharity = async (charityId) => {
    setSelecting(charityId)
    const { error } = await supabase
      .from('profiles')
      .update({ charity_id: charityId })
      .eq('id', user.id)

    if (!error) {
      setProfile({ ...profile, charity_id: charityId })
    }
    setSelecting(null)
  }

  const filtered = charities.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-green-400 text-xl">Loading charities...</div>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 border-b border-white/10">
        <Link href="/" className="text-2xl font-bold text-green-400">⛳ GolfGives</Link>
        <Link href="/dashboard" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3">Choose Your Charity ❤️</h1>
          <p className="text-white/50">10% of your subscription goes to your chosen charity every month</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charities..."
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* No charities message */}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/40">
            <div className="text-5xl mb-4">❤️</div>
            <p className="text-xl">No charities found</p>
            <p className="text-sm mt-2">Admin can add charities from the admin panel</p>
          </div>
        )}

        {/* Charity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((charity) => (
            <div
              key={charity.id}
              className={`border-2 rounded-2xl p-6 transition ${
                profile?.charity_id === charity.id
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/30'
              }`}
            >
              {charity.is_featured && (
                <div className="inline-block bg-yellow-500/20 text-yellow-400 text-xs font-bold px-2 py-1 rounded-full mb-3">
                  ⭐ FEATURED
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
              <p className="text-white/50 text-sm mb-4 line-clamp-3">
                {charity.description || 'Supporting those in need.'}
              </p>
              {profile?.charity_id === charity.id ? (
                <div className="w-full text-center py-3 bg-green-500/20 text-green-400 font-bold rounded-xl">
                  ✅ Selected
                </div>
              ) : (
                <button
                  onClick={() => selectCharity(charity.id)}
                  disabled={selecting === charity.id}
                  className="w-full py-3 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition"
                >
                  {selecting === charity.id ? 'Selecting...' : 'Select Charity'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}