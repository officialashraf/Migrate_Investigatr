import axios from 'axios';
import { Card, Container } from 'react-bootstrap';
import { Folder, FileEarmarkPlus, PieChart, Check2Circle, PauseCircle, Archive, Trash } from 'react-bootstrap-icons';
import styles from './card.module.css';
import { useCallback, useEffect, useState } from 'react';
import Cookies from "js-cookie";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const cardTemplate = (t) => [
  { icon: <Folder size={15} />, name: t('cases.case_count'), key: 'case_count' },
  { icon: <FileEarmarkPlus size={15} />, name: t('cases.New'), key: 'New' },
  { icon: <PieChart size={15} />, name: t('cases.In Progress'), key: 'In Progress' },
  { icon: <Check2Circle size={15} />, name: t('cases.Closed'), key: 'Closed' },
  { icon: <PauseCircle size={15} />, name: t('cases.On Hold'), key: 'On Hold' },
  { icon: <Archive size={15} />, name: t('cases.Archived'), key: 'Archived' },
  { icon: <Trash size={15} />, name: t('cases.Deleted'), key: 'Deleted' }
];

const StatusCard = ({ name, number, icon }) => {
  return (
    <Card className={styles.customCard}>
      <Card.Body className={styles.customCardBody}>

        {/* Top Row */}
        <div className={styles.customTopRow}>
          <div className={styles.customIconCircle}>{icon}</div>
          <div className={styles.customCardLabel}>{name}</div>
        </div>

        {/* Bottom Row */}
        <div className={styles.customBottomRow}>
          <div className={styles.customCardNumber}>{number}</div>
          <div className={styles.customArrowCircle}>
            <ArrowOutwardIcon size={14} />
          </div>
        </div>

      </Card.Body>
    </Card>
  );
}

const CardList = () => {
  const { t } = useTranslation();
  const Token = Cookies.get('accessToken');
  const [cardData, setCardData] = useState(cardTemplate(t));

  const getCardData = useCallback(async () => {
    try {
      const response = await axios.get(`${window.runtimeConfig.VITE_APP_API_CASE_MAN}/api/case-man/v1/case/states-count`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Token}`
        },
      });
      const apiData = response.data;

      const updatedData = cardTemplate(t).map(item => ({
        ...item,
        number: apiData[item.key] || 0
      }));
      setCardData(updatedData);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(t('error.fetching_data'));
    }
  }, [Token, t]);

  useEffect(() => {
    getCardData();
    const handleDatabaseUpdate = () => {
      getCardData();
    };

    window.addEventListener("databaseUpdated", handleDatabaseUpdate);

    return () => {
      window.removeEventListener("databaseUpdated", handleDatabaseUpdate);
    };
  }, [getCardData]);

  return (
    <Container fluid className={styles.cardListContainer}>
      {cardData.map((item, index) => (
        <StatusCard key={item.key} name={item.name} number={item.number || 0} icon={item.icon} />
      ))}
    </Container>
  );
}
StatusCard.propTypes = {
  name: PropTypes.string.isRequired,
  number: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element
};
export default CardList;






