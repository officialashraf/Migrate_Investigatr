import styles from "./loaderHashtag.module.css"
import PropTypes from "prop-types"

const LoaderHashtag = ({ style, className , textClassName
}) => {
  return (
    <div className={className || styles.loadingHashtag}>
      <div style={style}></div>

      <h6 className={textClassName || styles.text}>
      Please wait while we retrieve the data 
      </h6>
    </div>
  )
}
LoaderHashtag.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  textClassName: PropTypes.string
}

export default LoaderHashtag;