export const TRAIT_IDS = [
  "courage",
  "faith",
  "leadership",
  "loyalty",
  "wisdom",
  "compassion",
  "resilience",
  "encouragement",
  "worship",
  "integrity",
] as const;

export type TraitId = (typeof TRAIT_IDS)[number];
export type CharacterId =
  | "david"
  | "esther"
  | "ruth"
  | "joseph"
  | "peter"
  | "deborah"
  | "daniel"
  | "barnabas";

export type TraitVector = Record<TraitId, number>;

export type CharacterProfile = {
  id: CharacterId;
  slug: CharacterId;
  name: string;
  title: string;
  metaDescription: string;
  summary: string;
  reflection: string;
  strengths: readonly string[];
  growthArea: string;
  verse: { reference: string; text: string; translation: "KJV" };
  scriptureContext: string;
  storyReferences: readonly string[];
  reflectionQuestions: readonly string[];
  traits: TraitVector;
};

export type QuizAnswer = {
  id: string;
  label: string;
  weights: Partial<Record<TraitId, number>>;
};

export type QuizQuestion = {
  id: string;
  prompt: string;
  answers: readonly [QuizAnswer, QuizAnswer, QuizAnswer, QuizAnswer];
};

export const BIBLE_CHARACTERS: readonly CharacterProfile[] = [
  {
    id: "david",
    slug: "david",
    name: "David",
    title: "The Honest Worshipper",
    metaDescription:
      "Your Bible Character Quiz result is David: courageous, resilient, and drawn to honest worship through both victory and failure.",
    summary:
      "Your answers suggest a heart that processes life honestly before God and finds renewed courage through worship.",
    reflection:
      "David’s story includes bold faith, creative worship, costly mistakes, repentance, and perseverance. A David-shaped reflection does not mean perfection; it points to someone who brings both confidence and weakness into God’s presence instead of pretending. You may be energized by meaningful expression and willing to move forward again after a setback.",
    strengths: ["Honest worship", "Courage under pressure", "Resilient faith"],
    growthArea:
      "Strong emotion and quick action can outrun wise accountability. Let honest prayer lead into patient choices, repentance, and trusted counsel.",
    verse: {
      reference: "Psalm 34:1",
      text: "I will bless the LORD at all times: his praise shall continually be in my mouth.",
      translation: "KJV",
    },
    scriptureContext:
      "David wrote from changing seasons—danger, deliverance, joy, and regret. His worship did not deny difficulty; it repeatedly turned his attention toward the character of God.",
    storyReferences: ["1 Samuel 17", "2 Samuel 12:1-13", "Psalm 51"],
    reflectionQuestions: [
      "What emotion do you need to bring honestly to God today?",
      "Where could courage be paired with wiser accountability?",
    ],
    traits: {
      courage: 5, faith: 5, leadership: 3, loyalty: 3, wisdom: 2,
      compassion: 3, resilience: 5, encouragement: 3, worship: 5, integrity: 3,
    },
  },
  {
    id: "esther",
    slug: "esther",
    name: "Esther",
    title: "The Courageous Advocate",
    metaDescription:
      "Your Bible Character Quiz result is Esther: thoughtful, courageous, compassionate, and attentive to wise timing.",
    summary:
      "Your answers reflect thoughtful courage—the desire to protect others while choosing your moment with care.",
    reflection:
      "Esther listened, prepared, fasted, and then spoke when silence would have left others exposed. Her courage was not impulsive; it combined concern for her people with wise timing and personal risk. You may prefer to understand a situation before acting, yet become remarkably brave when someone vulnerable needs an advocate.",
    strengths: ["Wise timing", "Courageous advocacy", "Compassionate influence"],
    growthArea:
      "Careful preparation can become hesitation. Wisdom also recognizes the moment when another delay would simply protect your comfort.",
    verse: {
      reference: "Esther 4:14",
      text: "And who knoweth whether thou art come to the kingdom for such a time as this?",
      translation: "KJV",
    },
    scriptureContext:
      "Mordecai’s question invited Esther to consider both responsibility and providence. She responded by asking her community to fast before she approached the king.",
    storyReferences: ["Esther 4", "Esther 5:1-8", "Esther 7:1-6"],
    reflectionQuestions: [
      "Who may need you to use your influence with courage?",
      "Are you preparing wisely, or postponing a necessary conversation?",
    ],
    traits: {
      courage: 5, faith: 4, leadership: 4, loyalty: 4, wisdom: 5,
      compassion: 5, resilience: 4, encouragement: 2, worship: 2, integrity: 4,
    },
  },
  {
    id: "ruth",
    slug: "ruth",
    name: "Ruth",
    title: "The Faithful Friend",
    metaDescription:
      "Your Bible Character Quiz result is Ruth: loyal, compassionate, resilient, and faithful in ordinary responsibilities.",
    summary:
      "Your answers point toward steadfast love—the kind that stays present and serves faithfully when life becomes uncertain.",
    reflection:
      "Ruth’s faithfulness appeared through ordinary, costly decisions: remaining with Naomi, working diligently, and walking humbly into an unfamiliar future. Her story honors loyalty without making hardship glamorous. You may show love less through dramatic speeches and more through dependable presence, practical care, and promises kept.",
    strengths: ["Steadfast loyalty", "Practical compassion", "Quiet resilience"],
    growthArea:
      "Loyal people can overlook their own limits. Faithfulness does not require accepting harm or carrying every burden without help.",
    verse: {
      reference: "Ruth 1:16",
      text: "Whither thou goest, I will go; and where thou lodgest, I will lodge: thy people shall be my people, and thy God my God.",
      translation: "KJV",
    },
    scriptureContext:
      "Ruth spoke these words after bereavement and displacement. Her commitment to Naomi shaped a new life built through daily faithfulness, community, and God’s provision.",
    storyReferences: ["Ruth 1:6-18", "Ruth 2", "Ruth 4:13-17"],
    reflectionQuestions: [
      "Who experiences God’s care through your dependable presence?",
      "Where do you need a healthy boundary alongside loyalty?",
    ],
    traits: {
      courage: 3, faith: 5, leadership: 2, loyalty: 5, wisdom: 3,
      compassion: 5, resilience: 5, encouragement: 4, worship: 2, integrity: 5,
    },
  },
  {
    id: "joseph",
    slug: "joseph",
    name: "Joseph",
    title: "The Resilient Steward",
    metaDescription:
      "Your Bible Character Quiz result is Joseph: resilient, wise, responsible, and able to steward influence through adversity.",
    summary:
      "Your answers resemble patient resilience—the ability to learn, plan, and remain responsible through unwanted change.",
    reflection:
      "Joseph’s path moved through betrayal, false accusation, waiting, responsibility, and eventual influence. Scripture does not call the harm good; it shows God at work without excusing those who caused it. You may naturally look for the next faithful responsibility, develop practical solutions, and resist letting disappointment define your future.",
    strengths: ["Patient resilience", "Practical wisdom", "Responsible leadership"],
    growthArea:
      "Competence can become emotional distance. Make room to grieve honestly and receive support instead of solving every pain alone.",
    verse: {
      reference: "Genesis 50:20",
      text: "But as for you, ye thought evil against me; but God meant it unto good, to bring to pass, as it is this day, to save much people alive.",
      translation: "KJV",
    },
    scriptureContext:
      "Joseph named his brothers’ intent as evil while also recognizing God’s preserving work. Forgiveness did not require pretending that betrayal was harmless.",
    storyReferences: ["Genesis 39", "Genesis 41:33-57", "Genesis 50:15-21"],
    reflectionQuestions: [
      "What is the next responsibility you can steward faithfully?",
      "What pain needs to be named rather than merely managed?",
    ],
    traits: {
      courage: 3, faith: 5, leadership: 5, loyalty: 4, wisdom: 5,
      compassion: 3, resilience: 5, encouragement: 2, worship: 2, integrity: 5,
    },
  },
  {
    id: "peter",
    slug: "peter",
    name: "Peter",
    title: "The Growing Disciple",
    metaDescription:
      "Your Bible Character Quiz result is Peter: bold, action-oriented, loyal, and willing to grow through correction and grace.",
    summary:
      "Your answers reflect an action-oriented spirit that learns through experience and often finds courage by stepping forward.",
    reflection:
      "Peter spoke quickly, acted boldly, misunderstood Jesus, failed publicly, and was restored personally. His story is hopeful because growth did not depend on maintaining a flawless image. You may be willing to take initiative when others hold back, and your deepest maturity may come through receiving correction without surrendering your calling to shame.",
    strengths: ["Bold initiative", "Relational loyalty", "Capacity to grow"],
    growthArea:
      "Speed and confidence can leave listening behind. Pause long enough for prayer, Scripture, and other people to refine your first reaction.",
    verse: {
      reference: "Luke 22:32",
      text: "But I have prayed for thee, that thy faith fail not: and when thou art converted, strengthen thy brethren.",
      translation: "KJV",
    },
    scriptureContext:
      "Jesus spoke before Peter’s denial, naming both the coming failure and a future of strengthening others. Restoration turned weakness into compassionate leadership.",
    storyReferences: ["Matthew 14:22-33", "Luke 22:54-62", "John 21:15-19"],
    reflectionQuestions: [
      "Where might God be inviting you to act courageously?",
      "What correction could become part of your growth rather than your shame?",
    ],
    traits: {
      courage: 5, faith: 4, leadership: 5, loyalty: 4, wisdom: 2,
      compassion: 3, resilience: 4, encouragement: 3, worship: 2, integrity: 3,
    },
  },
  {
    id: "deborah",
    slug: "deborah",
    name: "Deborah",
    title: "The Discerning Leader",
    metaDescription:
      "Your Bible Character Quiz result is Deborah: discerning, courageous, encouraging, and ready to help others act faithfully.",
    summary:
      "Your answers suggest discerning leadership—the ability to see what matters, speak clearly, and help others move forward.",
    reflection:
      "Deborah served as judge and prophet in a fearful season. She offered wisdom, communicated God’s instruction, accompanied Barak, and celebrated the people who stepped forward. You may combine strategic clarity with the ability to call courage out of others, preferring shared faithfulness over attention for yourself.",
    strengths: ["Discerning wisdom", "Courageous leadership", "Mobilizing encouragement"],
    growthArea:
      "Capable leaders can carry too much. Invite others into responsibility and resist measuring your worth by how many problems you can solve.",
    verse: {
      reference: "Judges 5:7",
      text: "The inhabitants of the villages ceased, they ceased in Israel, until that I Deborah arose, that I arose a mother in Israel.",
      translation: "KJV",
    },
    scriptureContext:
      "Deborah’s song remembers a season when ordinary life had become unsafe and honors those who willingly responded. Her leadership combined truth, presence, and praise.",
    storyReferences: ["Judges 4:4-10", "Judges 4:14-16", "Judges 5"],
    reflectionQuestions: [
      "Whose courage could grow through your encouragement?",
      "Which responsibility should you share instead of carrying alone?",
    ],
    traits: {
      courage: 5, faith: 4, leadership: 5, loyalty: 3, wisdom: 5,
      compassion: 3, resilience: 4, encouragement: 5, worship: 3, integrity: 4,
    },
  },
  {
    id: "daniel",
    slug: "daniel",
    name: "Daniel",
    title: "The Steadfast Witness",
    metaDescription:
      "Your Bible Character Quiz result is Daniel: faithful, wise, disciplined, and committed to integrity under pressure.",
    summary:
      "Your answers reflect steady conviction—the desire to remain faithful and thoughtful when surrounding pressure changes.",
    reflection:
      "Daniel lived and served within an empire that did not share his worship. He practiced disciplined prayer, pursued wisdom, worked responsibly, and drew clear boundaries when obedience was at stake. You may be less interested in dramatic attention than in consistency: doing excellent work while refusing to let pressure quietly rewrite your deepest convictions.",
    strengths: ["Steady conviction", "Disciplined faith", "Integrity under pressure"],
    growthArea:
      "Strong convictions need humility and compassion. Guard against treating every preference as a test of faithfulness or withdrawing from people who differ.",
    verse: {
      reference: "Daniel 1:8",
      text: "But Daniel purposed in his heart that he would not defile himself with the portion of the king's meat, nor with the wine which he drank.",
      translation: "KJV",
    },
    scriptureContext:
      "Daniel’s boundary was deliberate rather than performative. He proposed a respectful alternative and entrusted the outcome to God while continuing to serve responsibly.",
    storyReferences: ["Daniel 1:8-20", "Daniel 2:14-23", "Daniel 6:10-23"],
    reflectionQuestions: [
      "Which small practice helps keep your convictions steady?",
      "How can you hold a boundary with both courage and humility?",
    ],
    traits: {
      courage: 4, faith: 5, leadership: 3, loyalty: 4, wisdom: 5,
      compassion: 2, resilience: 5, encouragement: 2, worship: 3, integrity: 5,
    },
  },
  {
    id: "barnabas",
    slug: "barnabas",
    name: "Barnabas",
    title: "The Generous Encourager",
    metaDescription:
      "Your Bible Character Quiz result is Barnabas: encouraging, compassionate, generous, and willing to believe in another person’s growth.",
    summary:
      "Your answers point toward encouragement—the ability to notice grace in people and help them take their next faithful step.",
    reflection:
      "Barnabas gave generously, welcomed Saul when others were afraid, recognized God’s grace in Antioch, and later stood beside John Mark. Encouragement in his story was not empty positivity; it included courage, generosity, and advocacy. You may naturally create room for others to grow and notice potential that fear or failure has hidden.",
    strengths: ["Life-giving encouragement", "Generous compassion", "Trust-building advocacy"],
    growthArea:
      "Supporting others does not mean avoiding every hard conversation. Healthy encouragement can tell the truth, protect boundaries, and accept disagreement.",
    verse: {
      reference: "Acts 11:24",
      text: "For he was a good man, and full of the Holy Ghost and of faith: and much people was added unto the Lord.",
      translation: "KJV",
    },
    scriptureContext:
      "Barnabas saw evidence of God’s grace, encouraged believers to remain faithful, and then sought Saul so they could teach together. His influence multiplied through partnership.",
    storyReferences: ["Acts 4:36-37", "Acts 9:26-28", "Acts 11:22-26"],
    reflectionQuestions: [
      "Whose growth could you encourage specifically this week?",
      "Where does encouragement need to include an honest boundary?",
    ],
    traits: {
      courage: 3, faith: 4, leadership: 3, loyalty: 5, wisdom: 3,
      compassion: 5, resilience: 3, encouragement: 5, worship: 2, integrity: 4,
    },
  },
];

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "unexpected-pressure",
    prompt: "When an unexpected challenge arrives, what is your first healthy instinct?",
    answers: [
      { id: "pressure-pray", label: "Pray, hold my convictions, and face it directly", weights: { faith: 3, integrity: 3, courage: 2 } },
      { id: "pressure-plan", label: "Understand the facts and make a practical plan", weights: { wisdom: 3, leadership: 2, resilience: 2 } },
      { id: "pressure-care", label: "Check who is affected and make sure they are supported", weights: { compassion: 3, encouragement: 3, loyalty: 1 } },
      { id: "pressure-stay", label: "Keep showing up quietly until the season changes", weights: { loyalty: 3, resilience: 3, faith: 1 } },
    ],
  },
  {
    id: "group-role",
    prompt: "In a group facing uncertainty, which role feels most natural?",
    answers: [
      { id: "group-speak", label: "Speak courage and help everyone take the next step", weights: { courage: 3, leadership: 3, encouragement: 1 } },
      { id: "group-discern", label: "Listen carefully and identify the wisest direction", weights: { wisdom: 3, integrity: 2, faith: 1 } },
      { id: "group-notice", label: "Notice who feels excluded and bring them in", weights: { compassion: 3, encouragement: 3, loyalty: 1 } },
      { id: "group-finish", label: "Stay dependable and complete what others overlook", weights: { loyalty: 3, resilience: 3, integrity: 1 } },
    ],
  },
  {
    id: "quiet-time",
    prompt: "Which practice most often helps you reconnect with God?",
    answers: [
      { id: "quiet-worship", label: "Honest prayer, music, or words of worship", weights: { worship: 4, faith: 2, resilience: 1 } },
      { id: "quiet-study", label: "Studying Scripture and reflecting carefully", weights: { wisdom: 3, faith: 2, integrity: 2 } },
      { id: "quiet-serve", label: "Serving someone in a practical, faithful way", weights: { compassion: 3, loyalty: 3, faith: 1 } },
      { id: "quiet-gather", label: "Gathering people around a meaningful purpose", weights: { leadership: 3, courage: 2, encouragement: 2 } },
    ],
  },
  {
    id: "disappointment",
    prompt: "What response helps you move through disappointment?",
    answers: [
      { id: "disappointment-wait", label: "Keep doing the next faithful thing while I wait", weights: { resilience: 3, faith: 3, integrity: 1 } },
      { id: "disappointment-lament", label: "Name the pain honestly and turn it into prayer", weights: { worship: 3, resilience: 2, faith: 2 } },
      { id: "disappointment-timing", label: "Seek wise timing before deciding what to do", weights: { wisdom: 3, courage: 2, leadership: 1 } },
      { id: "disappointment-encourage", label: "Use what I learned to strengthen someone else", weights: { encouragement: 3, compassion: 3, resilience: 1 } },
    ],
  },
  {
    id: "injustice",
    prompt: "When you see someone treated unfairly, what are you most likely to do?",
    answers: [
      { id: "injustice-appeal", label: "Prepare carefully and advocate at the right moment", weights: { courage: 3, wisdom: 3, compassion: 2 } },
      { id: "injustice-confront", label: "Speak directly and invite others to act", weights: { courage: 3, leadership: 3, integrity: 1 } },
      { id: "injustice-integrity", label: "Refuse to participate, even when it costs me", weights: { integrity: 4, faith: 2, courage: 1 } },
      { id: "injustice-beside", label: "Stay beside the person and offer practical support", weights: { loyalty: 3, compassion: 3, encouragement: 1 } },
    ],
  },
  {
    id: "team-contribution",
    prompt: "What contribution do people most often value from you?",
    answers: [
      { id: "team-direction", label: "Direction and willingness to take responsibility", weights: { leadership: 4, courage: 2, resilience: 1 } },
      { id: "team-clarity", label: "Clear thinking and careful judgment", weights: { wisdom: 4, integrity: 2, leadership: 1 } },
      { id: "team-hope", label: "Hope, affirmation, and belief in their growth", weights: { encouragement: 4, compassion: 2, faith: 1 } },
      { id: "team-reliability", label: "Reliability and long-term commitment", weights: { loyalty: 4, resilience: 2, integrity: 1 } },
    ],
  },
  {
    id: "spiritual-strength",
    prompt: "Which spiritual strength would you most like to be known for?",
    answers: [
      { id: "strength-worship", label: "Returning to worship in every season", weights: { worship: 4, faith: 2, resilience: 1 } },
      { id: "strength-conviction", label: "Holding conviction with integrity under pressure", weights: { integrity: 4, faith: 2, courage: 1 } },
      { id: "strength-faithfulness", label: "Loving people faithfully through ordinary life", weights: { loyalty: 3, compassion: 3, resilience: 1 } },
      { id: "strength-build", label: "Calling out courage and potential in others", weights: { encouragement: 4, leadership: 2, compassion: 1 } },
    ],
  },
  {
    id: "decision",
    prompt: "When a difficult decision cannot be avoided, what grounds you?",
    answers: [
      { id: "decision-timing", label: "Prayer, preparation, and choosing the right moment", weights: { wisdom: 3, courage: 2, faith: 2 } },
      { id: "decision-boundary", label: "A clear conviction I should not compromise", weights: { integrity: 4, faith: 2, resilience: 1 } },
      { id: "decision-counsel", label: "Wise counsel, facts, and a responsible plan", weights: { wisdom: 3, leadership: 2, resilience: 2 } },
      { id: "decision-people", label: "The effect the choice will have on people I love", weights: { compassion: 3, loyalty: 3, wisdom: 1 } },
    ],
  },
  {
    id: "failure",
    prompt: "After realizing you were wrong, which response best describes healthy growth for you?",
    answers: [
      { id: "failure-return", label: "Return to God, receive grace, and try again", weights: { faith: 3, resilience: 3, courage: 1 } },
      { id: "failure-confess", label: "Confess honestly and bring the whole emotion to God", weights: { worship: 3, integrity: 3, faith: 1 } },
      { id: "failure-learn", label: "Understand what happened and build a wiser pattern", weights: { wisdom: 3, resilience: 2, integrity: 2 } },
      { id: "failure-support", label: "Receive support, then encourage someone with what I learned", weights: { encouragement: 3, compassion: 3, resilience: 1 } },
    ],
  },
  {
    id: "legacy",
    prompt: "What kind of influence would you most like your life to leave?",
    answers: [
      { id: "legacy-courage", label: "People became braver and more willing to act faithfully", weights: { courage: 3, leadership: 3, encouragement: 1 } },
      { id: "legacy-conviction", label: "People saw consistent faith and integrity", weights: { faith: 3, integrity: 3, resilience: 1 } },
      { id: "legacy-love", label: "People experienced loyal and practical love", weights: { loyalty: 3, compassion: 3, faith: 1 } },
      { id: "legacy-hope", label: "People found hope, worship, and a reason to continue", weights: { encouragement: 3, worship: 3, resilience: 1 } },
    ],
  },
];

export function getBibleCharacterBySlug(slug: string): CharacterProfile | undefined {
  return BIBLE_CHARACTERS.find((character) => character.slug === slug);
}

export function getAllCharacterSlugs(): CharacterId[] {
  return BIBLE_CHARACTERS.map((character) => character.slug);
}
