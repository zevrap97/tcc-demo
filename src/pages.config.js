import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Minyan from './pages/Minyan';
import Synagogues from './pages/Synagogues';
import Directory from './pages/Directory';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Restaurants": Restaurants,
    "Minyan": Minyan,
    "Synagogues": Synagogues,
    "Directory": Directory,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};