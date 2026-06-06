import type { MatchPhase } from "./types";

const SCORING: Record<
  MatchPhase,
  { exact: number; winner: number; isGroup: boolean }
> = {
  group: { exact: 3, winner: 1, isGroup: true },
  round_of_32: { exact: 3, winner: 2, isGroup: false },
  round_of_16: { exact: 4, winner: 2, isGroup: false },
  quarter: { exact: 6, winner: 3, isGroup: false },
  semi: { exact: 8, winner: 4, isGroup: false },
  final: { exact: 10, winner: 5, isGroup: false },
};

function isDraw(home: number, away: number) {
  return home === away;
}

function predictedWinner(
  home: number,
  away: number,
): "home" | "away" | "draw" {
  if (home > away) return "home";
  if (away > home) return "away";
  return "draw";
}

function actualWinner(
  homeScore: number,
  awayScore: number,
  decidedByPenalties: boolean,
  winnerTeamId: string | null,
  homeTeamId: string,
  awayTeamId: string,
  isGroup: boolean,
): "home" | "away" | "draw" {
  if (isGroup && isDraw(homeScore, awayScore)) {
    return "draw";
  }

  if (!isDraw(homeScore, awayScore)) {
    return homeScore > awayScore ? "home" : "away";
  }

  if (decidedByPenalties && winnerTeamId) {
    if (winnerTeamId === homeTeamId) return "home";
    if (winnerTeamId === awayTeamId) return "away";
  }

  return "draw";
}

export function calculateMatchPoints(
  phase: MatchPhase,
  actualHome: number,
  actualAway: number,
  predictedHome: number,
  predictedAway: number,
  decidedByPenalties: boolean,
  winnerTeamId: string | null,
  homeTeamId: string,
  awayTeamId: string,
): number {
  const config = SCORING[phase];

  if (predictedHome === actualHome && predictedAway === actualAway) {
    return config.exact;
  }

  const predicted = predictedWinner(predictedHome, predictedAway);
  const actual = actualWinner(
    actualHome,
    actualAway,
    decidedByPenalties,
    winnerTeamId,
    homeTeamId,
    awayTeamId,
    config.isGroup,
  );

  if (predicted === actual) {
    return config.winner;
  }

  return 0;
}

export function calculateBracketPoints(
  actualFirstId: string | null,
  actualSecondId: string | null,
  predictedFirstId: string,
  predictedSecondId: string,
): number {
  let points = 0;
  if (actualFirstId && predictedFirstId === actualFirstId) points += 1;
  if (actualSecondId && predictedSecondId === actualSecondId) points += 1;
  return points;
}

export function calculateThirdPlacePoints(
  actualTeamIds: string[],
  predictedTeamIds: string[],
): number {
  const actual = new Set(actualTeamIds);
  return predictedTeamIds.filter((id) => actual.has(id)).length;
}

export function calculateChampionPoints(
  actualChampionId: string | null,
  predictedChampionId: string,
): number {
  if (!actualChampionId) return 0;
  return actualChampionId === predictedChampionId ? 10 : 0;
}

export function isMatchLocked(matchDate: string, status: string): boolean {
  if (status === "locked" || status === "finished") return true;
  const lockTime = new Date(matchDate).getTime() - 60 * 60 * 1000;
  return Date.now() >= lockTime;
}

export function isBracketLocked(now = new Date()): boolean {
  return now >= new Date("2026-06-11T00:00:00-03:00");
}
