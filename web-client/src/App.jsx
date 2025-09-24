import "./App.css";
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { NotFound } from "./components";
import PublicOnlyRoute from "./components/Routes/PublicOnlyRoute";

//Customer
import LandingPage from "./pages/landing/LandingPage";
import Login from "./pages/customer/auth/Login";
import SignUp from "./pages/customer/auth/SignUp";
import CustomerLayout from "./layout/user-layouts/CustomerLayout";
import AuthCallback from "./pages/customer/auth/AuthCallback";

//Restaurant
import RestaurantLanding from "./pages/restaurant/auth/RestaurantLanding";
import RestaurantRegistration from "./pages/restaurant/auth/RestaurantRegistration";
import RestaurantLayout from "./layout/user-layouts/RestaurantLayout";

//Delivery
import DeliveryLanding from "./pages/delivery/auth/DeliveryLanding";
import DeliveryRegistration from "./pages/delivery/auth/DeliveryRegistration";
import DeliveryLayout from "./layout/user-layouts/DeliveryLayout";

function App() {
  return (
    <>
      <Routes>
        {/* Landing Page */}
        <Route path={"/"} element={<LandingPage />} />

        {/* Customer Management */}
        <Route path={"/auth/login"} element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route
          path={"/auth/login"}
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route path={"/auth/signup"} element={<SignUp />} />
        <Route path={"/customer/*"} element={<CustomerLayout />} />

        {/* Delivery Management */}
        <Route
          path={"/for-delivery"}
          element={
            <PublicOnlyRoute>
              <DeliveryLanding />
            </PublicOnlyRoute>
          }
        />
        <Route path={"/for-delivery/register"} element={<DeliveryRegistration />} />
        <Route path={"/delivery/*"} element={<DeliveryLayout />} />

        {/* Restaurant Management */}
        <Route
          path={"/for-restaurant"}
          element={
            <PublicOnlyRoute>
              <RestaurantLanding />
            </PublicOnlyRoute>
          }
        />
        <Route path={"/for-restaurant/register"} element={<RestaurantRegistration />} />
        <Route path={"/restaurant/*"} element={<RestaurantLayout />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
}

export default App;
