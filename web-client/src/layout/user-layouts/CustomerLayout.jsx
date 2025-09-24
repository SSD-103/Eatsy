import {React, useState, useEffect} from "react";
import { Routes, Route } from "react-router-dom";
import { CustomerNavBar, Forbidden, RequireLogin } from "../../components";
import { verifyUserRole } from "../../services/authorization-check";

import Home from "../../pages/customer/Home";
import RestaurantView from "../../pages/customer/RestaurantView";
import Checkout from "../../pages/customer/Checkout";
import MyOrders from "../../pages/customer/MyOrders";
import MyCardsPage from '../../pages/customer/payment/MyCardsPage';

function CustomerLayout() {
  const [status, setStatus] = useState("loading"); // 'loading' | 'unauthenticated' | 'unauthorized' | 'authorized'

  useEffect(() => {
    const checkAccess = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setStatus("unauthenticated");
        return;
      }

      const hasRole = await verifyUserRole("customer");
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
    { name: "Home", path: "/customer/" },
    { name: "My Orders", path: "/customer/my-orders" },
  ];

  return (
    <div>
      <CustomerNavBar sections={sections} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/my-orders" element={<MyOrders />} />

        <Route path="/restaurant-view/:id" element={<RestaurantView />} />

        <Route path="/checkout/:cartId/:amount" element={<Checkout />} />

        <Route path="/my-cards" element={<MyCardsPage/>}/>
      </Routes>
    </div>
  );
}

export default CustomerLayout;
