// Sample content so the catalogue is not empty while you build and test.
// Every lesson points at one of the clips below. They are short public test videos hosted by
// W3C, Video.js, MDN and W3Schools, so they play straight in a <video> tag.
// Durations are the clip lengths, so progress percentages stay accurate.
// Run `npm run db:check-videos` to confirm they are reachable from your network.
export const clips = {
  sintel: { url: 'https://media.w3.org/2010/05/sintel/trailer.mp4', seconds: 52 },
  oceans: { url: 'https://vjs.zencdn.net/v/oceans.mp4', seconds: 46 },
  rabbit: { url: 'https://www.w3schools.com/html/mov_bbb.mp4', seconds: 10 },
  bear: { url: 'https://www.w3schools.com/html/movie.mp4', seconds: 12 },
  flower: { url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', seconds: 5 },
};

type Clip = keyof typeof clips;

const lesson = (title: string, description: string, clip: Clip) => ({
  title,
  description,
  videoUrl: clips[clip].url,
  durationSeconds: clips[clip].seconds,
});

const thumb = (seed: string) => `https://picsum.photos/seed/${seed}/640/360`;

export const sampleCourses = [
  {
    title: 'Modern React from Scratch',
    slug: 'modern-react-from-scratch',
    category: 'Web Development',
    description: 'Learn components, hooks and state by building a real app step by step.',
    thumbnailUrl: thumb('react'),
    lessons: [
      lesson('Why React?', 'What problem React solves and how it thinks about UIs.', 'rabbit'),
      lesson('Your first component', 'Write, compose and reuse components.', 'bear'),
      lesson('State and events', 'Make the page react to what the user does.', 'oceans'),
      lesson('Building the full app', 'Put everything together in one project.', 'sintel'),
    ],
  },
  {
    title: 'TypeScript for Busy Developers',
    slug: 'typescript-for-busy-developers',
    category: 'Web Development',
    description: 'The parts of TypeScript you will use every day, without the theory overload.',
    thumbnailUrl: thumb('typescript'),
    lessons: [
      lesson('Types in five minutes', 'Strings, numbers, arrays and objects.', 'bear'),
      lesson('Interfaces and generics', 'Describe your data and reuse your code.', 'sintel'),
      lesson('Typing an API client', 'Safe calls to a backend.', 'oceans'),
    ],
  },
  {
    title: 'Product Design Basics',
    slug: 'product-design-basics',
    category: 'Design',
    description: 'Layout, colour and typography for people who are not designers.',
    thumbnailUrl: thumb('design'),
    lessons: [
      lesson('Layout and spacing', 'Why good spacing makes everything look better.', 'flower'),
      lesson('Colour that works', 'Pick a simple palette and stick to it.', 'sintel'),
    ],
  },
  {
    title: 'Next.js App Router Essentials',
    slug: 'nextjs-app-router-essentials',
    category: 'Web Development',
    description: 'Routing, layouts, data fetching and server components in the modern Next.js.',
    thumbnailUrl: thumb('nextjs'),
    lessons: [
      lesson('Files become routes', 'How folders map to pages and layouts.', 'oceans'),
      lesson('Server and client components', 'Pick the right one and know why.', 'rabbit'),
      lesson('Fetching and caching data', 'Load data close to where it is used.', 'sintel'),
    ],
  },
  {
    title: 'Tailwind CSS in a Weekend',
    slug: 'tailwind-css-in-a-weekend',
    category: 'Web Development',
    description: 'Build clean responsive layouts with utility classes and a small design system.',
    thumbnailUrl: thumb('tailwind'),
    lessons: [
      lesson('Utility classes that matter', 'The twenty classes you will use every day.', 'flower'),
      lesson('Responsive layouts', 'Mobile first with breakpoints.', 'bear'),
      lesson('Theming with tokens', 'One palette, reused everywhere.', 'rabbit'),
    ],
  },
  {
    title: 'Node.js and Express APIs',
    slug: 'nodejs-and-express-apis',
    category: 'Backend',
    description: 'Design and build a REST API with routing, validation and error handling.',
    thumbnailUrl: thumb('express'),
    lessons: [
      lesson('Your first server', 'Routes, requests and responses.', 'bear'),
      lesson('Validating input', 'Reject bad data before it reaches your logic.', 'oceans'),
      lesson('Errors that make sense', 'Consistent error responses for the client.', 'rabbit'),
      lesson('Shipping the API', 'Environment variables and production basics.', 'sintel'),
    ],
  },
  {
    title: 'PostgreSQL and Prisma',
    slug: 'postgresql-and-prisma',
    category: 'Backend',
    description: 'Model your data, write migrations and query it safely with Prisma.',
    thumbnailUrl: thumb('postgres'),
    lessons: [
      lesson('Designing tables', 'Entities, relations and constraints.', 'sintel'),
      lesson('Migrations', 'Change your schema without losing data.', 'rabbit'),
      lesson('Querying with Prisma', 'Filters, includes and transactions.', 'oceans'),
    ],
  },
  {
    title: 'Authentication Done Right',
    slug: 'authentication-done-right',
    category: 'Backend',
    description: 'Passwords, sessions, tokens and cookies without the common mistakes.',
    thumbnailUrl: thumb('auth'),
    lessons: [
      lesson('Hashing passwords', 'Why bcrypt and how to use it.', 'flower'),
      lesson('Access and refresh tokens', 'Short lived access, rotating refresh.', 'sintel'),
      lesson('Protecting routes', 'Roles and permissions on the server.', 'bear'),
    ],
  },
  {
    title: 'UI Design Fundamentals',
    slug: 'ui-design-fundamentals',
    category: 'Design',
    description: 'Hierarchy, contrast and consistency for interfaces people enjoy using.',
    thumbnailUrl: thumb('ui'),
    lessons: [
      lesson('Visual hierarchy', 'Guide the eye to what matters.', 'oceans'),
      lesson('Typography that reads', 'Pairing, scale and line height.', 'bear'),
      lesson('Designing states', 'Empty, loading, error and success.', 'rabbit'),
    ],
  },
  {
    title: 'Figma for Developers',
    slug: 'figma-for-developers',
    category: 'Design',
    description: 'Read designs, inspect spacing and hand off cleanly without a designer in the room.',
    thumbnailUrl: thumb('figma'),
    lessons: [
      lesson('Finding your way around', 'Frames, layers and the inspector.', 'flower'),
      lesson('Auto layout', 'How Figma layouts map to flexbox.', 'sintel'),
    ],
  },
  {
    title: 'Data Analysis with Python',
    slug: 'data-analysis-with-python',
    category: 'Data Science',
    description: 'Clean, explore and summarise real datasets with pandas.',
    thumbnailUrl: thumb('pandas'),
    lessons: [
      lesson('Loading your data', 'CSV files, DataFrames and first looks.', 'rabbit'),
      lesson('Cleaning and reshaping', 'Missing values, types and joins.', 'oceans'),
      lesson('Asking questions', 'Group, aggregate and compare.', 'bear'),
    ],
  },
  {
    title: 'SQL for Analysts',
    slug: 'sql-for-analysts',
    category: 'Data Science',
    description: 'Write the queries that answer real business questions.',
    thumbnailUrl: thumb('sql'),
    lessons: [
      lesson('SELECT and WHERE', 'Filter and sort your first results.', 'bear'),
      lesson('Joins explained', 'Combine tables without duplicating rows.', 'sintel'),
      lesson('Aggregations', 'COUNT, SUM and GROUP BY in practice.', 'flower'),
    ],
  },
  {
    title: 'React Native Quickstart',
    slug: 'react-native-quickstart',
    category: 'Mobile',
    description: 'Build and run your first cross-platform mobile app with Expo.',
    thumbnailUrl: thumb('native'),
    lessons: [
      lesson('Setting up Expo', 'Run the app on your own phone.', 'oceans'),
      lesson('Core components', 'View, Text, Image and lists.', 'rabbit'),
      lesson('Navigation', 'Move between screens.', 'bear'),
    ],
  },
  {
    title: 'Docker for Beginners',
    slug: 'docker-for-beginners',
    category: 'DevOps',
    description: 'Package an app into a container and run it anywhere.',
    thumbnailUrl: thumb('docker'),
    lessons: [
      lesson('Images and containers', 'What they are and how they differ.', 'sintel'),
      lesson('Writing a Dockerfile', 'Build a small production image.', 'bear'),
      lesson('Docker Compose', 'Run an app and its database together.', 'oceans'),
    ],
  },
  {
    title: 'CI/CD with GitHub Actions',
    slug: 'cicd-with-github-actions',
    category: 'DevOps',
    description: 'Test and deploy automatically on every push.',
    thumbnailUrl: thumb('actions'),
    lessons: [
      lesson('Your first workflow', 'Run tests on every pull request.', 'rabbit'),
      lesson('Deploying on merge', 'Ship to production from main.', 'flower'),
    ],
  },
];