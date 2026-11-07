import { AuthHeader } from "@/components/auth/auth-header";
import AuthIllustration from "@/components/auth/auth-illustration";

export const instant = false;

const Layout = async ({ children }: { children: React.ReactNode }) => {
  //const date =  new Date().getFullYear();
  return (
<div className="min-h-screen p-3 sm:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-accent-ai/10 via-white to-accent-primary/10 ring-1 ring-border sm:min-h-[calc(100vh-2.5rem)]">
        <AuthHeader />
        <main id="main" className="grid flex-1 items-center gap-12 px-5 py-8 sm:px-10 lg:grid-cols-2 lg:px-16">
          <div className="flex flex-col">{children}</div>
          <AuthIllustration />
        </main>
        <footer className="px-5 py-5 text-xs text-muted-foreground sm:px-10 lg:px-16">
          © 2026 LearnHub
        </footer>
      </div>
    </div>
  );
};

export default Layout;
