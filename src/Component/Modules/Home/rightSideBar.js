
import { Nav } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import "./rightSideBar.css"
import { useDispatch, useSelector } from 'react-redux';
import { openPopup } from '../../../Redux/Action/criteriaAction';
import RecentCriteria from '../FilterCriteria/recentCriteria';
import CreateCriteria from '../FilterCriteria/createCriteria';
import SavedCriteria from '../FilterCriteria/savedCriteria';

const RightSidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const activePopup = useSelector((state) => state.popup?.activePopup || null);
  console.log("actvepopup", activePopup)

  const handleItemClick = (item) => {
    if (item.isPopup) {
      console.log("Dispatching action: openPopup");
      dispatch(openPopup("recent"))// Search click hone par popup open hoga
    } else {
      navigate(item.path); // Baaki sab pages navigate karenge
    }
  }

  const menuItems = [
    { label: 'Search', icon: <Search size={15} />, isPopup: true },
  ];

  return (
    <>
      <div style={{ marginTop: '1rem' }}>
        {menuItems.map((item) => (
          <Nav.Link
            key={item.label}
            onClick={() => handleItemClick(item)}
            style={{ color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '12px', marginBottom: '2rem' }}
          >
            {item.icon}
            <span style={{ marginLeft: '1px' }}>{item.label}</span>
          </Nav.Link>
        ))}
      </div>
      {activePopup === "recent" && <RecentCriteria />}
      {activePopup === "create" && <CreateCriteria />}
      {activePopup === "saved" && <SavedCriteria />}

    </>
  );
}

export default RightSidebar;