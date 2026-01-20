import Admin from './pages/Admin';
import Contact from './pages/Contact';
import Daven from './pages/Daven';
import Directory from './pages/Directory';
import Favorites from './pages/Favorites';
import Home from './pages/Home';
import Minyan from './pages/Minyan';
import Restaurants from './pages/Restaurants';
import Settings from './pages/Settings';
import SubmitBusiness from './pages/SubmitBusiness';
import SynagogueDetail from './pages/SynagogueDetail';
import Synagogues from './pages/Synagogues';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "Contact": Contact,
    "Daven": Daven,
    "Directory": Directory,
    "Favorites": Favorites,
    "Home": Home,
    "Minyan": Minyan,
    "Restaurants": Restaurants,
    "Settings": Settings,
    "SubmitBusiness": SubmitBusiness,
    "SynagogueDetail": SynagogueDetail,
    "Synagogues": Synagogues,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};