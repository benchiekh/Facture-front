/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Company from "views/examples/Companies/Company";
import Clients from "views/examples/Clients/Clients";
import Register from "views/examples/Auth/Register";
import Login from "views/examples/Auth/Login";
import Tables from "views/examples/Tables.js";
import Person from "views/examples/Persons/Persons";
import ForgotPassword from "views/examples/Auth/ForgotPassword";
import ProductCategory from "views/examples/ProductCategory/ProductCategory";
import Product from "views/examples/Products/Products";
import ExpenseCategory from "views/examples/ExpensesCategory/ExpensesCategory";



var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/persons",
    name: "Persons",
    icon: "ni ni-circle-08 text-blue",
    component: <Person />,
    layout: "/admin",
  },
  {
    path: "/company",
    name: "Company",
    icon: "ni ni-building text-orange",
    component: <Company />,
    layout: "/admin",
  },
  {
    path: "/clients",
    name: "Clients",
    icon: "ni ni-single-02 text-yellow",
    component: <Clients />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "fa-regular fa-user text-red",
    component: <Profile />,
    layout: "/admin",
  },
  {
    path: "/product-category",
    name: "Product Category",
    icon: "fa-solid fa-ticket text-green",
    component: <ProductCategory />,
    layout: "/admin",
  },
  {
    path: "/expense-category",
    name: "Expense Category",
    icon: "fa-solid fa-ticket text-blue",
    component: <ExpenseCategory />,
    layout: "/admin",
  },
  {
    path: "/product",
    name: "Product ",
    icon: "fa-solid fa-box text-green",
    component: <Product />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
  },
  {
    path: "/login",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    component: <Register />,
    layout: "/auth",
  },
  {
    path: "/forgot-password",
    component: <ForgotPassword />,
    layout: "/password-reset",
  }
  
];
export default routes;
