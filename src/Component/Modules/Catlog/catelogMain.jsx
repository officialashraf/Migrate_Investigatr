import { Card, CardContent, Typography, IconButton } from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { ListAltOutlined } from "@mui/icons-material";
import { ListTask } from 'react-bootstrap-icons';
import styles from '../Home/card.module.css';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

const CatalogMain = () => {
  const navigate = useNavigate();
  const cardData = [
    { title: 'IDINT Management' },
    { title: 'Entity Management' }
 ];

  const handleCheckboxChange = (title) => {
    if (title === "IDINT Management") {
      navigate("/admin/catalogue/pii");
    }

    if (title === "Entity Management") {
      navigate("/admin/catalogue/entity");
    }
    
  };

  return <div className="container-fluid  py-4">
    <div className="row justify-content-start">
      {cardData.map((data, index) =>
        <div key={index} className="col-auto mb-3">
          <Card
            sx={{
              width: 300,
              backgroundColor: "#101d2b",
              color: "white",
              borderRadius: "15px",
              height: "100px",
            }}
          >
            <CardContent
              sx={{
                '&.MuiCardContent-root': {
                  padding: '10px !important'
                },
                '&.MuiCardContent-root:last-child': {
                  padding: '10px !important'
                }
              }}
              onClick={() => handleCheckboxChange(data.title)}>
              <div className={styles.customIconCircle} >
                <IconButton size="small"
                // sx={{ color: "white" }}
                >
                  {index === 0 && <ListTask />}
                  {index === 1 && <ListAltOutlined />}
                </IconButton>
              </div>
              < div style={{ color: "#0073cf", fontSize: "0.75rem", fontWeight: "400", marginTop: "7px" }}>
                {data.title}
              </div>
              {data.subtitle &&
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  {data.subtitle}
                </Typography>}
              {data.date &&
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Last Updated: {data.date}
                </Typography>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  </div>;
};

export default CatalogMain;