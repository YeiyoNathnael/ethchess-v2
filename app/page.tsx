"use client"
import AuthStatus from '@/app/components/authstatus';


export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">EthChess</h1>
      <div className="p-6 border rounded-lg shadow-lg">
        <AuthStatus />
      </div>
    </main>
  );

  }
 