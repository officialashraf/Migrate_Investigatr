import { useEffect } from 'react';
import { Card, CardContent, IconButton } from '@mui/material';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import Groups3OutlinedIcon from '@mui/icons-material/Groups3Outlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import SchemaIcon from '@mui/icons-material/Schema';
import styles from '../Home/card.module.css';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔹 Define all modules and routes
  const cardData = [
    { title: 'User Management', path: '/admin/users', icon: <Groups3OutlinedIcon /> },
    { title: 'Roles and Permissions', path: '/admin/roles', icon: <AdminPanelSettingsOutlinedIcon /> },
    { title: 'Connection Management', path: '/admin/connections', icon: <HttpsOutlinedIcon /> },
    { title: 'Catalogue Management', path: '/admin/catalogue', icon: <AutoAwesomeOutlinedIcon /> },
    { title: 'Header Mapping', path: '/admin/headerMapping', icon: <SchemaIcon /> },
  ];

  // 🔹 When user clicks on a card
  const handleCardClick = (path) => {
    localStorage.setItem('lastAdminPath', path); // Save last visited
    navigate(path);
  };

  // 🔹 When user opens /admin, auto-redirect to last visited submodule
 useEffect(() => {
  const lastPath = localStorage.getItem('lastAdminPath');
  const cameFrom = sessionStorage.getItem('lastVisitedPath');

  // Restore only if user is returning to /admin from outside the admin section
  if (
    location.pathname === '/admin' &&
    lastPath &&
    lastPath !== '/admin' &&
    cameFrom &&
    !cameFrom.startsWith('/admin')
  ) {
    navigate(lastPath, { replace: true });
  }

  // Track where user was before
  sessionStorage.setItem('lastVisitedPath', location.pathname);
}, [location.pathname, navigate]);


  return (
    <div className="container-fluid py-4">
      <div className="row justify-content-start">
        {cardData.map(({ title, path, icon }) => {
          const isActive = location.pathname === path; // Highlight if active
          return (
            <div key={title} className="col-auto mb-3">
              <Card
                sx={{
                  width: 300,
                  backgroundColor: '#101d2b',
                  color: 'white',
                  borderRadius: '12px',
                  height: 100,
                  border: isActive ? '2px solid #0073cf' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 10px rgba(0,115,207,0.4)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    border: '1px solid #0073cf',
                    boxShadow: '0 0 10px rgba(0,115,207,0.3)',
                  },
                }}
                onClick={() => handleCardClick(path)}
              >
                <CardContent>
                  <div className={styles.customIconCircle}>
                    <IconButton size="small">{icon}</IconButton>
                  </div>
                  <div
                    style={{
                      color: '#0073cf',
                      fontSize: '0.75rem',
                      fontWeight: '400',
                      marginTop: '7px',
                    }}
                  >
                    {title}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDashboard;
