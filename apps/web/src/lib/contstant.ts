export const passwordRules = [
  { label: "At least 8 characters", test: (value: string) => value.length >= 8 },
  { label: "A lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { label: "An uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { label: "A number", test: (value: string) => /[0-9]/.test(value) },
];

export const interests = [
  { value: "Web Development", label: "Web Development" },
  { value: "Mobile Development", label: "Mobile Development" },
  { value: "Data and AI", label: "Data and AI" },
  { value: "Design", label: "Design" },
  { value: "Cloud and DevOps", label: "Cloud and DevOps" },
  { value: "Cybersecurity", label: "Cybersecurity" },
  { value: "Product and Business", label: "Product and Business" },
  { value: "Digital Marketing", label: "Digital Marketing" },
  { value: "Other", label: "Other" },
];

export const points = [
  "Every lesson is a focused video you can finish in one sitting",
  "Close the tab any time, your place in the video is saved",
  "Finished lessons are ticked off and each course shows how far you are",
];

export const lessons = [
  { title: "Getting started", status: "COMPLETED" as const },
  { title: "Building your first page", status: "IN_PROGRESS" as const },
  { title: "Styling with confidence", status: "NOT_STARTED" as const },
];

export const steps = [
  { title: "Create a free account", text: "Tell us your country and what you want to learn. It takes less than a minute." },
  { title: "Enroll in a course", text: "Browse the catalogue, open a course and press Enroll." },
  { title: "Watch and finish lessons", text: "Complete every lesson to finish the course. We remember where you stopped." },
];

export const gradients = [
  "from-accent-ai to-accent-primary",
  "from-accent-ai to-sky-500",
  "from-teal-500 to-accent-primary",
  "from-fuchsia-500 to-accent-ai",
  "from-accent-ai to-indigo-900",
];

export const courses = [
  { title: "Web Development", status: "IN_PROGRESS" as const, percent: 60, colors: "from-accent-ai to-accent-primary", offset: "" },
  { title: "Product Design", status: "NOT_STARTED" as const, percent: 0, colors: "from-accent-primary to-emerald-400", offset: "ml-6" },
  { title: "Data and AI", status: "COMPLETED" as const, percent: 100, colors: "from-amber-400 to-pink-500", offset: "" },
];