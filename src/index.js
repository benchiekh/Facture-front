import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import AuthLayout from "layouts/Auth.js";
import PrivateRoute from "./PrivateRoute ";
import GoogleAuthSuccess from "views/examples/Auth/GoogleAuthSuccess";
import ForgotPasswordLayout from "layouts/ForgotPasswordLayout";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route
        path="/admin/*"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      />
      <Route path="/auth/*" element={<AuthLayout />} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      <Route path="/password-reset/*" element={<ForgotPasswordLayout />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  </BrowserRouter>
);