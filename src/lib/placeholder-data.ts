// src/lib/placeholder-data.ts

export const subjectsData = [
  {
    id: "subj-sci",
    name: "Integrated Science",
    icon: "🔬", // Emoji for visual flair
    description: "Explore the wonders of biology, chemistry, and physics.",
    topics: [
      { id: "sci-1", name: "The Cell", completed: true },
      { id: "sci-2", name: "Photosynthesis", completed: true },
      { id: "sci-3", name: "The Water Cycle", completed: false },
      { id: "sci-4", name: "Acids and Bases", completed: false },
      { id: "sci-5", name: "Newton's Laws of Motion", completed: false },
    ],
  },
  {
    id: "subj-math",
    name: "Mathematics",
    icon: "🧮",
    description: "Sharpen your problem-solving skills with algebra, geometry, and more.",
    topics: [
      { id: "math-1", name: "Algebraic Expressions", completed: true },
      { id: "math-2", name: "Pythagorean Theorem", completed: false },
      { id: "math-3", name: "Linear Equations", completed: false },
      { id: "math-4", name: "Circles", completed: false },
    ],
  },
  {
    id: "subj-eng",
    name: "English Language",
    icon: "📚",
    description: "Master grammar, comprehension, and literary analysis.",
    topics: [
      { id: "eng-1", name: "Parts of Speech", completed: true },
      { id: "eng-2", name: "Concord", completed: true },
      { id: "eng-3", name: "Literary Devices", completed: true },
      { id: "eng-4", name: "Essay Writing", completed: false },
    ],
  },
  {
    id: "subj-soc",
    name: "Social Studies",
    icon: "🌍",
    description: "Learn about Ghanaian history, governance, and our place in the world.",
    topics: [
        { id: "soc-1", name: "Our Environment", completed: false },
        { id: "soc-2", name: "Colonization and Independence", completed: false },
        { id: "soc-3", name: "The Constitution of Ghana", completed: false },
    ]
  },
];
export const studyCirclesData = [
  { id: "circle-1", name: "SHS 2 Science", memberCount: 45, unreadCount: 3 },
  { id: "circle-2", name: "WASSCE Math Prep", memberCount: 128, unreadCount: 12 },
  { id: "circle-3", name: "Literature Club", memberCount: 22, unreadCount: 0 },
  { id: "circle-4", name: "Debate Team", memberCount: 15, unreadCount: 1 },
];

export const feedPostsData = [
  {
    id: "post-1",
    author: {
      name: "Ama Serwaa",
      avatarUrl: "https://i.pravatar.cc/150?u=ama",
    },
    group: "SHS 2 Science",
    timestamp: "2h ago",
    content: "Hey everyone, I'm really struggling to understand the difference between mitosis and meiosis. Can anyone explain it in a simple way? The textbook is confusing me! 😥",
    stats: {
      likes: 12,
      comments: 5,
    },
  },
  {
    id: "post-2",
    author: {
      name: "Mr. David Asante (Teacher)",
      avatarUrl: "https://i.pravatar.cc/150?u=asante",
    },
    group: "WASSCE Math Prep",
    timestamp: "5h ago",
    content: "Quick tip for everyone preparing for the Core Maths paper: Don't forget to practice your vectors! It's a guaranteed topic. I've uploaded a new worksheet in the Resources section for this group. #WASSCE #Maths",
    stats: {
      likes: 45,
      comments: 18,
    },
  },
  {
    id: "post-3",
    author: {
      name: "Kofi Mensah",
      avatarUrl: "https://i.pravatar.cc/150?u=kofi",
    },
    group: "SHS 2 Science",
    timestamp: "1d ago",
    content: "I found this amazing YouTube video that explains photosynthesis with a really cool animation. It helped me a lot! Here's the link: [youtube.com/watch?v=...]",
    stats: {
      likes: 28,
      comments: 9,
    },
  },
];