import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardTable({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Jugador</th>
            <th>Partidos</th>
            <th>Grupos</th>
            <th>3°</th>
            <th>Campeón</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={entry.id}>
              <td className="font-bold text-emerald-700">{index + 1}</td>
              <td>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {entry.avatar_initials}
                  </span>
                  <span className="font-semibold text-zinc-900">{entry.name}</span>
                </div>
              </td>
              <td>{entry.match_points}</td>
              <td>{entry.bracket_points}</td>
              <td>{entry.third_place_points}</td>
              <td>{entry.champion_points}</td>
              <td className="text-lg font-bold text-emerald-700">{entry.total_points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
