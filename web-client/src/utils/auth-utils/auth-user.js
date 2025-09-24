import { useDispatch } from "react-redux";
import { logoutCustomer } from "../../redux/customer/customerSlice";
import { logoutRestaurant } from "../../redux/restaurant/restaurantSlice";
import { logoutDelivery } from "../../redux/delivery/deliverySlice";
import { clearCart } from "../../redux/customer/cartSlice";
import { userAPI } from "../../services";

export const useCustomerLogout = async () => {
  try {
    // Call logout endpoint (server clears cookies and invalidates)
    await axios.post("/api/customer/logout", {}, { withCredentials: true });
  } catch (error) {
    console.error("Error during logout API call:", error);
  }
  const dispatch = useDispatch();
  dispatch(clearCart());
  
  return logout;
};

export const useRestaurantLogout = () => {
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(logoutRestaurant());
  };

  return logout;
};

export const useDeliveryLogout = () => {
  const dispatch = useDispatch();

  const logout = () => {
    dispatch(logoutDelivery());
  };

  return logout;
};
