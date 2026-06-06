import type {
  BracketPrediction,
  ChampionPrediction,
  LeaderboardEntry,
  Match,
  Prediction,
  User,
  ThirdPlacePrediction,
} from "./types";
import { initials } from "./auth";
import {
  calculateBracketPoints,
  calculateChampionPoints,
  calculateMatchPoints,
  calculateThirdPlacePoints,
} from "./scoring";

interface GroupStanding {
  group_name: string;
  first_team_id: string | null;
  second_team_id: string | null;
}

export function buildLeaderboard(
  users: User[],
  matches: Match[],
  predictions: Prediction[],
  bracketPredictions: BracketPrediction[],
  thirdPlacePredictions: ThirdPlacePrediction[],
  championPredictions: ChampionPrediction[],
  groupStandings: GroupStanding[],
  actualThirdPlaceIds: string[],
  actualChampionId: string | null,
): LeaderboardEntry[] {
  const finishedMatches = matches.filter((m) => m.status === "finished");
  const standingsByGroup = new Map(
    groupStandings.map((s) => [s.group_name, s]),
  );

  return users
    .map((user) => {
      const userPredictions = predictions.filter((p) => p.user_id === user.id);
      const userBracket = bracketPredictions.filter((b) => b.user_id === user.id);
      const userThird = thirdPlacePredictions.find((t) => t.user_id === user.id);
      const userChampion = championPredictions.find((c) => c.user_id === user.id);

      let matchPoints = 0;
      for (const prediction of userPredictions) {
        const match = finishedMatches.find((m) => m.id === prediction.match_id);
        if (!match || match.home_score === null || match.away_score === null) continue;

        matchPoints += calculateMatchPoints(
          match.phase,
          match.home_score,
          match.away_score,
          prediction.home_score,
          prediction.away_score,
          match.decided_by_penalties,
          match.winner_team_id,
          match.home_team_id,
          match.away_team_id,
        );
      }

      let bracketPoints = 0;
      for (const bp of userBracket) {
        const standing = standingsByGroup.get(bp.group_name);
        bracketPoints += calculateBracketPoints(
          standing?.first_team_id ?? null,
          standing?.second_team_id ?? null,
          bp.predicted_first_id,
          bp.predicted_second_id,
        );
      }

      const thirdPlacePoints = userThird
        ? calculateThirdPlacePoints(actualThirdPlaceIds, userThird.team_ids)
        : 0;

      const championPoints = userChampion
        ? calculateChampionPoints(actualChampionId, userChampion.team_id)
        : 0;

      return {
        id: user.id,
        name: user.name,
        avatar_initials: initials(user.name),
        match_points: matchPoints,
        bracket_points: bracketPoints,
        third_place_points: thirdPlacePoints,
        champion_points: championPoints,
        total_points:
          matchPoints + bracketPoints + thirdPlacePoints + championPoints,
      };
    })
    .sort((a, b) => b.total_points - a.total_points || a.name.localeCompare(b.name));
}
