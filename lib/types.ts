export type MatchPhase =
  | "group"
  | "round_of_32"
  | "round_of_16"
  | "quarter"
  | "semi"
  | "final";

export type MatchStatus = "upcoming" | "locked" | "finished";
export type UserRole = "admin" | "player";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  must_change_password: boolean;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  group: string;
  flag_emoji: string;
}

export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  phase: MatchPhase;
  group_name: string | null;
  home_score: number | null;
  away_score: number | null;
  decided_by_penalties: boolean;
  winner_team_id: string | null;
  status: MatchStatus;
  home_team?: Team;
  away_team?: Team;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  created_at: string;
  updated_at: string;
}

export interface BracketPrediction {
  id: string;
  user_id: string;
  group_name: string;
  predicted_first_id: string;
  predicted_second_id: string;
}

export interface ThirdPlacePrediction {
  id: string;
  user_id: string;
  team_ids: string[];
}

export interface ChampionPrediction {
  id: string;
  user_id: string;
  team_id: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_initials: string;
  match_points: number;
  bracket_points: number;
  third_place_points: number;
  champion_points: number;
  total_points: number;
}
