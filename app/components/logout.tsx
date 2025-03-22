"use client"
import { useAuth } from '@/elichess/hooks';
import { useState } from 'react';

export default function LogoutButton() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      
      // Force a page reload to ensure UI state is reset
      window.location.href = '/';
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <button 
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}