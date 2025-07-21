import React, { useState } from 'react';
import { useMatchStore } from '../store/matchStore';
import type { BallEvent } from '../store/matchStore';
import teamsData from '../data/teams.json';

const getOverString = (balls: BallEvent[]) => {
  const legalBalls = balls.filter(b => !b.extraType || b.extraType === 'no-ball');
  const overs = Math.floor(legalBalls.length / 6);
  const ballsInOver = legalBalls.length % 6;
  return `${overs}.${ballsInOver}`;
};

const LiveScoring: React.FC = () => {
  const match = useMatchStore((s) => s.match);
  const goTo = useMatchStore((s) => s.goTo);
  const balls = useMatchStore((s) => s.balls);
  const addBall = useMatchStore((s) => s.addBall);
  const undoBall = useMatchStore((s) => s.undoBall);

  const [runs, setRuns] = useState(0);
  const [extraType, setExtraType] = useState<string>('');
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState('');
  const [batterOut, setBatterOut] = useState('');

  if (!match) {
    return (
      <div className="text-center mt-10">
        <p>No match in progress.</p>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => goTo('setup')}>Back to Setup</button>
      </div>
    );
  }

  const teams = teamsData as { id: string; name: string; players: { id: string; name: string }[] }[];
  const home = teams.find(t => t.id === match.homeTeam);
  const away = teams.find(t => t.id === match.awayTeam);

  // Batting team is the one who bats first (toss logic simplified for T20)
  const battingTeam = match.tossChoice === 'bat' ? home : away;
  const bowlingTeam = match.tossChoice === 'bat' ? away : home;

  // Calculate stats
  let totalRuns = 0, wickets = 0, fours = 0, sixes = 0, legalBalls = 0;
  balls.forEach(ball => {
    if (!ball.extraType || ball.extraType === 'no-ball') legalBalls++;
    if (ball.isWicket) wickets++;
    if (ball.runs === 4) fours++;
    if (ball.runs === 6) sixes++;
    totalRuns += ball.runs + (ball.extraType ? 1 : 0);
  });
  const overs = getOverString(balls);
  const runRate = balls.length ? (totalRuns / (legalBalls / 6 || 1)).toFixed(2) : '0.00';

  // Batting stats (simple: first 2 batters, not out)
  const batters = battingTeam?.players.slice(0, 2) || [];
  // Bowling stats (simple: first bowler)
  const bowlers = bowlingTeam?.players.slice(0, 1) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBall({
      runs,
      extraType: (extraType || undefined) as 'wide' | 'no-ball' | 'leg-bye' | 'bye' | undefined,
      isWicket: isWicket || undefined,
      wicketType: isWicket ? wicketType : undefined,
      batterOut: isWicket ? batterOut : undefined,
    });
    setRuns(0);
    setExtraType('');
    setIsWicket(false);
    setWicketType('');
    setBatterOut('');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mt-8">
      {/* Summary Bar */}
      <div className="flex flex-col md:flex-row md:justify-between items-center mb-6 p-4 rounded bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700">
        <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{battingTeam?.name} <span className="text-black dark:text-white">{totalRuns}/{wickets}</span></div>
        <div className="text-lg font-medium text-blue-700 dark:text-blue-300">Overs: {overs}</div>
        <div className="text-lg font-medium text-blue-700 dark:text-blue-300">Run Rate: {runRate}</div>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <div>
          <div className="font-bold text-lg">{home?.name} vs {away?.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">{match.venue} | {match.date} | {match.time}</div>
          <div className="text-sm mt-1">Toss: {teams.find(t => t.id === match.tossWinner)?.name} chose to {match.tossChoice}</div>
        </div>
        <button className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded" onClick={() => goTo('setup')}>Edit Match</button>
      </div>
      {/* Batting Table */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Batting</div>
        <table className="min-w-full text-sm mb-2">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-2 py-1 text-left">Batter</th>
              <th className="px-2 py-1">R</th>
              <th className="px-2 py-1">B</th>
              <th className="px-2 py-1">4s</th>
              <th className="px-2 py-1">6s</th>
              <th className="px-2 py-1">SR</th>
            </tr>
          </thead>
          <tbody>
            {batters.map((b, i) => (
              <tr key={b.id} className={i === 0 ? 'font-bold' : ''}>
                <td className="px-2 py-1">{b.name} {i === 0 ? <span className="ml-1 text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">striker</span> : <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">non-striker</span>}</td>
                <td className="px-2 py-1">0</td>
                <td className="px-2 py-1">0</td>
                <td className="px-2 py-1">0</td>
                <td className="px-2 py-1">0</td>
                <td className="px-2 py-1">0.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Bowling Table */}
      <div className="mb-6">
        <div className="font-semibold mb-2">Bowling</div>
        <table className="min-w-full text-sm mb-2">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-2 py-1 text-left">Bowler</th>
              <th className="px-2 py-1">O</th>
              <th className="px-2 py-1">R</th>
              <th className="px-2 py-1">W</th>
              <th className="px-2 py-1">Econ</th>
            </tr>
          </thead>
          <tbody>
            {bowlers.map((b, i) => (
              <tr key={b.id} className={i === 0 ? 'font-bold' : ''}>
                <td className="px-2 py-1">{b.name}</td>
                <td className="px-2 py-1">{overs}</td>
                <td className="px-2 py-1">{totalRuns}</td>
                <td className="px-2 py-1">{wickets}</td>
                <td className="px-2 py-1">{runRate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Ball Input */}
      <form className="mb-4" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Runs</label>
            <input type="number" min={0} max={6} value={runs} onChange={e => setRuns(Number(e.target.value))} className="input input-bordered w-20" />
          </div>
          <div>
            <label className="block text-sm font-medium">Extras</label>
            <select value={extraType} onChange={e => setExtraType(e.target.value)} className="input input-bordered w-28">
              <option value="">None</option>
              <option value="wide">Wide</option>
              <option value="no-ball">No Ball</option>
              <option value="leg-bye">Leg Bye</option>
              <option value="bye">Bye</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Wicket</label>
            <input type="checkbox" checked={isWicket} onChange={e => setIsWicket(e.target.checked)} />
          </div>
          {isWicket && (
            <>
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select value={wicketType} onChange={e => setWicketType(e.target.value)} className="input input-bordered w-28">
                  <option value="">Select</option>
                  <option value="bowled">Bowled</option>
                  <option value="caught">Caught</option>
                  <option value="lbw">LBW</option>
                  <option value="run out">Run Out</option>
                  <option value="stumped">Stumped</option>
                  <option value="hit wicket">Hit Wicket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Batter Out</label>
                <select value={batterOut} onChange={e => setBatterOut(e.target.value)} className="input input-bordered w-32">
                  <option value="">Select</option>
                  {battingTeam?.players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit Ball</button>
          <button type="button" className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded ml-2" onClick={undoBall} disabled={balls.length === 0}>Undo</button>
        </div>
      </form>
      {/* Over Summary */}
      <div>
        <div className="font-semibold mb-2">Over Summary</div>
        <div className="flex gap-2 flex-wrap">
          {balls.slice(-6).map((ball, i) => (
            <div key={i} className={`px-2 py-1 rounded font-bold ${ball.isWicket ? 'bg-red-200 dark:bg-red-700 text-red-900 dark:text-red-100' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {ball.isWicket ? 'W' : ball.runs}
              {ball.extraType ? <span className="ml-1 text-xs bg-yellow-200 dark:bg-yellow-700 text-yellow-900 dark:text-yellow-100 px-1 rounded">{ball.extraType}</span> : ''}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveScoring; 