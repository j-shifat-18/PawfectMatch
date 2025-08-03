import { createBrowserRouter } from "react-router";
import RootLayout from "../Layouts/RootLayout/RootLayout";
import Home from "../Pages/Home/Home/Home";
import AuthLayout from "../Layouts/AuthLayout/AuthLayout";
import Login from "../Pages/Auth/Login/Login";
import Register from "../Pages/Auth/Register/Register";
import Adopt from "../Pages/Adopt/Adopt";
import Shop from "../Pages/Shop/Shop";
import Favourites from "../Pages/Favourites/Favourites";
import DashboardLayout from "../Layouts/DashboardLayout/DashboardLayout";
import DashboardWelcome from "../Pages/DashboardWelcome/DashboardWelcome";
import CreatePetAccount from "../Pages/CreatePetAccount/CreatePetAccount";
import UserProtectedRoute from "../Routes/UserProtectedRoute";
import MyPets from "../Pages/MyPets/MyPets";
import CreateAdoptionPost from "../Pages/CreateAdoptionPost/CreateAdoptionPost";
import ErrorPage from "../Components/Error/ErrorPage";
import AdoptionRequests from "../Pages/AdoptionRequests/AdoptionRequests";
import UserProfile from "../Pages/UserProfile/UserProfile";
import AdminProfile from "../Pages/AdminProfile/AdminProfile";
import AdminProtectedRoutes from "../Routes/AdminProtectedRoutes";
import ManageMembers from "../Pages/ManageMembers/ManageMembers";
import OrderRequests from "../Pages/OrderRequests/OrderRequests";
import ManageCoupons from "../Pages/ManageCoupons/ManageCoupons";
import ManageUsers from "../Pages/ManageUsers/ManageUsers";
import AddProduct from "../Pages/AddProduct/AddProduct";
import Cart from "../Pages/Cart/Cart";
import CheckoutWrapper from "../Pages/Checkout/CheckoutWrapper";
import MyOrders from "../Pages/MyOrders/MyOrders";
import Chat from "../Pages/Chat/Chat";
import SwipeCards from "../Pages/SwipeCards/SwipeCards";
import ForgetPassword from "../Pages/Auth/ForgetPassword/ForgetPassword";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        index: true,
        path: "/",
        element: <Home></Home>,
      },
      {
        path: "adopt",
        element: <Adopt></Adopt>,
      },
      {
        path: "shop",
        element: <Shop></Shop>,
      },
      {
        path: "favourites",
        element: <Favourites></Favourites>,
      },
      {
        path: "SwipeCards",
        element: (
          <UserProtectedRoute>
            <SwipeCards></SwipeCards>
          </UserProtectedRoute>
        ),
      },
      {
        path: "order/cart",
        element: (
          <UserProtectedRoute>
            <Cart></Cart>
          </UserProtectedRoute>
        ),
      },
      {
        path: "checkout/:id",
        element: (
          <UserProtectedRoute>
            <CheckoutWrapper></CheckoutWrapper>
          </UserProtectedRoute>
        ),
      },
      {
        path: "chat",
        element: (
          <UserProtectedRoute>
            <Chat />
          </UserProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout></AuthLayout>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        path: "login",
        element: <Login></Login>,
      },
      {
        path: "register",
        element: <Register></Register>,
      },
      {
        path:"forgetPassword",
        element:<ForgetPassword></ForgetPassword>
      }
    ],
  },
  {
    path: "/dashboard",
    element: <DashboardLayout></DashboardLayout>,
    errorElement: <ErrorPage></ErrorPage>,
    children: [
      {
        index: true,
        element: <DashboardWelcome></DashboardWelcome>,
      },
      {
        path: "create-pet-account",
        element: (
          <UserProtectedRoute>
            <CreatePetAccount></CreatePetAccount>
          </UserProtectedRoute>
        ),
      },
      {
        path: "my-pets",
        element: (
          <UserProtectedRoute>
            <MyPets></MyPets>
          </UserProtectedRoute>
        ),
      },
      {
        path: "create-adoption-post/:id",
        element: (
          <UserProtectedRoute>
            <CreateAdoptionPost></CreateAdoptionPost>
          </UserProtectedRoute>
        ),
      },
      {
        path: "adoption-requests",
        element: (
          <UserProtectedRoute>
            <AdoptionRequests></AdoptionRequests>
          </UserProtectedRoute>
        ),
      },
      {
        path: "profile/:email",
        element: (
          <UserProtectedRoute>
            <UserProfile></UserProfile>
          </UserProtectedRoute>
        ),
      },
      {
        path: "my-profile/:email",
        element: (
          <UserProtectedRoute>
            <UserProfile></UserProfile>
          </UserProtectedRoute>
        ),
      },
      {
        path: "admin-profile",
        element: (
          <AdminProtectedRoutes>
            <AdminProfile></AdminProfile>
          </AdminProtectedRoutes>
        ),
      },
      {
        path: "manage-users",
        element: (
          <AdminProtectedRoutes>
            <ManageUsers></ManageUsers>
          </AdminProtectedRoutes>
        ),
      },
      {
        path: "order-requests",
        element: (
          <AdminProtectedRoutes>
            <OrderRequests></OrderRequests>
          </AdminProtectedRoutes>
        ),
      },
      {
        path: "manage-coupons",
        element: (
          <AdminProtectedRoutes>
            <ManageCoupons></ManageCoupons>
          </AdminProtectedRoutes>
        ),
      },
      {
        path: "add-product",
        element: (
          <AdminProtectedRoutes>
            <AddProduct></AddProduct>
          </AdminProtectedRoutes>
        ),
      },
      {
        path: "my-orders",
        element: (
          <UserProtectedRoute>
            <MyOrders></MyOrders>
          </UserProtectedRoute>
        ),
      },
    ],
  },
]);
