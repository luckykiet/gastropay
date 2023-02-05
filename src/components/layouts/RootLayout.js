import 'bulma/css/bulma.min.css';
import Navbar from '../Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
export default function RootLayout() {
    return (
        <>
            <div className='container is-fullhd'>
                <header>
                    <Navbar />
                </header>
                <main>
                    <div className='container is-widescreen'>
                        <Outlet />
                    </div>
                </main>
                <Footer />
            </div>
        </>
    )
}
