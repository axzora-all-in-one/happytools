'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Trophy, 
  Clock, 
  Calendar,
  Target,
  Zap,
  Activity,
  TrendingUp,
  Users,
  Play,
  Pause,
  RotateCcw,
  Star,
  Timer,
  MapPin,
  Loader2,
  RefreshCw,
  BarChart3,
  Award,
  Flame
} from 'lucide-react'

export default function LiveScore() {
  const [activeTab, setActiveTab] = useState('live')
  const [liveMatches, setLiveMatches] = useState([])
  const [recentMatches, setRecentMatches] = useState([])
  const [upcomingMatches, setUpcomingMatches] = useState([])
  const [playerStats, setPlayerStats] = useState([])
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const tabs = [
    { id: 'live', label: 'Live', icon: Activity, color: 'text-red-500' },
    { id: 'recent', label: 'Recent', icon: Clock, color: 'text-blue-500' },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar, color: 'text-green-500' },
    { id: 'stats', label: 'Stats', icon: BarChart3, color: 'text-purple-500' }
  ]

  const fetchLiveMatches = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/cricket/live-matches')
      const data = await response.json()
      if (data.success) {
        setLiveMatches(data.matches || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching live matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentMatches = async () => {
    try {
      const response = await fetch('/api/cricket/recent-matches')
      const data = await response.json()
      if (data.success) {
        setRecentMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Error fetching recent matches:', error)
    }
  }

  const fetchUpcomingMatches = async () => {
    try {
      const response = await fetch('/api/cricket/upcoming-matches')
      const data = await response.json()
      if (data.success) {
        setUpcomingMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Error fetching upcoming matches:', error)
    }
  }

  const fetchPlayerStats = async () => {
    try {
      const response = await fetch('/api/cricket/player-stats')
      const data = await response.json()
      if (data.success) {
        setPlayerStats(data.stats || [])
      }
    } catch (error) {
      console.error('Error fetching player stats:', error)
    }
  }

  const fetchMatchDetails = async (matchId) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/cricket/match-details?id=${matchId}`)
      const data = await response.json()
      if (data.success) {
        setSelectedMatch(data.match)
      }
    } catch (error) {
      console.error('Error fetching match details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial data fetch
    fetchLiveMatches()
    fetchRecentMatches()
    fetchUpcomingMatches()
    fetchPlayerStats()

    // Set up auto-refresh for live matches
    const interval = setInterval(() => {
      if (autoRefresh && activeTab === 'live') {
        fetchLiveMatches()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, activeTab])

  const handleRefresh = () => {
    if (activeTab === 'live') fetchLiveMatches()
    else if (activeTab === 'recent') fetchRecentMatches()
    else if (activeTab === 'upcoming') fetchUpcomingMatches()
    else if (activeTab === 'stats') fetchPlayerStats()
  }

  const getMatchStatus = (status) => {
    const statusMap = {
      'live': { label: 'LIVE', color: 'bg-red-500', icon: Activity },
      'completed': { label: 'COMPLETED', color: 'bg-gray-500', icon: Clock },
      'upcoming': { label: 'UPCOMING', color: 'bg-green-500', icon: Calendar },
      'abandoned': { label: 'ABANDONED', color: 'bg-yellow-500', icon: Pause }
    }
    return statusMap[status] || statusMap['upcoming']
  }

  const LiveMatchCard = ({ match }) => {
    const statusInfo = getMatchStatus(match.status)
    const StatusIcon = statusInfo.icon

    return (
      <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
            onClick={() => fetchMatchDetails(match.id)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge className={`${statusInfo.color} text-white px-3 py-1 flex items-center gap-1`}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </Badge>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {match.venue}
            </div>
          </div>
          <CardTitle className="text-lg">{match.series}</CardTitle>
          <CardDescription className="text-gray-300">{match.matchType} • {match.format}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Teams */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {match.team1?.code || 'T1'}
                </div>
                <span className="font-medium">{match.team1?.name || 'Team 1'}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {match.team1?.score || '0/0'} 
                  {match.team1?.overs && <span className="text-sm text-gray-400 ml-1">({match.team1.overs})</span>}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {match.team2?.code || 'T2'}
                </div>
                <span className="font-medium">{match.team2?.name || 'Team 2'}</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {match.team2?.score || '0/0'}
                  {match.team2?.overs && <span className="text-sm text-gray-400 ml-1">({match.team2.overs})</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Match Status */}
          {match.status === 'live' && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Live Update</span>
              </div>
              <p className="text-sm text-gray-300">{match.commentary || 'Match in progress...'}</p>
            </div>
          )}

          {match.result && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Result</span>
              </div>
              <p className="text-sm text-gray-300">{match.result}</p>
            </div>
          )}

          {/* Key Stats */}
          {match.keyStats && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {match.keyStats.map((stat, index) => (
                <div key={index} className="bg-white/5 rounded p-2">
                  <div className="text-gray-400">{stat.label}</div>
                  <div className="font-medium text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{match.toss || 'Toss pending'}</span>
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {match.timeAgo || 'Just now'}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const RecentMatchCard = ({ match }) => (
    <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-gray-500 text-white px-3 py-1">COMPLETED</Badge>
          <div className="text-xs text-gray-400">{match.date}</div>
        </div>
        <CardTitle className="text-lg">{match.series}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">{match.team1?.name}</span>
            <span className="text-lg font-bold">{match.team1?.score}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">{match.team2?.name}</span>
            <span className="text-lg font-bold">{match.team2?.score}</span>
          </div>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-sm font-medium">Winner</span>
          </div>
          <p className="text-sm text-gray-300">{match.result}</p>
        </div>
      </CardContent>
    </Card>
  )

  const UpcomingMatchCard = ({ match }) => (
    <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge className="bg-green-500 text-white px-3 py-1 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            UPCOMING
          </Badge>
          <div className="text-xs text-gray-400">{match.timeUntil}</div>
        </div>
        <CardTitle className="text-lg">{match.series}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
              {match.team1?.code}
            </div>
            <span className="font-medium">{match.team1?.name}</span>
          </div>
          <div className="text-center text-gray-400 text-sm">vs</div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
              {match.team2?.code}
            </div>
            <span className="font-medium">{match.team2?.name}</span>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Schedule</span>
          </div>
          <p className="text-sm text-gray-300">{match.dateTime}</p>
          <p className="text-xs text-gray-400">{match.venue}</p>
        </div>
      </CardContent>
    </Card>
  )

  const PlayerStatsCard = ({ player }) => (
    <Card className="glass-card border-white/20 bg-white/5 backdrop-blur-lg text-white hover:bg-white/10 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">{player.name?.charAt(0) || 'P'}</span>
          </div>
          <div>
            <CardTitle className="text-lg">{player.name}</CardTitle>
            <CardDescription className="text-gray-300">{player.team} • {player.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">{player.batting?.average || '0'}</div>
            <div className="text-xs text-gray-400">Avg</div>
          </div>
          <div className="bg-white/5 rounded p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{player.bowling?.average || '0'}</div>
            <div className="text-xs text-gray-400">Bowl Avg</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Runs:</span>
            <span className="font-medium">{player.batting?.runs || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Wickets:</span>
            <span className="font-medium">{player.bowling?.wickets || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Matches:</span>
            <span className="font-medium">{player.matches || 0}</span>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/20">
            <Star className="w-3 h-3 mr-1" />
            {player.ranking || 'Unranked'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/10 backdrop-blur-lg rounded-full px-6 py-3 mb-8 border border-white/20">
            <Trophy className="w-5 h-5 text-white mr-2" />
            <span className="text-white font-semibold">Live Cricket Scores</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Cricket{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              Live Scores
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real-time cricket scores, match updates, player stats, and comprehensive coverage from around the world
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-4 md:space-y-0">
          {/* Tabs */}
          <div className="flex space-x-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {activeTab === 'live' && (
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
                className={`border-white/20 ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'text-gray-300'} hover:bg-white/10`}
              >
                {autoRefresh ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                Auto Refresh
              </Button>
            )}
            
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>

            {lastUpdated && (
              <div className="text-xs text-gray-400">
                Updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {/* Live Matches */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Activity className="w-5 h-5 text-red-500" />
                <h2 className="text-2xl font-bold text-white">Live Matches</h2>
                <Badge className="bg-red-500 text-white animate-pulse">
                  {liveMatches.length} LIVE
                </Badge>
              </div>

              {loading && liveMatches.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading live matches...</p>
                  </div>
                </div>
              ) : liveMatches.length === 0 ? (
                <div className="text-center py-20">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Live Matches</h3>
                  <p className="text-gray-400">Check back later for live cricket action!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {liveMatches.map((match, index) => (
                    <LiveMatchCard key={match.id || index} match={match} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recent Matches */}
          {activeTab === 'recent' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-2xl font-bold text-white">Recent Matches</h2>
              </div>

              {recentMatches.length === 0 ? (
                <div className="text-center py-20">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Recent Matches</h3>
                  <p className="text-gray-400">Recent match results will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentMatches.map((match, index) => (
                    <RecentMatchCard key={match.id || index} match={match} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Upcoming Matches */}
          {activeTab === 'upcoming' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calendar className="w-5 h-5 text-green-500" />
                <h2 className="text-2xl font-bold text-white">Upcoming Matches</h2>
              </div>

              {upcomingMatches.length === 0 ? (
                <div className="text-center py-20">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Matches</h3>
                  <p className="text-gray-400">Future match schedules will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingMatches.map((match, index) => (
                    <UpcomingMatchCard key={match.id || index} match={match} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Player Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                <h2 className="text-2xl font-bold text-white">Player Statistics</h2>
              </div>

              {playerStats.length === 0 ? (
                <div className="text-center py-20">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Player Stats</h3>
                  <p className="text-gray-400">Player statistics will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {playerStats.map((player, index) => (
                    <PlayerStatsCard key={player.id || index} player={player} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Match Details Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Match Details</h2>
                  <Button
                    onClick={() => setSelectedMatch(null)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </Button>
                </div>
                
                {/* Match details content would go here */}
                <div className="space-y-4 text-white">
                  <p>Detailed match information, scorecard, and commentary would be displayed here...</p>
                  <pre className="bg-white/5 p-4 rounded text-sm overflow-auto">
                    {JSON.stringify(selectedMatch, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}