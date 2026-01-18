import Home from './pages/Home';
import Restaurants from './pages/Restaurants';
import Minyan from './pages/Minyan';
import Synagogues from './pages/Synagogues';
import Directory from './pages/Directory';
import SynagogueDetail from './pages/SynagogueDetail';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';
import Contact from './pages/Contact';
import SubmitBusiness from './pages/SubmitBusiness';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Restaurants": Restaurants,
    "Minyan": Minyan,
    "Synagogues": Synagogues,
    "Directory": Directory,
    "SynagogueDetail": SynagogueDetail,
    "Settings": Settings,
    "Favorites": Favorites,
    "Contact": Contact,
    "SubmitBusiness": SubmitBusiness,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};