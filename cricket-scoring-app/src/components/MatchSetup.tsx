import React, { useState, useEffect } from 'react';
import teamsData from '../data/teams.json';
import { useMatchStore } from '../store/matchStore';

type Team = {
  id: string;
  name: string;
  players: { id: string; name: string }[];
};

type SquadSelection = {
  [teamId: string]: string[];
};

const MatchSetup: React.FC = () => {
  const [venue, setVenue] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [squads, setSquads] = useState<SquadSelection>({});
  const [tossWinner, setTossWinner] = useState('');
  const [tossChoice, setTossChoice] = useState('bat');

  const setMatch = useMatchStore((s) => s.setMatch);

  const teams: Team[] = teamsData as Team[];

  useEffect(() => {
    if (teams.length > 1) {
      setHomeTeam(teams[0].id);
      setAwayTeam(teams[1].id);
      setSquads({
        [teams[0].id]: teams[0].players.slice(0, 11).map((p) => p.id),
        [teams[1].id]: teams[1].players.slice(0, 11).map((p) => p.id),
      });
      setTossWinner(teams[0].id);
    }
  }, [teams]);

  const handleSquadChange = (teamId: string, playerId: string) => {
    setSquads((prev) => {
      const current = prev[teamId] || [];
      let updated: string[];
      if (current.includes(playerId)) {
        updated = current.filter((id) => id !== playerId);
      } else {
        if (current.length < 11) {
          updated = [...current, playerId];
        } else {
          updated = current;
        }
      }
      return { ...prev, [teamId]: updated };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMatch({
      format: 'T20',
      venue,
      date,
      time,
      homeTeam,
      awayTeam,
      squads,
      tossWinner,
      tossChoice: tossChoice as 'bat' | 'bowl',
    });
  };

  return (
    <form className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded shadow mt-8" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Match Setup</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Match Format</label>
        <input type="text" value="T20" disabled className="input input-bordered w-full bg-gray-100 dark:bg-gray-700" />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Venue</label>
          <input type="text" value={venue} onChange={e => setVenue(e.target.value)} required className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input input-bordered w-full" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="input input-bordered w-full" />
        </div>
      </div>
      {/* Home/Away Team Selection */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Home Team</label>
          <select value={homeTeam} onChange={e => setHomeTeam(e.target.value)} className="input input-bordered w-full">
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Away Team</label>
          <select value={awayTeam} onChange={e => setAwayTeam(e.target.value)} className="input input-bordered w-full">
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Squad Selection */}
      <div className="mb-4">
        <label className="block mb-2 font-medium text-left">Squad Selection (11 per team)</label>
        <div className="flex flex-row gap-6 items-start">
          {teams.map(team => (
            <div
              key={team.id}
              className="flex-1 border rounded p-4 bg-gray-50 dark:bg-gray-700 min-w-[180px]"
            >
              <div className="font-semibold mb-2 text-center text-lg">{team.name}</div>
              <div className="flex flex-col gap-1">
                {team.players.map(player => (
                  <label key={player.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={squads[team.id]?.includes(player.id) || false}
                      onChange={() => handleSquadChange(team.id, player.id)}
                      disabled={
                        !squads[team.id]?.includes(player.id) &&
                        (squads[team.id]?.length || 0) >= 11
                      }
                    />
                    {player.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Toss Selection */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1 font-medium">Toss Winner</label>
          <select value={tossWinner} onChange={e => setTossWinner(e.target.value)} className="input input-bordered w-full">
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Toss Choice</label>
          <select value={tossChoice} onChange={e => setTossChoice(e.target.value)} className="input input-bordered w-full">
            <option value="bat">Bat</option>
            <option value="bowl">Bowl</option>
          </select>
        </div>
      </div>
      <button type="submit" className="mt-4 px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition">Create Match</button>
    </form>
  );
};

export default MatchSetup; 