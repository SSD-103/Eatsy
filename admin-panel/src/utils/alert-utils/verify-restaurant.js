import { userAPI} from "../../services/user-service";
import axios from "axios";

export const verifyRestaurant = async (id, userId) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.put(
            `${userAPI.VerifyRestaurant(id, userId)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Failed to verify user:", error.message);
        return null;
    }
};