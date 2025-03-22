"use client"
import { useAuth } from '@/elichess/hooks';

export default function LoginButton() {
  const { login } = useAuth();

  return (
    <button 
      onClick={login}
      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
    >
      Login with Lichess
    </button>
  );
}