import {React, useState, useEffect} from "react";
import { Sidebar } from "../components";
import { Routes, Route } from "react-router-dom";
import {Forbidden, RequireLogin} from "../components";
import { verifyUserRole } from "../services/authorization-check";

import Dashboard from "../pages/Dashboard";
import UserManagement from "../pages/UserManagement";
import RestaurantManagement from "../pages/RestaurantManagement";
import Reports from "../pages/Reports";

function DashboardLayout() {
  const [status, setStatus] = useState("loading"); // 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'

  useEffect(() => {
    const checkAccess = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setStatus("unauthenticated");
        return;
      }

      const hasRole = await verifyUserRole();
      if (hasRole) {
        setStatus("authorized");
      } else {
        setStatus("unauthorized");
      }
    };

    checkAccess();
  }, []);

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") return <RequireLogin />;
  if (status === "unauthorized") return <Forbidden />;

  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      {/* Content Area */}
      <div className="drawer-content flex flex-col bg-base-100">
        <div className="flex-1 p-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/restaurants" element={<RestaurantManagement />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
}

export default DashboardLayout;
