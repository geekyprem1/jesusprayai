export type PromptCategory =
  | "gratitude"
  | "confession"
  | "intercession"
  | "praise"
  | "acts";

export type PrayerPrompt = {
  id: string;
  category: PromptCategory;
  text: string;
};

export const PROMPT_CATEGORIES: {
  id: PromptCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "gratitude",
    label: "Gratitude",
    description: "Thank God for specific gifts and mercies.",
  },
  {
    id: "confession",
    label: "Confession",
    description: "Honestly name sin and receive mercy in Christ.",
  },
  {
    id: "intercession",
    label: "Intercession",
    description: "Pray for others by name and need.",
  },
  {
    id: "praise",
    label: "Praise",
    description: "Worship God for who He is, not only what He gives.",
  },
  {
    id: "acts",
    label: "ACTS",
    description: "Adoration, Confession, Thanksgiving, Supplication.",
  },
];

export const PRAYER_PROMPTS: PrayerPrompt[] = [
  {
    id: "g1",
    category: "gratitude",
    text: "Lord, today I thank You specifically for ________. Help me notice Your kindness in ordinary moments.",
  },
  {
    id: "g2",
    category: "gratitude",
    text: "Father, thank You for the people You have placed in my life. I name ________ and ask You to bless them.",
  },
  {
    id: "g3",
    category: "gratitude",
    text: "God, thank You for a mercy I almost overlooked this week: ________.",
  },
  {
    id: "g4",
    category: "gratitude",
    text: "Jesus, thank You that You are enough when ________ feels scarce.",
  },
  {
    id: "c1",
    category: "confession",
    text: "Lord, I confess that I have ________. Forgive me and renew a right spirit within me.",
  },
  {
    id: "c2",
    category: "confession",
    text: "Father, I have trusted my own understanding in ________. Teach me to lean on You.",
  },
  {
    id: "c3",
    category: "confession",
    text: "Holy Spirit, show me where I have been hard-hearted toward ________. Soften me to forgive as I have been forgiven.",
  },
  {
    id: "c4",
    category: "confession",
    text: "God, I bring You the anxious thoughts I have clung to about ________. Help me cast them on You.",
  },
  {
    id: "i1",
    category: "intercession",
    text: "Lord, I lift up ________. Meet their need for ________ and draw them near to Christ.",
  },
  {
    id: "i2",
    category: "intercession",
    text: "Father, strengthen ________ in their faith. Give them courage for ________.",
  },
  {
    id: "i3",
    category: "intercession",
    text: "Jesus, comfort those who mourn ________. Be near to the brokenhearted.",
  },
  {
    id: "i4",
    category: "intercession",
    text: "God, guide leaders and pastors serving ________. Give them wisdom and integrity.",
  },
  {
    id: "p1",
    category: "praise",
    text: "Lord, I praise You because You are ________. Your character does not change with my circumstances.",
  },
  {
    id: "p2",
    category: "praise",
    text: "Holy God, You are faithful. I praise You for keeping Your promises when ________.",
  },
  {
    id: "p3",
    category: "praise",
    text: "Jesus, You are worthy of worship. I adore You as my ________.",
  },
  {
    id: "p4",
    category: "praise",
    text: "Father, Your Word is a lamp. I praise You that Scripture speaks truth over ________.",
  },
  {
    id: "a1",
    category: "acts",
    text: "ADORATION: God, I worship You as ________. CONFESSION: Forgive me for ________. THANKSGIVING: Thank You for ________. SUPPLICATION: I ask for ________.",
  },
  {
    id: "a2",
    category: "acts",
    text: "ADORATION: Lord, You are holy and near. CONFESSION: I have neglected prayer about ________. THANKSGIVING: Thank You for hearing me. SUPPLICATION: Help me walk in ________ today.",
  },
  {
    id: "a3",
    category: "acts",
    text: "ADORATION: Father, Your mercies are new every morning. CONFESSION: I have been impatient with ________. THANKSGIVING: Thank You for Your patience with me. SUPPLICATION: Give me grace for ________.",
  },
];

export function promptsByCategory(category: PromptCategory | "all") {
  if (category === "all") return PRAYER_PROMPTS;
  return PRAYER_PROMPTS.filter((p) => p.category === category);
}
