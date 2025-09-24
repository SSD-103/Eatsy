import { userAPI} from "../../services/user-service";
import axios from "axios";

export const verifyDeliveryPerson = async (id, userId) => {
    const token = localStorage.getItem("token");
    try {
        const response = await axios.put(
            `${userAPI.VerifyDeliveryPerson(id, userId)}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response;
    } catch (error) {
        console.error("Failed to verify delivery person:", error.message);
        return null;
    }
};