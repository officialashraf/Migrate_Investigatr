import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Box } from '@mui/material';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
import { FaRss, FaFacebookF, FaInstagram, FaVk, FaTiktok, FaYoutube, FaLinkedinIn } from "react-icons/fa";
import XIcon from '@mui/icons-material/X';
import style from './summary.module.css';
import styles from "./record.module.css";
import Cookies from "js-cookie";
import ReusablePieChart from '../../Common/Charts/PieChrat/pieChart';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import { clearCaseFilterPayload } from '../../../Redux/Action/caseAction';
import PropTypes from 'prop-types';
import { RiTelegram2Fill } from "react-icons/ri";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoLogoSkype } from "react-icons/io5";
import ResourceSummary from '../ResourceHandler/resourceSummary';
import Loader from '../Layout/loader';

const Summary = ({ filters, refreshKey }) => {
  const dispatch = useDispatch();
  dispatch(clearCaseFilterPayload());
  const token = Cookies.get("accessToken");
  const [, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const caseId = useSelector((state) => state.caseData.caseData.id);

  const iconMap = useMemo(() => ({
    facebook: <FaFacebookF size={20} />,
    x: <XIcon size={20} />,
    instagram: <FaInstagram size={20} />,
    youtube: <FaYoutube size={20} />,
    "rss feed": <FaRss size={20} />,
    linkedin: <FaLinkedinIn size={20} />,
    vk: <FaVk size={20} />,
    tiktok: <FaTiktok size={20} />,
    telegram: <RiTelegram2Fill size={20} />,
    whatsapp: <IoLogoWhatsapp size={20} />,
    skype: <IoLogoSkype size={20} />,
  }), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const case_id = Array.isArray(caseId)
        ? caseId.map(String)
        : [String(caseId)];

      const response = await axios.post(
        `${window.runtimeConfig.VITE_APP_API_DAS_SEARCH}/api/das/aggregate`,
        {
          case_id,
          aggs_fields: ["unified_record_type", "unified_date_only", "unified_type"],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { unified_record_type, unified_date_only, unified_type } = response.data;

      const pieData = (unified_type || []).map(item => ({
        name: item.key,
        value: item.doc_count
      }));

      if (pieData.length === 0) pieData.push({ name: 'No Data', value: 0 });

      const barData = (unified_date_only || []).map(item => {
        const date = new Date(item.key_as_string);
        const formattedDate = `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
        return {
          name: formattedDate,
          value: item.doc_count,
        };
      });


      if (barData.length === 0) barData.push({ name: 'No Data', value: 0 });

      const tableData = (unified_record_type || []).map(item => {
        const key = item.key.toLowerCase().trim();
        return {
          icon: iconMap[key] || <DataThresholdingIcon color="#ccc" size={22} />,
          name: item.key,
          value: item.doc_count,
        };
      });

      setPieData(pieData);
      setBarData(barData);
      setTableData(tableData);
      setTotalCount(tableData.reduce((sum, item) => sum + item.value, 0));

    } catch (error) {
      console.error('Error fetching data:', error);
      setPieData([{ name: 'No Data', value: 0 }]);
      setBarData([{ name: 'No Data', value: 0 }]);
      setTableData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [caseId, token, iconMap]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  return (
    <>
      <div className={style.containerFluid}>
        <Box width="100%">
          <div className={style.graphchats}>
            <Box className={style.boxes}>
              <ReusablePieChart
                caseId={caseId}
                aggsFields={["unified_type"]}
                refreshKey={refreshKey}
                disableSearchAdd={true}
              />
            </Box>

            <Box className={style.boxes} key={`bar-${refreshKey}`}>
              {loading ? <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Loader />
              </div> : <BarWithHover barData={barData} refreshKey={refreshKey} />}
            </Box>

            <Box className={style.boxes} key={`table-${refreshKey}`}>
              {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader />
                </div>
              ) : (
                <div className={styles.card}>
                  <div className={styles.scrollArea}>
                    {tableData.map((item, index) => (
                      <div className={styles.row} key={`${item.name}-${index}`}>
                        <div className={styles.left}>
                          <div className={styles.icon}>{item.icon}</div>
                          <div>
                            <p className={styles.name}>{item.name}</p>
                            <p className={styles.count}>{item.value}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer ko scroll area se bahar rakha */}
                  <div className={styles.footer}>
                    <span> </span>

                      <span>Total Records: {totalCount}</span>

                  </div>
                </div>

              )}
            </Box>
          </div>
        </Box>

        <div style={{
          display: "flex",
          alignItems: "center",
          padding: '0px 10px',
          justifyContent: 'center'
        }}>
          <Box className={style.resourceBoxes}>
            <ResourceSummary refreshKey={refreshKey} />
          </Box>
        </div>
      </div>
    </>
  );
};

Summary.propTypes = {
  filters: PropTypes.number.isRequired,
  refreshKey: PropTypes.number.isRequired,
};

export default Summary;

const BarWithHover = ({ barData, refreshKey }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    setActiveIndex(null);
  }, [refreshKey]);

  return (
    <div style={{ overflowX: 'auto', width: '100%', padding: '12px' }}>
      <div style={{ width: `${Math.max(barData.length * 80, 300)}px` }}>
        <ResponsiveContainer width="100%" height={250} style={{ overflow: 'auto' }}>
          <BarChart data={barData}>
            <XAxis
              dataKey="name"
              tick={{ fill: "#D6D6D6", fontSize: 12 }}
              axisLine={{ stroke: "#1c2833" }}
              tickLine={{ stroke: "#1c2833" }}
            />
            <YAxis
              tick={{ fill: "#D6D6D6", fontSize: 12 }}
              axisLine={{ stroke: "#1c2833" }}
              tickLine={{ stroke: "#1c2833" }}
            />

            <Tooltip
              wrapperStyle={{
                backgroundColor: "#0E2C46",
                border: "1px solid #3498db",
                borderRadius: "8px",
                padding: "4px",
                color: "#fff"
              }}
              contentStyle={{ backgroundColor: "#0E2C46", border: "none",padding:'2px', margin:'2px 0' }}
              labelStyle={{ color: "#D6D6D6", padding:'0', margin:'2px 0' }}
              cursor={{ fill: "#1c2833" }}
            />

            <Bar
              dataKey="value"
              fill="#3498db"
              barSize={15}
              radius={[8, 8, 8, 8]}
              isAnimationActive={false}
            >
              {barData.map((entry, index) => (
                <Cell
                  key={`${entry.name}-${index}`}
                  fill={index === activeIndex ? "#2980b9" : "#3498db"}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

BarWithHover.propTypes = {
  barData: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ).isRequired,
  refreshKey: PropTypes.number.isRequired,
};
