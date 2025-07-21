import React from 'react';
import { useMatchStore } from '../store/matchStore';
import teamsData from '../data/teams.json';
import { PieChart as RePieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#2563eb', '#22c55e', '#f59e42', '#eab308', '#ef4444', '#a21caf', '#64748b', '#f472b6'];

const Dashboard: React.FC = () => {
  const match = useMatchStore((s) => s.match);
  const balls = useMatchStore((s) => s.balls);

  if (!match) {
    return <div className="text-center mt-10">No match data available.</div>;
  }

  const teams = teamsData as { id: string; name: string; players: { id: string; name: string }[] }[];
  const home = teams.find(t => t.id === match.homeTeam);
  const away = teams.find(t => t.id === match.awayTeam);
  const battingTeam = match.tossChoice === 'bat' ? home : away;
  const bowlingTeam = match.tossChoice === 'bat' ? away : home;

  // Batting stats
  const batterStats: Record<string, { name: string; runs: number; balls: number; fours: number; sixes: number; out: boolean }> = {};
  battingTeam?.players.forEach(p => {
    batterStats[p.id] = { name: p.name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
  });
  balls.forEach(ball => {
    // For now, assign all balls to first two batters (stub logic)
    const batterId = battingTeam?.players[0]?.id;
    if (!batterId) return;
    batterStats[batterId].balls++;
    batterStats[batterId].runs += ball.runs;
    if (ball.runs === 4) batterStats[batterId].fours++;
    if (ball.runs === 6) batterStats[batterId].sixes++;
    if (ball.isWicket) batterStats[batterId].out = true;
  });

  // Bowling stats
  const bowlerStats: Record<string, { name: string; balls: number; runs: number; wickets: number }> = {};
  bowlingTeam?.players.forEach(p => {
    bowlerStats[p.id] = { name: p.name, balls: 0, runs: 0, wickets: 0 };
  });
  balls.forEach(ball => {
    // For now, assign all balls to first bowler (stub logic)
    const bowlerId = bowlingTeam?.players[0]?.id;
    if (!bowlerId) return;
    if (!ball.extraType || ball.extraType === 'no-ball') bowlerStats[bowlerId].balls++;
    bowlerStats[bowlerId].runs += ball.runs + (ball.extraType ? 1 : 0);
    if (ball.isWicket) bowlerStats[bowlerId].wickets++;
  });

  // Pie chart data
  let dots = 0, ones = 0, twos = 0, threes = 0, fours = 0, sixes = 0, extras = 0;
  balls.forEach(ball => {
    if (ball.extraType) extras++;
    else if (ball.runs === 0) dots++;
    else if (ball.runs === 1) ones++;
    else if (ball.runs === 2) twos++;
    else if (ball.runs === 3) threes++;
    else if (ball.runs === 4) fours++;
    else if (ball.runs === 6) sixes++;
  });
  const pieData = [
    { name: 'Dots', value: dots },
    { name: '1s', value: ones },
    { name: '2s', value: twos },
    { name: '3s', value: threes },
    { name: '4s', value: fours },
    { name: '6s', value: sixes },
    { name: 'Extras', value: extras },
  ].filter(d => d.value > 0);

  // Total runs, wickets, overs
  const totalRuns = balls.reduce((sum, b) => sum + b.runs + (b.extraType ? 1 : 0), 0);
  const wickets = balls.filter(b => b.isWicket).length;
  const legalBalls = balls.filter(b => !b.extraType || b.extraType === 'no-ball').length;
  const overs = `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mt-8">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <div className="text-2xl font-bold">{home?.name} vs {away?.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">{match.venue} | {match.date} | {match.time}</div>
          <div className="text-sm mt-1">Toss: {teams.find(t => t.id === match.tossWinner)?.name} chose to {match.tossChoice}</div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{battingTeam?.name} <span className="text-black dark:text-white">{totalRuns}/{wickets}</span></div>
          <div className="text-lg font-medium text-blue-700 dark:text-blue-300">Overs: {overs}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Batting Table */}
        <div>
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
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(batterStats).map(([id, b]) => (
                <tr key={id} className={b.out ? 'text-red-600 dark:text-red-400' : ''}>
                  <td className="px-2 py-1">{b.name}</td>
                  <td className="px-2 py-1">{b.runs}</td>
                  <td className="px-2 py-1">{b.balls}</td>
                  <td className="px-2 py-1">{b.fours}</td>
                  <td className="px-2 py-1">{b.sixes}</td>
                  <td className="px-2 py-1">{b.balls ? ((b.runs / b.balls) * 100).toFixed(2) : '0.00'}</td>
                  <td className="px-2 py-1">{b.out ? 'Out' : 'Not Out'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="font-semibold mb-2">Runs Breakdown</div>
          <ResponsiveContainer width="100%" height={250}>
            <RePieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Bowling Table */}
      <div className="mt-8">
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
            {Object.entries(bowlerStats).map(([id, b]) => (
              <tr key={id}>
                <td className="px-2 py-1">{b.name}</td>
                <td className="px-2 py-1">{(b.balls / 6).toFixed(1)}</td>
                <td className="px-2 py-1">{b.runs}</td>
                <td className="px-2 py-1">{b.wickets}</td>
                <td className="px-2 py-1">{b.balls ? (b.runs / (b.balls / 6)).toFixed(2) : '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 