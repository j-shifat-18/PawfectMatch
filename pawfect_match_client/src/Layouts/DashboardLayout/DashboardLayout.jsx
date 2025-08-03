import { FaBars, FaPaw } from "react-icons/fa";
import { NavLink, Outlet } from "react-router";

import { useQuery } from "@tanstack/react-query";

import {
  UserCog,
  Users,
  FileSignature,
  BadgePercent,
  Megaphone,
  CreditCard,
  ReceiptText,
  UserCircle,
  Cat,
  UserPen,
  FolderPlus,
  ShoppingBag,
} from "lucide-react";
import useAuth from "../../Hooks/useAuth";
import Loader from "../../Components/Loader/Loader";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import PawfectMatchLogo from "../../Components/PawfectMatchLogo/PawfectMatchLogo";
import useOfflineSync from "../../Hooks/useOfflineSync";

const DashboardLayout = () => {
  useOfflineSync();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: userRole, isLoading } = useQuery({
    queryKey: ["users", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users?email=${user.email}`);
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-2 py-2 rounded-lg ${
      isActive ? "bg-secondary" : ""
    }`;

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Soft Yellow Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
      radial-gradient(circle at center, #FFB347 0%, transparent 50%)
    `,
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      {/* Content/Components */}
      <div className="drawer lg:drawer-open">
        {/* Drawer Toggle Button (Visible on small/medium) */}
        <input
          id="dashboard-drawer"
          type="checkbox"
          className="drawer-toggle"
        />

        <div className="drawer-content flex flex-col">
          {/* Top Navbar */}
          <div className="w-full p-4 bg-base-200 flex justify-between items-center lg:hidden">
            <label htmlFor="dashboard-drawer" className="btn btn-ghost text-xl">
              <FaBars />
            </label>
            <h2 className="text-lg font-bold">Dashboard</h2>
          </div>

          {/* Main Content */}
          <div className="p-4">
            <Outlet />
          </div>
        </div>

        {/* Side Drawer */}
        <div className="drawer-side">
          <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content text-xl">
            <div className="mb-5">
              <PawfectMatchLogo></PawfectMatchLogo>
            </div>

            {/* User navigation */}
            {userRole?.role === "user" && (
              <>
                <li>
                  <NavLink
                    to={`/dashboard/my-profile/${user.email}`}
                    className={linkClass}
                  >
                    <UserPen className="w-5 h-5" />
                    My Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/create-pet-account"
                    className={linkClass}
                  >
                    <Cat className="w-5 h-5" />
                    Create Pet Account
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/my-pets" className={linkClass}>
                    <FaPaw className="w-5 h-5" />
                    My Pets
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/adoption-requests"
                    className={linkClass}
                  >
                    <FaPaw className="w-5 h-5" />
                    Adoption Requests
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/my-orders" className={linkClass}>
                    <ShoppingBag className="w-5 h-5" />
                    My Orders
                  </NavLink>
                </li>
              </>
            )}

            {/* Admin navigation */}
            {userRole?.role === "admin" && (
              <>
                <li>
                  <NavLink to="/dashboard/admin-profile" className={linkClass}>
                    <UserCog className="w-5 h-5" />
                    Admin Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/manage-users" className={linkClass}>
                    <Users className="w-5 h-5" />
                    Manage Users
                  </NavLink>
                </li>
                {/* <li>
                <NavLink
                  to="/dashboard/make-announcement"
                  className={linkClass}
                >
                  <Megaphone className="w-5 h-5" />
                  Make Announcements
                </NavLink>
              </li> */}
                <li>
                  <NavLink to="/dashboard/add-product" className={linkClass}>
                    <FolderPlus className="w-5 h-5" />
                    Add Product
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/order-requests" className={linkClass}>
                    <FileSignature className="w-5 h-5" />
                    Order Requests
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/manage-coupons" className={linkClass}>
                    <BadgePercent className="w-5 h-5" />
                    Manage Coupons
                  </NavLink>
                </li>
              </>
            )}

            {/* Announcements (available to all roles) */}
            {/* <li>
            <NavLink to="/dashboard/announcements" className={linkClass}>
              <Megaphone className="w-5 h-5" />
              Announcements
            </NavLink>
          </li> */}
          </ul>
        </div>
      </div>
      z
    </div>
  );
};

export default DashboardLayout;
