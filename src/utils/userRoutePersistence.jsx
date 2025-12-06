import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useRoutePersistence = (basePath) => {
  const location = useLocation();
  const navigate = useNavigate();
  const restoring = useRef(false);

  // 🔹 Save last visited subpath
  useEffect(() => {
    if (restoring.current) return;
    if (!location.pathname.startsWith(basePath)) return;

    localStorage.setItem(`${basePath}-lastPath`, location.pathname);
  }, [location.pathname]);

  // 🔹 Restore last visited subpath when user returns
  useEffect(() => {
    const last = localStorage.getItem(`${basePath}-lastPath`);
    if (location.pathname === basePath && last && last !== basePath) {
      restoring.current = true;
      navigate(last, { replace: true });
      setTimeout(() => (restoring.current = false), 600);
    }
  }, []);
};
