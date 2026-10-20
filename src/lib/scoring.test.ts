import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { tallyPick5, tallyRanked } from "./scoring.ts";

describe("tallyRanked", () => {
  it("asigna 5-3-1 y ordena por puntos", () => {
    const result = tallyRanked([
      { nomineeId: 1, rank: 1 },
      { nomineeId: 2, rank: 2 },
      { nomineeId: 3, rank: 3 },
      { nomineeId: 2, rank: 1 },
    ]);
    assert.equal(result[0].nomineeId, 2);
    assert.equal(result[0].points, 8);
    assert.equal(result[0].firsts, 1);
    assert.equal(result[0].seconds, 1);
    assert.equal(result[1].nomineeId, 1);
    assert.equal(result[1].points, 5);
    assert.equal(result[2].nomineeId, 3);
    assert.equal(result[2].points, 1);
    assert.deepEqual(result.map((r) => r.position), [1, 2, 3]);
  });

  it("rompe empate de puntos por más primeros puestos", () => {
    const result = tallyRanked([
      { nomineeId: 1, rank: 1 },
      { nomineeId: 1, rank: 3 },
      { nomineeId: 2, rank: 2 },
      { nomineeId: 2, rank: 2 },
    ]);
    assert.equal(result[0].nomineeId, 1);
    assert.equal(result[0].points, 6);
    assert.equal(result[0].position, 1);
    assert.equal(result[1].nomineeId, 2);
    assert.equal(result[1].position, 2);
    assert.equal(result[0].tied, false);
  });

  it("comparte posición en empate total", () => {
    const result = tallyRanked([
      { nomineeId: 1, rank: 1 },
      { nomineeId: 2, rank: 1 },
    ]);
    assert.equal(result[0].position, 1);
    assert.equal(result[1].position, 1);
    assert.equal(result[0].tied, true);
    assert.equal(result[1].tied, true);
  });

  it("devuelve vacío sin votos", () => {
    assert.deepEqual(tallyRanked([]), []);
  });
});

describe("tallyPick5", () => {
  it("marca el equipo ideal de 5", () => {
    const result = tallyPick5([
      { nomineeId: 1 },
      { nomineeId: 1 },
      { nomineeId: 1 },
      { nomineeId: 1 },
      { nomineeId: 1 },
      { nomineeId: 2 },
      { nomineeId: 2 },
      { nomineeId: 2 },
      { nomineeId: 2 },
      { nomineeId: 3 },
      { nomineeId: 3 },
      { nomineeId: 3 },
      { nomineeId: 4 },
      { nomineeId: 4 },
      { nomineeId: 5 },
    ]);
    const team = result.filter((r) => r.inTeam).map((r) => r.nomineeId);
    assert.deepEqual(team, [1, 2, 3, 4, 5]);
    assert.equal(result.find((r) => r.nomineeId === 6), undefined);
  });

  it("incluye empatados en el quinto puesto (equipo de 6)", () => {
    const result = tallyPick5([
      { nomineeId: 1 },
      { nomineeId: 1 },
      { nomineeId: 2 },
      { nomineeId: 3 },
      { nomineeId: 4 },
      { nomineeId: 5 },
      { nomineeId: 6 },
    ]);
    const team = result.filter((r) => r.inTeam).map((r) => r.nomineeId);
    assert.deepEqual(team, [1, 2, 3, 4, 5, 6]);
    const tied = result.filter((r) => r.inTeam && r.votes === 1).every((r) => r.tied);
    assert.equal(tied, true);
  });

  it("con pocos nominados, todos entran al equipo", () => {
    const result = tallyPick5([{ nomineeId: 1 }, { nomineeId: 2 }]);
    assert.equal(result.length, 2);
    assert.equal(result.every((r) => r.inTeam), true);
  });

  it("devuelve vacío sin votos", () => {
    assert.deepEqual(tallyPick5([]), []);
  });
});
