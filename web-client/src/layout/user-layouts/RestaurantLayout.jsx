import {React, useState, useEffect} from "react";
import { Routes, Route } from "react-router-dom";
import { RestaurantNavbar, Forbidden, RequireLogin } from "../../components";
import { verifyUserRole } from "../../services/authorization-check";

import Home from "../../pages/restaurant/Home";
import MyMenus from "../../pages/restaurant/MyMenus";
import Orders from "../../pages/restaurant/Orders";
import Earnings from '../../pages/restaurant/Earnings'

function RestaurantLayout() {
  const [status, setStatus] = useState("loading"); // 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'

  useEffect(() => {
    const checkAccess = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setStatus("unauthenticated");
        return;
      }

      const hasRole = await verifyUserRole("restaurant");
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
    { name: "Home", path: "/restaurant/" },
    { name: "Orders", path: "/restaurant/orders" },
    { name: "My Menus", path: "/restaurant/menu" },
    { name: "Earnings", path: "/restaurant/earnings" },
  ];

  return (
    <div>
      <RestaurantNavbar sections={sections} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders/>} />
        <Route path="/menu" element={<MyMenus/>} />
        <Route path="/earnings" element={<Earnings/>} />
      </Routes>
    </div>
  );
}

export default RestaurantLayout;
