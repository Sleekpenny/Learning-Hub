import { Navbar } from "@/components/layout/nav-bar";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};

export default Layout;
