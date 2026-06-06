import Link from "next/link";
import type { UserProgress } from "@/lib/user-progress";
import { GROUPS, THIRD_PLACE_COUNT } from "@/lib/constants";

function ProgressCard({
  title,
  description,
  done,
  total,
  href,
  locked,
}: {
  title: string;
  description: string;
  done: number;
  total: number;
  href: string;
  locked?: boolean;
}) {
  const complete = total > 0 && done >= total;
  const pct = total === 0 ? 100 : Math.round((done / total) * 100);

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-emerald-950">{title}</h3>
          <p className="mt-1 text-sm text-zinc-500">{description}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            complete
              ? "bg-emerald-100 text-emerald-800"
              : locked
                ? "bg-zinc-100 text-zinc-600"
                : "bg-amber-100 text-amber-800"
          }`}
        >
          {locked ? "Cerrado" : complete ? "Listo" : "Pendiente"}
        </span>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex justify-between text-sm">
          <span>{done}/{total}</span>
          <span>{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {!locked && !complete && (
        <Link
          href={href}
          className="mt-4 inline-block rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Completar
        </Link>
      )}

      {(complete || locked) && (
        <Link href={href} className="mt-4 inline-block text-sm font-medium text-emerald-700">
          Ver →
        </Link>
      )}
    </div>
  );
}

export default function UserDashboard({
  profileName,
  profileEmail,
  progress,
}: {
  profileName: string;
  profileEmail: string;
  progress: UserProgress;
}) {
  const bracketSteps =
    GROUPS.length + THIRD_PLACE_COUNT + 1;
  const bracketDone =
    progress.groupsCompleted +
    Math.min(progress.thirdPlacesSelected, THIRD_PLACE_COUNT) +
    (progress.hasChampion ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-emerald-950 px-6 py-5 text-white">
        <p className="text-sm text-emerald-200">Tu panel</p>
        <h2 className="text-2xl font-bold">Hola, {profileName}</h2>
        <p className="mt-1 text-sm text-emerald-100">{profileEmail}</p>
      </div>

      {progress.mustChangePassword && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Tenés contraseña temporal. Cambiala abajo antes de cargar pronósticos.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <ProgressCard
          title="Bracket previo"
          description="1° y 2° de cada grupo, 8 terceros y campeón"
          done={bracketDone}
          total={bracketSteps}
          href="/bracket"
          locked={progress.bracketLocked}
        />
        <ProgressCard
          title="Pronósticos de partidos"
          description="Partidos abiertos que todavía podés cargar"
          done={progress.openMatchesPredicted}
          total={progress.openMatchesTotal}
          href="/partidos"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600">
        <p className="font-medium text-zinc-900">Cómo funciona tu cuenta</p>
        <ul className="mt-3 list-disc space-y-1 pl-5">
          <li>Cada uno tiene su usuario y contraseña propios.</li>
          <li>Los pronósticos son individuales: nadie edita los de otro.</li>
          <li>La tabla de posiciones en inicio es pública para todos.</li>
        </ul>
      </div>
    </div>
  );
}
