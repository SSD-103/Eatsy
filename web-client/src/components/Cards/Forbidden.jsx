// components/Forbidden.jsx
import React from "react";
import { FaBan } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Forbidden() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4 text-red-600">
          <FaBan className="text-5xl" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
        <p className="text-xl font-semibold mb-1 text-gray-400">Access Denied</p>
        <p className="mb-6">
          You do not have permission to access this page.
        </p>
        <button
          onClick={handleGoBack}
          className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Go Back
        </button>
      </div>
    </main>
  );
}

export default Forbidden;
