export const instant = false;

const Layout = async ({ children }: { children: React.ReactNode }) => {
  
  return (
    <main className="auth-layout">
      <section className="">
        <div className="">{children}</div>        
      </section>

      <section className="">
      </section>
    </main>
  );
};

export default Layout;
