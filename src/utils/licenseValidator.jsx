import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../Component/Modules/Layout/loader";

const LicenseValidator =()=>{
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkLicense = async () => {
      try {
        const res = await axios.get(`${window.runtimeConfig.VITE_APP_API_LICENSE}/api/license`)
        const { license_registered } = res.data;
        console.log("responseLicense", res)
        console.log("responseLicense", res.data)
        if ( license_registered)
{          navigate("/login", { replace: true });
        }
        else {
            navigate("/license", { replace: true });
          }
      } catch (err) {
        console.error("License check failed:", err);
        navigate("/license", { replace: true });

      }finally {
        setLoading(false); // Stop the loader once API response is done
      }
    };

    checkLicense();
  }, []);

  if (loading) {
    // Show loading spinner while waiting for the response
    return (
      <div style={{
            color: 'white',
      }}>
        <p>Checking license validity...</p>
        <Loader style={{ borderBottomColor:"white"}}/>
   </div>
    );
  }

  return null; // When loading is false, it will redirect as per the logic
};

export default LicenseValidator;
