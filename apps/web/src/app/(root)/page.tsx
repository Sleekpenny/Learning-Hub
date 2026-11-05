import { ApiStatus } from "@/components/api-status";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="text-4xl font-bold tracking-tight">LearnHub</h1>
      <p className="text-lg text-zinc-600">
        Web app is running. The course catalog arrives on Day 4.
      </p>
      <ApiStatus />
    </main>
  );
}
