import { Navbar, Container, Row, Col, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import styles from './headerfilter.module.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import IPDR from '../ResourceHandler/addResource.jsx';
import AddFilter2 from '../Filters/addFilter.jsx';
import FileUpload from '../ResourceHandler/FileUpload.jsx';
import FtpPopup from '../ResourceHandler/FtpPopup.jsx';
import AppButton from '../../Common/Buttton/button.jsx';
import RefreshIcon from '@mui/icons-material/Refresh';
import PropTypes from 'prop-types';

const HeaderFilter = ({ handleRefresh }) => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const caseData = useSelector((state) => state.caseData.caseData);
  const storedCaseId = useSelector((state) => state.caseData.caseData.id);
  const [showIpdr, setShowIpdr] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showFtpPopup, setShowFtpPopup] = useState(false);
  const [selectedDataType, setSelectedDataType] = useState("IPDR");

  const handleProceed = (selectedOption, selectDataType) => {
    console.log("headerFilter.js", selectedOption, selectDataType);
    setShowIpdr(false);
    if (selectedOption === 'osintData') {
      setShowAddFilter(true);
    } else if (selectedOption === 'ftpServer') {
      setSelectedDataType(selectDataType);
      setShowFtpPopup(true);
    } else if (selectedOption === 'localStorage') {
      setSelectedDataType(selectDataType);
      setShowFileUpload(true);
    }
  };


  useEffect(() => {
    if (caseId !== String(storedCaseId)) {
      navigate("/not-found");
    }
  }, [caseId, storedCaseId, navigate]);

  const handleClick = () => {
    navigate(`/cases/analysis/graphical/${caseData.id}`);
  };

  const togglePopupIpdr = (value) => {
    setShowIpdr(value);
  };

  return (
    <>
      <Navbar expand="sm" className="justify-content-between custom-navbarH">
        <Container fluid className={styles.customContainerH}>
          <Row className="w-100">
            <Col>
              <div className={styles.caseInfo}>
                <div className={styles.caseTitleStatus}>
                  <Badge
                    pill
                    bg={
                      caseData.status === "In Progress"
                        ? "warning"
                        : caseData.status === "New"
                          ? "success"
                          : "danger"
                    }
                    className={styles.ms2 + " text-black"}
                  >
                    {caseData.status}
                  </Badge>
                </div>
              </div>
            </Col>

            <Col xs="auto" className={styles.dFlexGap2}>
              {caseData.status !== "New" && (
                <>
                  <AppButton onClick={handleClick}>Analyze</AppButton>
                  <AppButton onClick={togglePopupIpdr}>+ Add Resource</AppButton>
                   <AppButton onClick={handleRefresh}>Refresh</AppButton>
                  {/* <RefreshIcon 
                    onClick={handleRefresh} 
                    style={{ cursor: "pointer" }} 
                    titleAccess="Refresh data"
                  /> */}
                </>
              )}
            </Col>
          </Row>
        </Container>
      </Navbar>

      {showIpdr && <IPDR togglePopup={() => setShowIpdr(false)} handleProceed={handleProceed} />}
      {showAddFilter && <AddFilter2 togglePopup={() => setShowAddFilter(false)} />}
      {showFileUpload && <FileUpload togglePopup={() => setShowFileUpload(false)} selectDataType={selectedDataType} />}
      {showFtpPopup && <FtpPopup togglePopup={() => setShowFtpPopup(false)} />}
    </>
  );
};

HeaderFilter.propTypes = {
  handleRefresh: PropTypes.func.isRequired,
};

export default HeaderFilter;