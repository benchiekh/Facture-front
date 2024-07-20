// GoogleAuthSuccess.js
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);


  const getUser = async () => {
    try {
        const url = `http://localhost:5000/auth/login/success`;
        const { data } = await axios.get(url, { withCredentials: true });
        setUser(data.user._json);
        console.log("sucess")
        navigate("/admin/index");
    } catch (err) {
        console.log(err);
    }
};

useEffect(() => {
    getUser();
}, []);

  return <div>Loading...</div>;
};

export default GoogleAuthSuccess;
