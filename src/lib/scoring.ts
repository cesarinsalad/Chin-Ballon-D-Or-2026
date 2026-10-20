export const RANK_POINTS: Readonly<Record<number, number>> = { 1: 5, 2: 3, 3: 1 };

export type RankedTally = {
  nomineeId: number;
  points: number;
  firsts: number;
  seconds: number;
  thirds: number;
  appearances: number;
  position: number;
  tied: boolean;
};

export type Pick5Tally = {
  nomineeId: number;
  votes: number;
  position: number;
  inTeam: boolean;
  tied: boolean;
};

export function tallyRanked(
  picks: ReadonlyArray<{ nomineeId: number; rank: number }>,
): RankedTally[] {
  const map = new Map<number, RankedTally>();
  for (const pick of picks) {
    const entry =
      map.get(pick.nomineeId) ??
      ({
        nomineeId: pick.nomineeId,
        points: 0,
        firsts: 0,
        seconds: 0,
        thirds: 0,
        appearances: 0,
        position: 0,
        tied: false,
      } satisfies RankedTally);
    entry.points += RANK_POINTS[pick.rank] ?? 0;
    if (pick.rank === 1) entry.firsts += 1;
    else if (pick.rank === 2) entry.seconds += 1;
    else if (pick.rank === 3) entry.thirds += 1;
    entry.appearances += 1;
    map.set(pick.nomineeId, entry);
  }

  const ordered = [...map.values()].sort(
    (a, b) =>
      b.points - a.points ||
      b.firsts - a.firsts ||
      b.seconds - a.seconds ||
      a.nomineeId - b.nomineeId,
  );

  let position = 0;
  ordered.forEach((entry, index) => {
    const previous = ordered[index - 1];
    const sameKey =
      previous !== undefined &&
      previous.points === entry.points &&
      previous.firsts === entry.firsts &&
      previous.seconds === entry.seconds;
    position = sameKey ? position : index + 1;
    entry.position = position;
  });

  for (let index = 0; index < ordered.length - 1; index += 1) {
    if (ordered[index].position === ordered[index + 1].position) {
      ordered[index].tied = true;
      ordered[index + 1].tied = true;
    }
  }

  return ordered;
}

export function tallyPick5(
  picks: ReadonlyArray<{ nomineeId: number }>,
): Pick5Tally[] {
  const map = new Map<number, Pick5Tally>();
  for (const pick of picks) {
    const entry =
      map.get(pick.nomineeId) ??
      ({
        nomineeId: pick.nomineeId,
        votes: 0,
        position: 0,
        inTeam: false,
        tied: false,
      } satisfies Pick5Tally);
    entry.votes += 1;
    map.set(pick.nomineeId, entry);
  }

  const ordered = [...map.values()].sort(
    (a, b) => b.votes - a.votes || a.nomineeId - b.nomineeId,
  );

  let position = 0;
  ordered.forEach((entry, index) => {
    const previous = ordered[index - 1];
    const sameKey = previous !== undefined && previous.votes === entry.votes;
    position = sameKey ? position : index + 1;
    entry.position = position;
  });

  if (ordered.length > 0) {
    const boundaryVotes = ordered[Math.min(ordered.length, 5) - 1].votes;
    for (const entry of ordered) {
      entry.inTeam = entry.votes >= boundaryVotes;
    }
  }

  for (let index = 0; index < ordered.length - 1; index += 1) {
    if (ordered[index].position === ordered[index + 1].position) {
      ordered[index].tied = true;
      ordered[index + 1].tied = true;
    }
  }

  return ordered;
}
