"use client"
import { useAuth } from '@/lichess/hooks';
import LoginButton from './login';
import LogoutButton from './logout';

export default function AuthStatus() {
  const { isAuthenticated, session, loading, error } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (isAuthenticated && session?.user) {
    return (
      <div>
        <p>Logged in as: {session.user.username}</p>
        <LogoutButton />
      </div>
    );
  }

  return (
    <div>
      <p>You are not logged in</p>
      <LoginButton />
    </div>
  );
}