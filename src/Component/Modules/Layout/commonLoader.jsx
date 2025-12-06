import React from "react";
import PropTypes from "prop-types";

const CommonLoader = ({ message = "Please Wait..." }) => {
    return (
        <div className="popup-overlay">
            <div className="popup-containera">
                <div className="popup-content">{message}</div>
            </div>
        </div>
    );
};

CommonLoader.propTypes = {
    message: PropTypes.string,
};

export default CommonLoader;