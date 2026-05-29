export const DEMO_IMG = "https://static.zingdelights.com/4.png";

export interface Verse {
  id: string;
  number: number;
  sanskrit: string;
  transliteration: string;
  translation: string;
  commentary: string;
  words: { word: string; meaning: string }[];
}

export interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  verses: number;
  summary: string;
  progress: number;
}

export const chapters: Chapter[] = [
  {
    id: 1,
    title: "Arjuna Vishada Yoga",
    subtitle: "The Yoga of Arjuna's Despair",
    verses: 47,
    summary: "Arjuna sees his kinsmen on the battlefield and is overcome with sorrow.",
    progress: 0.6,
  },
  {
    id: 2,
    title: "Sankhya Yoga",
    subtitle: "The Yoga of Knowledge",
    verses: 72,
    summary: "Krishna begins the great teaching on the eternal soul and steady wisdom.",
    progress: 0.4,
  },
  {
    id: 3,
    title: "Karma Yoga",
    subtitle: "The Yoga of Action",
    verses: 43,
    summary: "Selfless action as the path to liberation and inner freedom.",
    progress: 0.2,
  },
  {
    id: 4,
    title: "Jnana Karma Sanyasa Yoga",
    subtitle: "Transcendental Knowledge",
    verses: 42,
    summary: "The divine descent and the supreme science of action.",
    progress: 0,
  },
  {
    id: 5,
    title: "Karma Sanyasa Yoga",
    subtitle: "The Yoga of Renunciation",
    verses: 29,
    summary: "Renunciation and action are one for the wise.",
    progress: 0,
  },
  {
    id: 6,
    title: "Dhyana Yoga",
    subtitle: "The Yoga of Meditation",
    verses: 47,
    summary: "The art of inner stillness and meditation.",
    progress: 0,
  },
  {
    id: 7,
    title: "Jnana Vijnana Yoga",
    subtitle: "Knowledge & Wisdom",
    verses: 30,
    summary: "Knowing the Divine with understanding and devotion.",
    progress: 0,
  },
  {
    id: 8,
    title: "Akshara Brahma Yoga",
    subtitle: "The Imperishable Brahman",
    verses: 28,
    summary: "Meditation on the eternal at the time of departure.",
    progress: 0,
  },
  {
    id: 9,
    title: "Raja Vidya Yoga",
    subtitle: "The Royal Knowledge",
    verses: 34,
    summary: "The most confidential knowledge of devotion.",
    progress: 0,
  },
  {
    id: 10,
    title: "Vibhuti Yoga",
    subtitle: "The Divine Glories",
    verses: 42,
    summary: "Krishna reveals His infinite manifestations.",
    progress: 0,
  },
  {
    id: 11,
    title: "Vishvarupa Darshana",
    subtitle: "The Universal Form",
    verses: 55,
    summary: "Arjuna beholds the cosmic form of the Lord.",
    progress: 0,
  },
  {
    id: 12,
    title: "Bhakti Yoga",
    subtitle: "The Yoga of Devotion",
    verses: 20,
    summary: "The path of loving devotion to the Supreme.",
    progress: 0,
  },
  {
    id: 13,
    title: "Kshetra Kshetrajna Vibhaga",
    subtitle: "Field & Knower of the Field",
    verses: 35,
    summary: "Distinguishing the body from the soul within.",
    progress: 0,
  },
  {
    id: 14,
    title: "Gunatraya Vibhaga Yoga",
    subtitle: "The Three Gunas",
    verses: 27,
    summary: "The three modes of material nature.",
    progress: 0,
  },
  {
    id: 15,
    title: "Purushottama Yoga",
    subtitle: "The Supreme Person",
    verses: 20,
    summary: "The eternal tree and the Supreme Being beyond.",
    progress: 0,
  },
  {
    id: 16,
    title: "Daivasura Sampad Vibhaga",
    subtitle: "Divine & Demoniac Natures",
    verses: 24,
    summary: "Qualities that liberate and those that bind.",
    progress: 0,
  },
  {
    id: 17,
    title: "Shraddhatraya Vibhaga",
    subtitle: "The Three Kinds of Faith",
    verses: 28,
    summary: "Faith, food, sacrifice and austerity in three modes.",
    progress: 0,
  },
  {
    id: 18,
    title: "Moksha Sanyasa Yoga",
    subtitle: "The Yoga of Liberation",
    verses: 78,
    summary: "The final conclusion: surrender and freedom.",
    progress: 0,
  },
];

