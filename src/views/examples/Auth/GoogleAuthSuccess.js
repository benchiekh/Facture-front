import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const url = `http://localhost:5000/auth/login/success`; // Use environment variable for backend URL
        const response = await axios.get(url, { withCredentials: true });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token); // Save token to localStorage
          navigate("/admin/index"); // Redirect to admin page
        } else {
          setError("No token received");
          navigate("/login"); // Redirect to login page if no token
        }
      } catch (error) {
        console.error("Error during authentication:", error);
        setError("Authentication error");
        navigate("/login"); // Redirect to login page on error
      } finally {
        setLoading(false); // Set loading state to false after completion
      }
    };

    getUser();
  }, [navigate]); // Dependency array to ensure useEffect runs only once

  return (
    <div>
      {loading ? "Loading..." : error ? `Error: ${error}` : "Redirecting..."}
    </div>
  );
};

export default GoogleAuthSuccess;
