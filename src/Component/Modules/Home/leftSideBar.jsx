import { useState, useEffect } from 'react';
import { Nav } from 'react-bootstrap';
import { ListTask, Folder, BarChart, People, Bullseye, Search } from 'react-bootstrap-icons';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from "./sideBar.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { openPopup } from '../../../Redux/Action/criteriaAction';
import RecentCriteria from '../FilterCriteria/recentCriteria';
import CreateCriteria from '../FilterCriteria/createCriteria';
import SavedCriteria from '../FilterCriteria/savedCriteria';
import CuratedLogo from '../../Assets/Images/CuratedLogoNew.png';
import { RiGeminiLine } from "react-icons/ri";
import { BsPerson } from "react-icons/bs";



const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState(
    location.pathname.includes("targets") ? "Targets" :
    location.pathname.includes("idint") ? "IDINT " :
    location.pathname.includes("reports") ? "Reports" :
    location.pathname.includes("admin") ? "Admin" :
    location.pathname.includes("search") ? "Search" :
    location.pathname.includes("chatBot") ? "Investigatr" :
    "Cases"
  );
  
  const activePopup = useSelector((state) => state.popup?.activePopup || null);

  const menuItems = [
    { label: 'Cases', icon: <Folder size={20} />, path: '/cases' },
    { label: 'Targets', icon: <Bullseye size={20} />, path: '/targets' },
    { label: 'IDINT ', icon: <ListTask size={20} />, path: '/pii' },
    { label: 'Hashtag', icon: <TagOutlinedIcon size={20} />, path: '/hashtags' },
    { label: 'Reports', icon: <BarChart size={20} />, path: '/reports' },
    { label: 'Search', icon: <Search size={16} />,
    //  isPopup: true,
      path:'/search'},
    { label: 'Admin', icon: <People size={20} />, path: '/admin' },
    // { label: 'Search', icon: <Search size={16} />, isPopup: true, popup: 'recent' },
    {
      label: 'Investigatr', icon: <BsPerson size={16} />, 
      // isPopup: true, 
      path: '/chatBot' },
  ];

  //  Save last path for each base section
  useEffect(() => {
    const currentPath = location.pathname;

    // Identify base (cases, pii, admin, etc.)
    const base = menuItems
      .map(item => item.path.replace("/", "")) // e.g. "cases"
      .find(key => currentPath.startsWith(`/${key}`));

    if (base) {
      localStorage.setItem(`lastPath_${base}`, currentPath);
    }
  }, [location.pathname]);

  //  When sidebar item is clicked
  const handleItemClick = (item) => {
    setSelectedItem(item.label);

    if (item.isPopup && item.popup) {
      dispatch(openPopup(item.popup));
      return;
    }

    if (item.path) {
      const baseKey = item.path.replace("/", "");
      const lastSaved = localStorage.getItem(`lastPath_${baseKey}`);
      const target = lastSaved && lastSaved.startsWith(item.path)
        ? lastSaved
        : item.path; // default to base path if nothing saved

      navigate(target);
    }
  };

  return (
    <>
      <div className={styles.sideB}>
        <div className={styles.logoIcon}>Curated Codes</div>

        <div className={styles.sideTop}>
          {menuItems.slice(0, 5).map((item) => (
            <Nav.Link
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={`${styles.navSideLink} active ${
                selectedItem === item.label ? styles.navSideLinkActive : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Nav.Link>
          ))}
        </div>

        <div className={styles.sideBottom}>
          {menuItems.slice(5).map((item) => (
            <div key={item.label}>
              <Nav.Link
                onClick={() => handleItemClick(item)}
                className={`${styles.navSideLink} ${
                  selectedItem === item.label ? styles.navSideLinkActive : ''
                }`}
              >
                {item.icon}
              <span>{item.label}</span>
              </Nav.Link>
            </div>
          ))}
        </div>
      </div>

      {/* Popups */}
      {activePopup === "recent" && <RecentCriteria />}
      {activePopup === "create" && <CreateCriteria />}
      {activePopup === "saved" && <SavedCriteria />}
    </>
  );
};

export default Sidebar;
