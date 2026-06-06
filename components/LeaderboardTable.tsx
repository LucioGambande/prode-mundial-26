import type { LeaderboardEntry } from "@/lib/types";

export default function LeaderboardTable({
  entries,
}: {
  entries: LeaderboardEntry[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-emerald-50 text-emerald-900">
          <tr>
            <th className="px-4 py-3 font-semibold">#</th>
            <th className="px-4 py-3 font-semibold">Jugador</th>
            <th className="px-4 py-3 font-semibold">Partidos</th>
            <th className="px-4 py-3 font-semibold">Grupos</th>
            <th className="px-4 py-3 font-semibold">3°</th>
            <th className="px-4 py-3 font-semibold">Campeón</th>
            <th className="px-4 py-3 font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.id}
              className="border-t border-emerald-50 hover:bg-emerald-50/50"
            >
              <td className="px-4 py-3 font-medium text-emerald-700">
                {index + 1}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">
                    {entry.avatar_initials}
                  </span>
                  <span className="font-medium text-zinc-900">{entry.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">{entry.match_points}</td>
              <td className="px-4 py-3">{entry.bracket_points}</td>
              <td className="px-4 py-3">{entry.third_place_points}</td>
              <td className="px-4 py-3">{entry.champion_points}</td>
              <td className="px-4 py-3 text-lg font-bold text-emerald-700">
                {entry.total_points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
