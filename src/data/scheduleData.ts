export interface TimeBlock {
  label: string;
  time: string;
  description: string;
}

export interface Resource {
  name: string;
  contact: string;
  url?: string;
}

export interface ExtraCTA {
  label: string;
  url: string;
}

export interface DayData {
  name: string;
  slug: string;
  emoji: string;
  theme: string;
  description: string;
  heroTitle: string;
  tagline: string;
  timeBlocks: TimeBlock[];
  todaysFocus: string;
  resources: Resource[];
  extraCTA?: ExtraCTA;
}

export const scheduleData: Record<string, DayData> = {
  sunday: {
    name: "Sunday",
    slug: "sunday",
    emoji: "🕊️",
    theme: "Gospel Sunday",
    description: "Faith, healing, and church spotlights — streaming worldwide",
    heroTitle: "Gospel Sunday — Rooted in Growth, Guided by Hope",
    tagline: "Where faith, healing, and community meet through gospel music and church spotlights.",
    timeBlocks: [
      { label: "Morning Praise", time: "8am–9am", description: "Traditional gospel hymns and Sunday morning worship" },
      { label: "Contemporary Gospel", time: "9am–10am", description: "Modern gospel hits and worship anthems" },
      { label: "Church Spotlight Hour", time: "10am–12pm", description: "Featuring local churches with ministry highlights" },
      { label: "Sunday Soul", time: "12pm–2pm", description: "Gospel jazz fusion and peaceful Sunday rest" },
    ],
    todaysFocus: "Rooted in Growth, Guided by Hope",
    resources: [],
    extraCTA: {
      label: "⛪ Feature Your Church FREE",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSe9fzcW5cJRshz47P-W0ZLdNeH1kZzxCeN-HshbEuJghrgIYQ/viewform?usp=dialog",
    },
  },
  monday: {
    name: "Monday",
    slug: "monday",
    emoji: "🌿",
    theme: "Mindful Monday",
    description: "Start your week with intention, calm, and clarity",
    heroTitle: "Mindful Monday — Start the Week With Intention",
    tagline: "Therapy-inspired conversations and smooth jazz to ease you into your week | 6:00 AM–10:00 PM",
    timeBlocks: [
      { label: "Morning", time: "6–10am", description: "Morning mindfulness & intention setting" },
      { label: "Midday", time: "10am–2pm", description: "Mental wellness conversations" },
      { label: "Afternoon", time: "2–6pm", description: "Stress management & work-life balance" },
      { label: "Evening", time: "6–10pm", description: "Evening wind-down & reflection" },
    ],
    todaysFocus: "Setting the Tone for Your Week",
    resources: [
      { name: "Headspace", contact: "headspace.com", url: "https://headspace.com" },
      { name: "Calm", contact: "calm.com", url: "https://calm.com" },
      { name: "BetterHelp", contact: "betterhelp.com", url: "https://betterhelp.com" },
      { name: "Crisis Text", contact: "741741" },
    ],
  },
  tuesday: {
    name: "Tuesday",
    slug: "tuesday",
    emoji: "🌿",
    theme: "Healing Tuesday",
    description: "Begin your journey from surviving to thriving",
    heroTitle: "Healing Tuesday — Begin Your Journey to Wholeness",
    tagline: "Conversations about emotional healing, trauma recovery, and restoration | 6:00 AM–10:00 PM",
    timeBlocks: [
      { label: "Morning", time: "6–10am", description: "Starting fresh after trauma | Morning mindfulness | Self-compassion practices" },
      { label: "Midday", time: "10am–2pm", description: "Processing grief & loss | Understanding PTSD | Finding support systems" },
      { label: "Afternoon", time: "2–6pm", description: "Building resilience | Reclaiming your story | Healthy boundaries" },
      { label: "Evening", time: "6–10pm", description: "Rest & restoration | Letting go | Peaceful reflection" },
    ],
    todaysFocus: "From Surviving to Thriving",
    resources: [
      { name: "National Suicide Prevention", contact: "988" },
      { name: "Crisis Text", contact: "741741" },
      { name: "SAMHSA", contact: "1-800-662-4357" },
      { name: "Psychology Today", contact: "psychologytoday.com", url: "https://psychologytoday.com" },
      { name: "BetterHelp", contact: "betterhelp.com", url: "https://betterhelp.com" },
    ],
  },
  wednesday: {
    name: "Wednesday",
    slug: "wednesday",
    emoji: "💞",
    theme: "Connection Wednesday",
    description: "Building bridges, deepening bonds, and real community",
    heroTitle: "Connection Wednesday — Building Bridges, Deepening Bonds",
    tagline: "Conversations about relationships, authentic connection, and meaningful community | 6:00 AM–10:00 PM",
    timeBlocks: [
      { label: "Morning", time: "6–10am", description: "Starting conversations | Active listening | Emotional availability" },
      { label: "Midday", time: "10am–2pm", description: "Healthy communication | Conflict resolution | Rebuilding trust" },
      { label: "Afternoon", time: "2–6pm", description: "Finding your people | Building support | Loneliness & belonging" },
      { label: "Evening", time: "6–10pm", description: "Connecting with yourself | Self-love | Peaceful reflection" },
    ],
    todaysFocus: "The Art of Being Present",
    resources: [
      { name: "Domestic Violence Hotline", contact: "1-800-799-7233" },
      { name: "Love Is Respect", contact: "22522" },
      { name: "Gottman Institute", contact: "gottman.com", url: "https://gottman.com" },
      { name: "Meetup", contact: "meetup.com", url: "https://meetup.com" },
    ],
  },
  thursday: {
    name: "Thursday",
    slug: "thursday",
    emoji: "🎯",
    theme: "Purpose Thursday",
    description: "Discover your calling and walk boldly in purpose",
    heroTitle: "Purpose Thursday — Discover Your Calling, Walk in Purpose",
    tagline: "Conversations about meaning, calling, career, and living with intention | 6:00 AM–10:00 PM",
    timeBlocks: [
      { label: "Morning", time: "6–10am", description: "Discovering gifts | Clarifying values | Vision casting" },
      { label: "Midday", time: "10am–2pm", description: "Career transitions | Work-life integration | Entrepreneurship" },
      { label: "Afternoon", time: "2–6pm", description: "Goal setting | Overcoming obstacles | Taking bold steps" },
      { label: "Evening", time: "6–10pm", description: "Living with intention | Building legacy | Impact & influence" },
    ],
    todaysFocus: "From Passion to Paycheck",
    resources: [
      { name: "The Muse", contact: "themuse.com", url: "https://themuse.com" },
      { name: "LinkedIn Learning", contact: "linkedin.com/learning", url: "https://linkedin.com/learning" },
      { name: "SCORE Free Mentorship", contact: "score.org", url: "https://score.org" },
      { name: "Coursera", contact: "coursera.org", url: "https://coursera.org" },
      { name: "Udemy", contact: "udemy.com", url: "https://udemy.com" },
    ],
  },
  friday: {
    name: "Friday",
    slug: "friday",
    emoji: "🕊️",
    theme: "Freedom Friday",
    description: "Celebrate liberation, breakthroughs, and new beginnings",
    heroTitle: "Freedom Friday — Celebrate Liberation & New Beginnings",
    tagline: "Conversations about breakthrough, breaking free, and stepping into your best life | 6:00 AM–10:00 PM",
    timeBlocks: [
      { label: "Morning", time: "6–10am", description: "Breaking free | Letting go of shame | Fresh starts" },
      { label: "Midday", time: "10am–2pm", description: "Overcoming addiction | Leaving toxicity | Financial freedom" },
      { label: "Afternoon", time: "2–6pm", description: "Victory stories | Celebrating wins | Living authentically" },
      { label: "Evening", time: "6–10pm", description: "Gratitude for freedom | Weekend intentions | Looking ahead with hope" },
    ],
    todaysFocus: "Breaking the Chains",
    resources: [
      { name: "SAMHSA", contact: "1-800-662-4357" },
      { name: "AA", contact: "aa.org", url: "https://aa.org" },
      { name: "Dave Ramsey", contact: "daveramsey.com", url: "https://daveramsey.com" },
      { name: "Crisis Text", contact: "741741" },
      { name: "BetterHelp", contact: "betterhelp.com", url: "https://betterhelp.com" },
    ],
  },
  saturday: {
    name: "Saturday",
    slug: "saturday",
    emoji: "✨",
    theme: "Soul Saturday",
    description: "Rest, restore, and reconnect with your soul",
    heroTitle: "Soul Saturday — Rest, Restore, Reconnect",
    tagline: "Conversations about self-care, spirituality, and soul restoration | 6:00 AM–10:00 PM",
    timeBlocks: [
      { label: "Morning", time: "6–10am", description: "Morning meditation | Gratitude practices | Stillness & silence" },
      { label: "Midday", time: "10am–2pm", description: "Rest & restoration | Self-compassion | Creative expression" },
      { label: "Afternoon", time: "2–6pm", description: "Exploring spirituality | Mindfulness practices | Inner peace" },
      { label: "Evening", time: "6–10pm", description: "Weekly reflection | Releasing the week | Deep rest" },
    ],
    todaysFocus: "The Sacred Art of Rest",
    resources: [
      { name: "Calm", contact: "calm.com", url: "https://calm.com" },
      { name: "Pray.com", contact: "pray.com", url: "https://pray.com" },
      { name: "Bible Gateway", contact: "biblegateway.com", url: "https://biblegateway.com" },
      { name: "Sanvello", contact: "sanvello.com", url: "https://sanvello.com" },
      { name: "Finch", contact: "finch.com", url: "https://finch.com" },
    ],
  },
};

const dayIndexMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function getCurrentDaySlug(): string {
  return dayIndexMap[new Date().getDay()];
}

export function isValidDay(slug: string): boolean {
  return slug in scheduleData;
}
