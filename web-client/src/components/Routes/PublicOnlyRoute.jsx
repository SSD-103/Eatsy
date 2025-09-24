import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getUserRole } from "../../services/authorization-check";

const PublicOnlyRoute = ({ children }) => {
  const [redirectPath, setRedirectPath] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const role = await getUserRole();
      if (role) {
        switch (role) {
          case "customer":
            setRedirectPath("/customer");
            break;
          case "restaurant":
            setRedirectPath("/restaurant");
            break;
          case "delivery":
            setRedirectPath("/delivery");
            break;
          default:
            setRedirectPath("/"); // Unknown role → fallback
        }
      }
      setChecking(false);
    };

    checkUser();
  }, []);

  if (checking) return null; // Show a loading spinner if needed
  if (redirectPath) return <Navigate to={redirectPath} replace />;

  return children;
};

export default PublicOnlyRoute;
