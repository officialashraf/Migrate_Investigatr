import styles from "./loader.module.css"
import PropTypes from "prop-types"

const Loader = ({ style, className , textClassName
}) => {
  return (
    <div className={className || styles.loading}>
      <div style={style}></div>

      <h6 className={textClassName || styles.text}>
      Please wait while we retrieve the data 
      </h6>
    </div>
  )
}
Loader.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  textClassName: PropTypes.string
}

export default Loader;