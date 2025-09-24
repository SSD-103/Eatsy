// components/RequireLogin.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaSignInAlt } from "react-icons/fa";

function RequireLogin() {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/"); // Adjust path as needed
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4 text-blue-600">
          <FaSignInAlt className="text-5xl" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Please Sign In</h1>
        <p className="mb-6 text-gray-600">
          You must be logged in to access this section.
        </p>
        <button
          onClick={handleLoginRedirect}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Go to Login
        </button>
      </div>
    </main>
  );
}

export default RequireLogin;
