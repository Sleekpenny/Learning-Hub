
export const instant = false;

const Layout = async ({children}: {children: React.ReactNode}) => {

    return  (
        <main className=""> 
            <div className="container"> 
                {children}
            </div>
        </main>
    )
}

export default Layout;