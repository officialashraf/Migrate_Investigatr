import { useSelector } from "react-redux";
import "./tabulerHeader.module.css";
import styles from "./caseHeader.module.css";

const CaseHeader = () => {

  const caseData = useSelector((state) => state.caseData.caseData);

  return (
      <div className={styles.caseHeader}>
        <div
          className={styles.headerRow}
        >

          <div className={styles.headerTitle}>
            {/* <h5>
              {`CASE${String(caseData.id).padStart(4, "0")}`}{" "}
              ({caseData.title})
            </h5> */}

          </div>
        </div>
      </div>
  );
};

export default CaseHeader;