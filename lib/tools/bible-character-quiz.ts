import {
  BIBLE_CHARACTERS,
  QUIZ_QUESTIONS,
  TRAIT_IDS,
  type CharacterId,
  type CharacterProfile,
  type TraitId,
  type TraitVector,
} from "@/lib/content/bible-character-quiz";

export type RankedCharacter = {
  characterId: CharacterId;
  score: number;
};

export type QuizScore = {
  traitTotals: TraitVector;
  rankedCharacters: readonly RankedCharacter[];
};

function emptyTraitVector(): TraitVector {
  return Object.fromEntries(TRAIT_IDS.map((trait) => [trait, 0])) as TraitVector;
}

function cosineSimilarity(left: TraitVector, right: TraitVector): number {
  let dot = 0;
  let leftMagnitude = 0;
  let rightMagnitude = 0;

  for (const trait of TRAIT_IDS) {
    dot += left[trait] * right[trait];
    leftMagnitude += left[trait] ** 2;
    rightMagnitude += right[trait] ** 2;
  }

  if (leftMagnitude === 0 || rightMagnitude === 0) return 0;
  return dot / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export function scoreQuiz(answerIds: readonly string[]): QuizScore {
  if (answerIds.length !== QUIZ_QUESTIONS.length) {
    throw new Error(`Expected ${QUIZ_QUESTIONS.length} quiz answers.`);
  }

  const traitTotals = emptyTraitVector();

  QUIZ_QUESTIONS.forEach((question, index) => {
    const answer = question.answers.find((item) => item.id === answerIds[index]);
    if (!answer) throw new Error(`Invalid answer for question ${question.id}.`);

    for (const [trait, weight] of Object.entries(answer.weights)) {
      traitTotals[trait as TraitId] += weight ?? 0;
    }
  });

  const rankedCharacters = BIBLE_CHARACTERS.map((character, order) => ({
    characterId: character.id,
    score: cosineSimilarity(traitTotals, character.traits),
    order,
  }))
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .map(({ characterId, score }) => ({
      characterId,
      score: Number(score.toFixed(6)),
    }));

  return { traitTotals, rankedCharacters };
}

export function getQuizResult(answerIds: readonly string[]): CharacterProfile {
  const score = scoreQuiz(answerIds);
  const winner = score.rankedCharacters[0];
  const profile = BIBLE_CHARACTERS.find(
    (character) => character.id === winner?.characterId
  );

  if (!profile) throw new Error("Could not determine a quiz result.");
  return profile;
}
