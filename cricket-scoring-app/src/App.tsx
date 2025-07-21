import React from 'react';
import MatchSetup from './components/MatchSetup';
import LiveScoring from './components/LiveScoring';
import Dashboard from './components/Dashboard';
import { useMatchStore } from './store/matchStore';

function App() {
  const page = useMatchStore((s) => s.page);
  const goTo = useMatchStore((s) => s.goTo);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="p-4 shadow bg-white dark:bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Cricket Scoring App</h1>
        <nav className="space-x-4">
          <button className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => goTo('setup')}>Match Setup</button>
          <button className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => goTo('scoring')}>Live Scoring</button>
          <button className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => goTo('dashboard')}>Dashboard</button>
        </nav>
      </header>
      <main className="p-4">
        {page === 'setup' && <MatchSetup />}
        {page === 'scoring' && <LiveScoring />}
        {page === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;
