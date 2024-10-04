export interface JokeRaceEligibility {
  currentTerm: {
    contest: string;
    termEndsAt: number;
    topK: number;
    transitionPeriod: number;
    winners: string[];
  };
}
