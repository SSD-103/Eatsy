import React, { useState } from "react";
import { ThemeButton, CloseButton, ThemeLogo } from "../../../components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { userAPI } from "../../../services";
import { jwtDecode } from "jwt-decode"; // Note: not needed anymore since no token in response
import { useToast } from "../../../utils/alert-utils/ToastUtil";
import { useDispatch } from "react-redux";
import { setLoginCustomer } from "../../../redux/customer/customerSlice";

function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({
      ...loginData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!loginData.username || !loginData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const response = await axios.post(userAPI.CustomerLogin, {
        username: loginData.username,
        password: loginData.password,
      }, { withCredentials: true }); // Add withCredentials for cookies

      if (response.status === 200) {
        // No token in response; cookies are set by server
        // Store user data
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: response.data.user.id,
            name: response.data.user.name,
            username: response.data.user.username,
          })
        );
        // Dispatch the setLoginCustomer action to store the user data in Redux state
        dispatch(
          setLoginCustomer({
            id: decodedToken.id,
            name: response.data.user.name,
            username: response.data.user.username,
          })
        );
        // Dispatch to Redux
        dispatch(setLoginCustomer({
          id: response.data.user.id,
          name: response.data.user.name,
          username: response.data.user.username,
        }));

        console.log("Login successful", response.data);
        toast.success("Login successful");
        navigate("/customer");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast.error("Error logging in. Please try again.");
    }
  };

  return (
    <div className="login min-h-screen flex items-center justify-center">
      <div className="absolute top-0 left-0 p-4">
        <CloseButton link={"/"} />
      </div>
      <div className="absolute top-0 right-0 p-4">
        <ThemeButton />
      </div>

      <div className="card card-xl bg-base-300 shadow-sm w-full max-w-sm mx-auto">
        <div className="card-body">
          <ThemeLogo style={"w-48 mx-auto"} />
          <div className="card-title text-lg mt-4">Welcome back!</div>
          <form
            onSubmit={handleSubmit}
            className="form-control flex flex-col gap-2"
          >
            <input
              type="text"
              name="username"
              value={loginData.username}
              onChange={handleChange}
              placeholder="Username"
              className="input"
            />
            <input
              type="password"
              name="password"
              value={loginData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input"
            />
            <Link to="/auth/forgot-password" className="text-sm text-right">
              <small>Forgot Password?</small>
            </Link>
            <div className="card-actions justify-end mt-3">
              <button type="submit" className="btn btn-primary w-full">
                Login
              </button>
            </div>
          </form>
          {/* New Google Login Button */}
          <a
            href={userAPI.googleAuth}
            className="btn btn-outline w-full mt-2 flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="20"
              viewBox="0 0 24 24"
              width="20"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            <span>Login with Google</span>
          </a>
          <div className="text-sm text-center mt-2">
            <small>
              Don't have an account?{" "}
              <Link
                to="/auth/signup"
                className="text-primary font-bold cursor-pointer"
              >
                Register
              </Link>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;