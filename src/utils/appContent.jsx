import Header from '../Component/Modules/Home/header.jsx';
import Home from '../Component/Modules/Home/home.jsx';
import LoginPage from '../Component/Modules/User/login.jsx';
import { Routes, Route, useLocation, useParams } from 'react-router-dom';
import MainFilter from '../Component/Modules/Summarymain/mainFilterPage.jsx';
import AddFilter2 from '../Component/Modules/Filters/addFilter.jsx';
import CaseTableDataFilter from '../Component/Modules/Analyze/caseTableDataFilter.jsx';
import Sidebar from '../Component/Modules/Home/leftSideBar.jsx';
import styles from '../Component/Modules/Home/dashboard.module.css';
import Summary from '../Component/Modules/Summarymain/summary.jsx';
import '../App.css'
import ProtectedRoute from './protectRoute.jsx';
import Loader from '../Component/Modules/Layout/loader.jsx';
import SearchResults from '../Component/Modules/FilterCriteria/List/fullscreen.jsx';
import LogoutUser from '../Component/Modules/User/logout.jsx';
import ShowDetails from '../Component/Modules/PII/showDetails.jsx';
import LicensePage from '../Component/Modules/User/license.jsx';
import LicenseValidator from './licenseValidator.jsx';
import UserDashboard from '../Component/Modules/User/userDashboard.jsx';
import UserManagement from '../Component/Modules/User/UserManagement.jsx';
import RolesPermission from '../Component/Modules/Roles/roles_Permission.jsx';
import ReportPage from '../Component/Modules/Reports/reportPage.jsx';
import TargetDashboard from '../Component/Modules/Targets/targetDashboard.jsx';
import { setupAxiosInterceptors } from './axiosInterceptor.jsx';
import LicenseGuard from './licenseGaurd.jsx';
import ConnectionManagement from '../Component/Modules/ConnectionGraph/connectionManagement.jsx';
import DAButton from '../Component/Common/Buttton/button.jsx';
import CatelogList from '../Component/Modules/Catlog/catelogList.jsx';
import CatalogMain from '../Component/Modules/Catlog/catelogMain.jsx';
import PIICatelog from '../Component/Modules/Catlog/piiCatelog.jsx';
import IPDRCatalogue from '../Component/Modules/HeaderMapping/ipdrHeaderMapping.jsx';
import HeaderMappingMain from '../Component/Modules/HeaderMapping/headerMappingMain.jsx';
import GlobalUploadTracker from '../Component/Modules/ResourceHandler/GlobalUploadTracker.jsx';
import SummaryView from '../Component/Modules/PII/SummaryView.jsx';
import UserCards from '../Component/Modules/PII/cardDetails.jsx';
import ChatBot from '../Component/Modules/Chatbot/chatBot.jsx';
import HashtagHome from '../Component/Modules/Hashtags/hashtagHome.jsx';

const AppContent = () => {
  const { caseId, view } = useParams();
  const location = useLocation();
  setupAxiosInterceptors();

  const getHeaderTitle = () => {
    const path = location.pathname;

    const exactPaths = {
      "/cases": "Case Management",
      "/cases/summary/:caseId": "Case Summary",
      "/cases/analysis/:view/:caseId": "Case Analysis",
      "/pii": "Identity Intelligence",
      "/pii/summary-view": "IDINT Summary",
      "/hashtags": "Search Hashtag",
      "/search": "Search",
      "/search/:view": "Search",
      "/admin/users": "User Management",
      "/reports": "Reports",
      "/documents": "Docs",
      "/admin": "Admin Console",
      "/admin/roles": "Role and Permissions",
      "/admin/connections": "Connection Management",
      "/admin/catalogue": "Catalogue Management",
      "/admin/headerMapping": "Header Mapping",
      "/targets": "Target Management",
      "/admin/headerMapping/ipdr": "IPDR Header Mapping",
      "/admin/catalogue/entity": "Entity Catalogue",
      "/admin/catalogue/pii": "IDINT Catalogue",
      "/chatBot": "Investigatr AI - Comming soon",
    };

    const dynamicRoutes = [
      { path: "/cases/summary/:caseId", title: "Case Summary" },
      { path: "/cases/analysis/:view/:caseId", title: "Case Analysis" },
      { path: "/search/:view", title: "Search" },
    ];

    if (exactPaths[path]) return exactPaths[path];

    for (const route of dynamicRoutes) {
      const regex = new RegExp("^" + route.path.replace(/:[^/]+/g, "[^/]+") + "$");
      if (regex.test(path)) return route.title;
    }

    // Default title
    return "Case Summary";
  };

  const excludedPaths = ["/login", "/", "/license"];
  const isAuthPage = ["/login"].includes(location.pathname);

  return (
    <> {isAuthPage ? (
      <Routes>
        <Route path='/' element={<LicenseValidator />} />
        <Route element={<LicenseGuard />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    ) : (
      <div className={styles.ContainerDashboard}>
        <div className={styles.dashboardContainer}>

          {/* Sidebar */}
          <div className={styles.contA}>
            {!excludedPaths.includes(location.pathname) && <Sidebar />}
          </div>
          {/* Right Panel: Header + Main Content */}
          <div className={styles.rightPanel}>

            {/* Header */}
            <div className={styles.contD}>
              {!excludedPaths.includes(location.pathname) && <Header title={getHeaderTitle()} />}
            </div>

            {/* Main Content */}
            <div className={styles.contB}>
              <Routes>
                <Route path='/' element={<LicenseValidator />} />
                <Route path='/btn' element={<DAButton />} />
                <Route path="/license" element={<LicensePage />} />
                <Route element={<LicenseGuard />}>
                  <Route path="/login" element={<LoginPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route path="/pii/*" element={<ShowDetails />}>
                    <Route index element={<UserCards />} />
                    <Route path="summary-view" element={<SummaryView />} />
                  </Route>
                  <Route path="/cases" element={<Home />} />
                  <Route path="/cases/summary/:caseId" element={<MainFilter />} />
                  <Route path="/add-filter" element={<AddFilter2 />} />
                  <Route path='/cases/analysis/:view/:caseId' element={<CaseTableDataFilter />} />
                  <Route path="/cases/:caseID/case-summary" element={<Summary />} />
             
                  {/* 🔹 Search routes - similar to cases */}
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/search/:view" element={<SearchResults />} />
                  
                  <Route path="/logout" element={<LogoutUser />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin" element={<UserDashboard />} />
                  <Route path="/admin/roles" element={<RolesPermission />} />
                  <Route path="/reports" element={<ReportPage />} />
                  <Route path="/targets" element={<TargetDashboard />} />
                  <Route path="/hashtags" element={<HashtagHome />} />
                  <Route path="/admin/connections" element={<ConnectionManagement />} />
                  <Route path="/admin/catalogue" element={<CatalogMain />} />
                  <Route path="/admin/catalogue/entity" element={<CatelogList />} />
                  <Route path="/admin/catalogue/pii" element={<PIICatelog />} />
                  <Route path="/admin/headerMapping/ipdr" element={<IPDRCatalogue />} />
                  <Route path="/admin/headerMapping" element={<HeaderMappingMain />} />
                   <Route path='/chatBot' element={<ChatBot /> } />
                  <Route path="*" element={<div className='notfound'><h4>Work in progress........</h4></div>} />
                </Route>
                <Route path='loader' element={<Loader />} />
              </Routes>
            </div>
          </div>
        </div>
        <GlobalUploadTracker />
      </div>
    )}
    </>
  );
};
export default AppContent;