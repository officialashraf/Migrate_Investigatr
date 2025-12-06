import buildInfo from '../../../InfoApp/build-info';
import PopupModal from "../../Common/Popup/popup";
import DetailBox from "../../Common/DetailBox/DetailBox";
import styles from '../../Common/DetailBox/detailBox.module.css';
import AppButton from "../../Common/Buttton/button";
import PropTypes from 'prop-types';

const AboutUs = ({ togglePopup }) => {
    return (
        <PopupModal title="About Us" onClose={togglePopup}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    <DetailBox label="Product Name" value={`Investigatr`} />
                    <DetailBox label="Version" value={`1.1.3`} />
                    <DetailBox label="Updated By" value={`Curated Codes Pvt. Ltd.`} />
                    <DetailBox label="Maintained By" value={`Curated Codes Pvt. Ltd.`} />
                </div>
            </div>
            <div className="d-flex justify-content-center mt-3">
                <AppButton onClick={togglePopup}>Cancel</AppButton>
            </div>
        </PopupModal>
    );
};
AboutUs.propTypes = {
    togglePopup: PropTypes.func.isRequired,
};
export default AboutUs;
