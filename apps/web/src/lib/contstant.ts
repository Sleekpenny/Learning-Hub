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