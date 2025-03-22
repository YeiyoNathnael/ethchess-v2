"use client"
import { useUser, useUserGames } from '@/elichess/hooks/useUser';
import { useAuth } from '@/elichess/hooks';
import { useState } from 'react';
import { redirect } from 'next/navigation';

export default function ProfilePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { 
    user, 
    preferences, 
    loading: userLoading, 
    error: userError, 
    refresh: refreshProfile, 
    fetchPreferences 
  } = useUser();
  
  const [showPreferences, setShowPreferences] = useState(false);
  const [gamesOptions, setGamesOptions] = useState({ max: 5, ongoing: true, finished: true, pgnInJson: true });
  const { 
    games, 
    loading: gamesLoading, 
    error: gamesError, 
    refresh: refreshGames 
  } = useUserGames(undefined, gamesOptions);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    redirect("/")
  }

  const handleFetchPreferences = async () => {
    await fetchPreferences();
    setShowPreferences(true);
  };

  const handleToggleGamesFilter = (filter: 'ongoing' | 'finished') => {
    setGamesOptions(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  const handleChangeGamesMax = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGamesOptions(prev => ({
      ...prev,
      max: parseInt(e.target.value, 10)
    }));
  };

  if (authLoading || userLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <p className="mt-4">Loading user data...</p>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md max-w-lg">
          <h3 className="font-bold">Error</h3>
          <p>{userError.message}</p>
        </div>
        <button 
          onClick={() => refreshProfile()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">User Profile</h1>
      
      {/* User Profile Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex items-start">
        
          <div>
            <div className="flex items-center mb-2">
              {user?.title && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold mr-2">
                  {user.title}
                </span>
              )}
              <h2 className="text-2xl font-bold">{user?.username}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-600">Rating</p>
                <p className="font-semibold">{user?.perfs?.rapid?.rating || 'Unrated'}</p>
              </div>
              <div>
                <p className="text-gray-600">Games Played rapid</p>
                <p className="font-semibold">{user?.perfs?.rapid?.games || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Account Created</p>
                <p className="font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Online Status</p>
                <p className={`font-semibold ${user?.seenAt ? 'text-green-600' : 'text-gray-500'}`}>
                  {user?.seenAt ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={() => refreshProfile()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            Refresh Profile
          </button>
          <button 
            onClick={handleFetchPreferences} 
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            Fetch Preferences
          </button>
        </div>
      </div>
      
      {/* Preferences Section */}
      {showPreferences && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">User Preferences</h2>
          {preferences ? (
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(preferences, null, 2)}
            </pre>
          ) : (
            <p>No preferences loaded yet.</p>
          )}
        </div>
      )}
      
      {/* Games Section */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recent Games</h2>
          <button 
            onClick={() => refreshGames()} 
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Refresh Games
          </button>
        </div>
        
        {/* Games Filter */}
        <div className="bg-gray-100 p-4 rounded mb-4 flex flex-wrap items-center gap-4">
          <div>
            <label className="mr-2 font-medium">Show:</label>
            <select 
              value={gamesOptions.max} 
              onChange={handleChangeGamesMax}
              className="border rounded px-2 py-1"
            >
              <option value={5}>5 games</option>
              <option value={10}>10 games</option>
              <option value={20}>20 games</option>
            </select>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="ongoingGames" 
              checked={gamesOptions.ongoing}
              onChange={() => handleToggleGamesFilter('ongoing')}
              className="mr-1"
            />
            <label htmlFor="ongoingGames" className="mr-4">Ongoing</label>
            
            <input 
              type="checkbox" 
              id="finishedGames" 
              checked={gamesOptions.finished}
              onChange={() => handleToggleGamesFilter('finished')}
              className="mr-1"
            />
            <label htmlFor="finishedGames">Finished</label>
          </div>
        </div>
        
        {gamesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
            <p className="mt-2">Loading games...</p>
          </div>
        ) : gamesError ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
            <p>Error loading games: {gamesError.message}</p>
          </div>
        ) : games.length === 0 ? (
          <p className="text-center py-8 text-gray-500">No games found with current filters.</p>
        ) : (
          <div className="divide-y">
            {games.map((game) => (
              <div key={game.id} className="py-4">
                <div className="flex justify-between items-center">
                  <p className="font-medium">
                    {game.white.name} vs {game.black.name}
                  </p>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    game.status === 'started' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(game.createdAt).toLocaleString()}
                </p>
                <div className="mt-2">
                  <a 
                    href={`https://lichess.org/${game.id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    View on Lichess
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}