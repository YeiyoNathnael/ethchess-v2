"use client"
import AuthStatus from '@/app/components/authstatus';


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">EthChess</h1>
      <div className="p-6 border rounded-lg shadow-lg">
        <AuthStatus />
        <MyComponent />
      </div>
    </main>
  );

  }
  import { useAuth } from '@/lichess/hooks';

  export  function MyComponent() {
    const { isAuthenticated, session, loading, error } = useAuth();
    
    if (loading) return (<div>Checking authentication...</div>);
    if (error) return (<div>Error: {error.message}</div>);
    
    return (
      <div>
        {isAuthenticated ? (
          <p>Welcome, {session?.user?.username}!</p>
        ) : (
          <p>Please log in</p>
        )}
      </div>
    );
  }