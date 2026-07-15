export type CuratedVerse = {
  reference: string;
  text: string;
  translation: string;
};

export type VerseTopic = {
  slug: string;
  title: string;
  /** Short label for nav chips */
  label: string;
  description: string;
  metaDescription: string;
  intro: string;
  verses: CuratedVerse[];
  relatedGuide?: string;
};

export const VERSE_TOPICS: VerseTopic[] = [
  {
    slug: "anxiety",
    title: "Bible Verses for Anxiety",
    label: "Anxiety",
    description: "Scripture to calm a worried heart and cast cares on the Lord.",
    metaDescription:
      "Free list of Bible verses for anxiety and worry. Read Philippians 4, Psalm 94, and more — then save them in PrayNote.",
    intro:
      "When anxiety rises, Scripture invites you to bring every care to God in prayer. These verses are a starting place for quiet trust — not a substitute for wise counsel or medical care when you need it.",
    relatedGuide: "/guides/bible-verses-for-anxiety",
    verses: [
      {
        reference: "Philippians 4:6-7",
        text: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God. And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
        translation: "KJV",
      },
      {
        reference: "1 Peter 5:7",
        text: "Casting all your care upon him; for he careth for you.",
        translation: "KJV",
      },
      {
        reference: "Psalm 94:19",
        text: "In the multitude of my thoughts within me thy comforts delight my soul.",
        translation: "KJV",
      },
      {
        reference: "Isaiah 41:10",
        text: "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.",
        translation: "KJV",
      },
      {
        reference: "Matthew 6:34",
        text: "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.",
        translation: "KJV",
      },
      {
        reference: "John 14:27",
        text: "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "worry",
    title: "Bible Verses for Worry",
    label: "Worry",
    description: "Verses that call you to trust God instead of tomorrow’s unknowns.",
    metaDescription:
      "Bible verses for worry and overthinking. Free Scripture list from PrayNote — Matthew 6, Psalm 55, and more.",
    intro:
      "Worry often rehearses the future without God. These passages recenter your mind on the Father who knows what you need.",
    verses: [
      {
        reference: "Matthew 6:25-26",
        text: "Therefore I say unto you, Take no thought for your life, what ye shall eat, or what ye shall drink; nor yet for your body, what ye shall put on. Is not the life more than meat, and the body than raiment? Behold the fowls of the air: for they sow not, neither do they reap, nor gather into barns; yet your heavenly Father feedeth them. Are ye not much better than they?",
        translation: "KJV",
      },
      {
        reference: "Psalm 55:22",
        text: "Cast thy burden upon the Lord, and he shall sustain thee: he shall never suffer the righteous to be moved.",
        translation: "KJV",
      },
      {
        reference: "Proverbs 3:5-6",
        text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
        translation: "KJV",
      },
      {
        reference: "Psalm 56:3",
        text: "What time I am afraid, I will trust in thee.",
        translation: "KJV",
      },
      {
        reference: "Luke 12:25-26",
        text: "And which of you with taking thought can add to his stature one cubit? If ye then be not able to do that thing which is least, why take ye thought for the rest?",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "healing",
    title: "Bible Verses for Healing",
    label: "Healing",
    description: "Scripture for body, mind, and soul when you need restoration.",
    metaDescription:
      "Bible verses for healing and restoration. Free curated Scripture — Psalm 103, James 5, Jeremiah 17, and more.",
    intro:
      "God is the healer of His people. These verses encourage prayer for healing while we also seek wise medical help and the care of the church.",
    verses: [
      {
        reference: "Psalm 103:2-3",
        text: "Bless the Lord, O my soul, and forget not all his benefits: Who forgiveth all thine iniquities; who healeth all thy diseases.",
        translation: "KJV",
      },
      {
        reference: "James 5:14-15",
        text: "Is any sick among you? let him call for the elders of the church; and let them pray over him, anointing him with oil in the name of the Lord: And the prayer of faith shall save the sick, and the Lord shall raise him up; and if he have committed sins, they shall be forgiven him.",
        translation: "KJV",
      },
      {
        reference: "Jeremiah 17:14",
        text: "Heal me, O Lord, and I shall be healed; save me, and I shall be saved: for thou art my praise.",
        translation: "KJV",
      },
      {
        reference: "Psalm 147:3",
        text: "He healeth the broken in heart, and bindeth up their wounds.",
        translation: "KJV",
      },
      {
        reference: "3 John 1:2",
        text: "Beloved, I wish above all things that thou mayest prosper and be in health, even as thy soul prospereth.",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "strength",
    title: "Bible Verses for Strength",
    label: "Strength",
    description: "Passages that remind you the Lord’s strength is made perfect in weakness.",
    metaDescription:
      "Bible verses for strength and endurance. Free list — Isaiah 40, Philippians 4:13, Psalm 28, and more from PrayNote.",
    intro:
      "Christian strength is not self-reliance. It is dependence on Christ who upholds the weary and renews those who wait on Him.",
    verses: [
      {
        reference: "Isaiah 40:31",
        text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
        translation: "KJV",
      },
      {
        reference: "Philippians 4:13",
        text: "I can do all things through Christ which strengtheneth me.",
        translation: "KJV",
      },
      {
        reference: "Psalm 28:7",
        text: "The Lord is my strength and my shield; my heart trusted in him, and I am helped: therefore my heart greatly rejoiceth; and with my song will I praise him.",
        translation: "KJV",
      },
      {
        reference: "2 Corinthians 12:9",
        text: "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.",
        translation: "KJV",
      },
      {
        reference: "Ephesians 6:10",
        text: "Finally, my brethren, be strong in the Lord, and in the power of his might.",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "peace",
    title: "Bible Verses for Peace",
    label: "Peace",
    description: "Verses about the peace of God that guards heart and mind.",
    metaDescription:
      "Bible verses for peace of mind. Free Scripture — John 14:27, Isaiah 26:3, Colossians 3:15, and more.",
    intro:
      "Biblical peace is more than the absence of conflict. It is wholeness and rest in Christ, even when circumstances are hard.",
    verses: [
      {
        reference: "Isaiah 26:3",
        text: "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.",
        translation: "KJV",
      },
      {
        reference: "John 16:33",
        text: "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.",
        translation: "KJV",
      },
      {
        reference: "Colossians 3:15",
        text: "And let the peace of God rule in your hearts, to the which also ye are called in one body; and be ye thankful.",
        translation: "KJV",
      },
      {
        reference: "Romans 15:13",
        text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
        translation: "KJV",
      },
      {
        reference: "Numbers 6:24-26",
        text: "The Lord bless thee, and keep thee: The Lord make his face shine upon thee, and be gracious unto thee: The Lord lift up his countenance upon thee, and give thee peace.",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "hope",
    title: "Bible Verses for Hope",
    label: "Hope",
    description: "Scripture that lifts your eyes to God’s faithful promises.",
    metaDescription:
      "Bible verses for hope in hard seasons. Free curated list — Romans 15:13, Lamentations 3, Hebrews 6, and more.",
    intro:
      "Biblical hope is confident expectation in God, not wishful thinking. These verses steady the soul when the path feels dark.",
    verses: [
      {
        reference: "Romans 15:13",
        text: "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.",
        translation: "KJV",
      },
      {
        reference: "Lamentations 3:22-23",
        text: "It is of the Lord's mercies that we are not consumed, because his compassions fail not. They are new every morning: great is thy faithfulness.",
        translation: "KJV",
      },
      {
        reference: "Hebrews 6:19",
        text: "Which hope we have as an anchor of the soul, both sure and stedfast, and which entereth into that within the veil.",
        translation: "KJV",
      },
      {
        reference: "Psalm 42:11",
        text: "Why art thou cast down, O my soul? and why art thou disquieted within me? hope thou in God: for I shall yet praise him, who is the health of my countenance, and my God.",
        translation: "KJV",
      },
      {
        reference: "Jeremiah 29:11",
        text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "gratitude",
    title: "Bible Verses for Gratitude",
    label: "Gratitude",
    description: "Passages that teach thanksgiving in every season.",
    metaDescription:
      "Bible verses for gratitude and thanksgiving. Free list — 1 Thessalonians 5:18, Psalm 100, Colossians 3:17.",
    intro:
      "Gratitude turns prayer outward to praise. These verses help you practice thanksgiving as a daily habit before God.",
    verses: [
      {
        reference: "1 Thessalonians 5:16-18",
        text: "Rejoice evermore. Pray without ceasing. In every thing give thanks: for this is the will of God in Christ Jesus concerning you.",
        translation: "KJV",
      },
      {
        reference: "Psalm 100:4",
        text: "Enter into his gates with thanksgiving, and into his courts with praise: be thankful unto him, and bless his name.",
        translation: "KJV",
      },
      {
        reference: "Colossians 3:17",
        text: "And whatsoever ye do in word or deed, do all in the name of the Lord Jesus, giving thanks to God and the Father by him.",
        translation: "KJV",
      },
      {
        reference: "Psalm 136:1",
        text: "O give thanks unto the Lord; for he is good: for his mercy endureth for ever.",
        translation: "KJV",
      },
      {
        reference: "Ephesians 5:20",
        text: "Giving thanks always for all things unto God and the Father in the name of our Lord Jesus Christ.",
        translation: "KJV",
      },
    ],
  },
  {
    slug: "forgiveness",
    title: "Bible Verses for Forgiveness",
    label: "Forgiveness",
    description: "Scripture on receiving God’s mercy and forgiving others.",
    metaDescription:
      "Bible verses for forgiveness. Free Scripture list — 1 John 1:9, Ephesians 4:32, Matthew 6:14, and more.",
    intro:
      "The gospel begins with forgiveness in Christ. These verses help you receive mercy and extend it to others.",
    verses: [
      {
        reference: "1 John 1:9",
        text: "If we confess our sins, he is faithful and just to forgive us our sins, and to cleanse us from all unrighteousness.",
        translation: "KJV",
      },
      {
        reference: "Ephesians 4:32",
        text: "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.",
        translation: "KJV",
      },
      {
        reference: "Matthew 6:14-15",
        text: "For if ye forgive men their trespasses, your heavenly Father will also forgive you: But if ye forgive not men their trespasses, neither will your Father forgive your trespasses.",
        translation: "KJV",
      },
      {
        reference: "Colossians 3:13",
        text: "Forbearing one another, and forgiving one another, if any man have a quarrel against any: even as Christ forgave you, so also do ye.",
        translation: "KJV",
      },
      {
        reference: "Psalm 103:12",
        text: "As far as the east is from the west, so far hath he removed our transgressions from us.",
        translation: "KJV",
      },
    ],
  },
];

export function getTopicBySlug(slug: string): VerseTopic | undefined {
  return VERSE_TOPICS.find((t) => t.slug === slug);
}

export function getAllTopicSlugs(): string[] {
  return VERSE_TOPICS.map((t) => t.slug);
}

/** Flat pool for random verse tool */
export function getAllCuratedVerses(): CuratedVerse[] {
  const seen = new Set<string>();
  const out: CuratedVerse[] = [];
  for (const topic of VERSE_TOPICS) {
    for (const v of topic.verses) {
      const key = `${v.reference}|${v.translation}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(v);
    }
  }
  return out;
}
