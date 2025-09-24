import {React, useState, useEffect} from "react";
import { Routes, Route } from "react-router-dom";
import { DeliveryNavBar, DeliveryOrders, Forbidden, RequireLogin } from "../../components";
import { verifyUserRole } from "../../services/authorization-check";


import Home from "../../pages/delivery/Home";
import Earnings from "../../pages/delivery/Earnings"

function DeliveryLayout() {
  const [status, setStatus] = useState("loading"); // 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'

  useEffect(() => {
    const checkAccess = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setStatus("unauthenticated");
        return;
      }

      const hasRole = await verifyUserRole("delivery");
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

  const sections = [
    { name: "Home", path: "/delivery/" },
    { name: "Orders", path: "/delivery/orders" },
    { name: "Earnings", path: "/delivery/earnings" },
  ]

  return (
    <div>
      <DeliveryNavBar sections={sections} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<DeliveryOrders/>} />
        <Route path="/earnings" element={<Earnings />} />
      </Routes>
    </div>
  );
}

export default DeliveryLayout;