export const sampleVerses: Verse[] = [
  {
    id: "2.47",
    number: 47,
    sanskrit: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥",
    transliteration:
      "karmaṇy-evādhikāras te mā phaleṣu kadācana\nmā karma-phala-hetur bhūr mā te saṅgo 'stv akarmaṇi",
    translation:
      "You have the right to perform your prescribed duty, but you are not entitled to the fruits of action. Never consider yourself the cause of the results of your activities, and never be attached to not doing your duty.",
    commentary:
      "This is perhaps the most quoted verse of the Gita. Krishna teaches Arjuna the foundation of Karma Yoga — act with full dedication, but release attachment to the outcome. Freedom comes not from avoiding action, but from acting without selfish desire.",
    words: [
      { word: "karmaṇi", meaning: "in prescribed duties" },
      { word: "eva", meaning: "certainly" },
      { word: "adhikāraḥ", meaning: "right" },
      { word: "te", meaning: "of you" },
      { word: "mā", meaning: "never" },
      { word: "phaleṣu", meaning: "in the fruits" },
      { word: "kadācana", meaning: "at any time" },
      { word: "saṅgaḥ", meaning: "attachment" },
    ],
  },
  {
    id: "2.48",
    number: 48,
    sanskrit:
      "योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥",
    transliteration:
      "yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga ucyate",
    translation:
      "Perform your duty equipoised, O Arjuna, abandoning all attachment to success or failure. Such equanimity is called yoga.",
    commentary:
      "Yoga, Krishna says, is evenness of mind — the inner balance that remains steady through gain and loss alike.",
    words: [
      { word: "yoga-sthaḥ", meaning: "steadfast in yoga" },
      { word: "kuru", meaning: "perform" },
      { word: "samatvaṁ", meaning: "equanimity" },
      { word: "yoga", meaning: "yoga" },
    ],
  },
  {
    id: "2.49",
    number: 49,
    sanskrit: "दूरेण ह्यवरं कर्म बुद्धियोगाद्धनञ्जय।\nबुद्धौ शरणमन्विच्छ कृपणाः फलहेतवः॥",
    transliteration:
      "dūreṇa hy avaraṁ karma buddhi-yogād dhanañjaya\nbuddhau śaraṇam anviccha kṛpaṇāḥ phala-hetavaḥ",
    translation:
      "Far inferior is mere action to action performed with wisdom. Seek refuge in wisdom; pitiful are those motivated by results.",
    commentary:
      "Wisdom transforms ordinary work into a spiritual practice. Acting from clarity rather than craving brings freedom.",
    words: [
      { word: "buddhi-yogāt", meaning: "with wisdom" },
      { word: "śaraṇam", meaning: "refuge" },
      { word: "kṛpaṇāḥ", meaning: "misers" },
    ],
  },
];

export const wisdomQuotes = [
  {
    id: "w1",
    text: "When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place.",
    ref: "Gita 6.19",
  },
  {
    id: "w2",
    text: "The soul is neither born, nor does it die. It is eternal, ever-existing and primeval.",
    ref: "Gita 2.20",
  },
  { id: "w3", text: "Whatever you do, make it an offering to me.", ref: "Gita 9.27" },
  {
    id: "w4",
    text: "A person can rise through the efforts of his own mind; or draw himself down, in the same manner.",
    ref: "Gita 6.5",
  },
];

export const wisdomThemes = [
  { id: "t1", title: "On Duty", count: 24, color: "from-amber-200 to-orange-200" },
  { id: "t2", title: "On Detachment", count: 18, color: "from-rose-200 to-amber-200" },
  { id: "t3", title: "On Devotion", count: 31, color: "from-yellow-200 to-rose-200" },
  { id: "t4", title: "On Meditation", count: 16, color: "from-orange-200 to-yellow-200" },
  { id: "t5", title: "On The Soul", count: 22, color: "from-amber-100 to-orange-100" },
  { id: "t6", title: "On Liberation", count: 19, color: "from-yellow-100 to-amber-200" },
];

export const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "sa", name: "Sanskrit", native: "संस्कृतम्" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "mr", name: "Marathi", native: "मराठी" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી" },
];

export const bookmarks = [
  { verseId: "2.47", chapter: 2, note: "Foundation of karma yoga" },
  { verseId: "2.48", chapter: 2, note: "Equanimity = yoga" },
];

export const notes = [
  {
    id: "n1",
    verseId: "2.47",
    title: "On letting go",
    body: "Today I felt the meaning of doing without expecting. A quiet release.",
    date: "May 22",
  },
  {
    id: "n2",
    verseId: "6.19",
    title: "Steady flame",
    body: "The lamp metaphor — keep returning to the breath.",
    date: "May 18",
  },
];

export const history = [
  { id: "h1", chapter: 2, verse: 47, date: "Today" },
  { id: "h2", chapter: 2, verse: 48, date: "Today" },
  { id: "h3", chapter: 1, verse: 1, date: "Yesterday" },
  { id: "h4", chapter: 6, verse: 19, date: "3 days ago" },
];

export const downloads = [
  { id: "d1", title: "Chapter 2 — Audio", size: "12.4 MB", done: true },
  { id: "d2", title: "Chapter 3 — Audio", size: "9.1 MB", done: true },
  { id: "d3", title: "Chapter 6 — Audio", size: "11.8 MB", done: false, progress: 0.4 },
];

export const profile = {
  name: "Aarav Sharma",
  email: "aarav@easygita.app",
  streak: 14,
  versesRead: 142,
  bookmarks: 12,
  minutes: 320,
};
