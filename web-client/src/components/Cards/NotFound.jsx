// components/NotFound.jsx
import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/"); // Redirects to homepage
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4 text-yellow-500">
          <FaExclamationTriangle className="text-5xl" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold text-yellow-500 mb-2">404</h1>
        <p className="text-xl font-semibold mb-1 text-gray-400">Page Not Found</p>
        <p className="mb-6">The page you are looking for does not exist.</p>
        <button
          onClick={handleGoHome}
          className="inline-block bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          Go to Homepage
        </button>
      </div>
    </main>
  );
}

export default NotFound;
