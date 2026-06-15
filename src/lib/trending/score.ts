/**
 * NewVora Score — see PLAYBOOK §4.
 * Inputs are 0..1 floats. Output is 0..100.
 */
export type ScoreInputs = {
  trendVelocity: number;
  marginPotent: number;
  visualWow: number;
  problemSolving: number;
  impulse: number;
  shipFriendly: number;
  competitionIN: number;     // 0..1, lower competition = higher value (we invert below)
  supplierFound: boolean;
};

export function computeScore(i: ScoreInputs): number {
  const supplier = i.supplierFound ? 1 : 0.3;
  const lowComp = 1 - clamp(i.competitionIN);
  const raw =
    20 * clamp(i.trendVelocity) +
    20 * clamp(i.marginPotent) +
    15 * clamp(i.visualWow) +
    15 * supplier +
    10 * clamp(i.problemSolving) +
    8 * clamp(i.shipFriendly) +
    7 * clamp(i.impulse) +
    5 * lowComp;
  return Math.round(raw * 100) / 100;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n || 0));
