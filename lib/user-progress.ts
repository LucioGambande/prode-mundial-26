import { GROUPS, THIRD_PLACE_COUNT } from "./constants";
import { isBracketLocked, isMatchLocked } from "./scoring";
import type {
  BracketPrediction,
  ChampionPrediction,
  Match,
  Prediction,
  ThirdPlacePrediction,
} from "./types";

export interface UserProgress {
  openMatchesTotal: number;
  openMatchesPredicted: number;
  bracketComplete: boolean;
  bracketLocked: boolean;
  groupsCompleted: number;
  thirdPlacesSelected: number;
  hasChampion: boolean;
  mustChangePassword: boolean;
}

export function getUserProgress(
  matches: Match[],
  predictions: Prediction[],
  bracketPredictions: BracketPrediction[],
  thirdPlacePrediction?: ThirdPlacePrediction | null,
  championPrediction?: ChampionPrediction | null,
  mustChangePassword = false,
): UserProgress {
  const openMatches = matches.filter(
    (m) => m.status === "upcoming" && !isMatchLocked(m.match_date, m.status),
  );

  const predictedMatchIds = new Set(predictions.map((p) => p.match_id));
  const openMatchesPredicted = openMatches.filter((m) =>
    predictedMatchIds.has(m.id),
  ).length;

  const groupsCompleted = GROUPS.filter((group) => {
    const pick = bracketPredictions.find((b) => b.group_name === group);
    return Boolean(
      pick?.predicted_first_id &&
        pick?.predicted_second_id &&
        pick.predicted_first_id !== pick.predicted_second_id,
    );
  }).length;

  const thirdPlacesSelected = thirdPlacePrediction?.team_ids?.length ?? 0;
  const hasChampion = Boolean(championPrediction?.team_id);
  const bracketComplete =
    groupsCompleted === GROUPS.length &&
    thirdPlacesSelected === THIRD_PLACE_COUNT &&
    hasChampion;

  return {
    openMatchesTotal: openMatches.length,
    openMatchesPredicted,
    bracketComplete,
    bracketLocked: isBracketLocked(),
    groupsCompleted,
    thirdPlacesSelected,
    hasChampion,
    mustChangePassword,
  };
}
