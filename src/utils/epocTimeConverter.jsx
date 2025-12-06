import PropTypes from "prop-types";

const EpochToIST = ({ epoch }) => {
  if (!epoch) return <span>N/A</span>;

  const epochNum = typeof epoch === "string" ? parseInt(epoch, 10) : epoch;
  if (isNaN(epochNum)) return <span>Invalid Date</span>;

  const date =
    epochNum.toString().length === 10
      ? new Date(epochNum * 1000)
      : new Date(epochNum);

  if (isNaN(date.getTime())) return <span>Invalid Date</span>;

  // IST timezone offset fix
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 5.5 * 3600 * 1000);

  // YYYY-MM-DD HH:mm:ss format
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, "0");
  const day = String(istDate.getDate()).padStart(2, "0");
  const hours = String(istDate.getHours()).padStart(2, "0");
  const minutes = String(istDate.getMinutes()).padStart(2, "0");
  const seconds = String(istDate.getSeconds()).padStart(2, "0");

  const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

  return <span>{formattedDate}</span>;
};

EpochToIST.propTypes = {
  epoch: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EpochToIST;

