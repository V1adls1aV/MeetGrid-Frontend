import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Entry point for Telegram Mini App.
 * Reads the 'tgWebAppStartParam' (or 'start_param') and redirects to the appropriate topic.
 */
const TelegramEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const startParam =
      params.get("tgWebAppStartParam") || params.get("startapp");

    if (startParam) {
      navigate(`/topic/${startParam}`, { replace: true });
    } else {
      // If no topic ID is provided, go to the landing page
      navigate("/", { replace: true });
    }
  }, [navigate, location]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        color: "var(--tg-theme-text-color, #000)",
        backgroundColor: "var(--tg-theme-bg-color, #fff)",
      }}
    >
      Loading...
    </div>
  );
};

export default TelegramEntryPage;
