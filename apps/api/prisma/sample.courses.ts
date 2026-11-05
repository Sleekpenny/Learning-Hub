// Sample content so the catalog is not empty while you build the frontend.
// The videos are public sample files. Replace them with your own from the admin page later.
const video = (name: string) => `https://storage.googleapis.com/gtv-videos-bucket/sample/${name}.mp4`;

export const sampleCourses = [
  {
    title: 'Modern React from Scratch',
    slug: 'modern-react-from-scratch',
    category: 'Web Development',
    description: 'Learn components, hooks and state by building a real app step by step.',
    thumbnailUrl: 'https://picsum.photos/seed/react/640/360',
    lessons: [
      { title: 'Why React?', description: 'What problem React solves and how it thinks about UIs.', videoUrl: video('ForBiggerBlazes'), durationSeconds: 15 },
      { title: 'Your first component', description: 'Write, compose and reuse components.', videoUrl: video('ForBiggerEscapes'), durationSeconds: 15 },
      { title: 'State and events', description: 'Make the page react to what the user does.', videoUrl: video('ForBiggerFun'), durationSeconds: 60 },
      { title: 'Building the full app', description: 'Put everything together in one project.', videoUrl: video('BigBuckBunny'), durationSeconds: 596 },
    ],
  },
  {
    title: 'TypeScript for Busy Developers',
    slug: 'typescript-for-busy-developers',
    category: 'Web Development',
    description: 'The parts of TypeScript you will use every day, without the theory overload.',
    thumbnailUrl: 'https://picsum.photos/seed/typescript/640/360',
    lessons: [
      { title: 'Types in five minutes', description: 'Strings, numbers, arrays and objects.', videoUrl: video('ForBiggerJoyrides'), durationSeconds: 15 },
      { title: 'Interfaces and generics', description: 'Describe your data and reuse your code.', videoUrl: video('ElephantsDream'), durationSeconds: 653 },
      { title: 'Typing an API client', description: 'Safe calls to a backend.', videoUrl: video('TearsOfSteel'), durationSeconds: 734 },
    ],
  },
  {
    title: 'Product Design Basics',
    slug: 'product-design-basics',
    category: 'Design',
    description: 'Layout, colour and typography for people who are not designers.',
    thumbnailUrl: 'https://picsum.photos/seed/design/640/360',
    lessons: [
      { title: 'Layout and spacing', description: 'Why good spacing makes everything look better.', videoUrl: video('ForBiggerMeltdowns'), durationSeconds: 15 },
      { title: 'Colour that works', description: 'Pick a simple palette and stick to it.', videoUrl: video('Sintel'), durationSeconds: 888 },
    ],
  },
];