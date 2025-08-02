import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { FaUsers, FaPaw, FaClipboardList, FaBox, FaMoneyBill } from "react-icons/fa";

const COLORS = ["#FF8904", "#FF5E00", "#FFAA33", "#FFCC70", "#FFC93C"];



const AdminProfile = () => {
  const axiosSecure = useAxiosSecure();

  const {
    data: adoptionPosts = [],
  } = useQuery({
    queryKey: ["adoption-posts"],
    queryFn: async () => {
      const res = await axiosSecure.get("/adoption-posts");
      return res.data;
    },
  });

  const { data: pets = [] } = useQuery({
    queryKey: ["pets"],
    queryFn: async () => {
      const res = await axiosSecure.get("/pets");
      return res.data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await axiosSecure.get("/products");
      return res.data;
    },
  });

  const { data: payments = [] } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await axiosSecure.get("/payments");
      return res.data;
    },
  });

  const totalRevenue = useMemo(() => payments.reduce((sum, p) => sum + (p.finalPrice || 0), 0), [payments]);

  const dailyRevenueData = useMemo(() => {
    const daily = {};
    payments.forEach((p) => {
      const date = new Date(p.payment_date).toLocaleDateString();
      daily[date] = (daily[date] || 0) + p.finalPrice;
    });
    return Object.entries(daily).map(([date, total]) => ({ date, total }));
  }, [payments]);

  const summary = [
    { icon: <FaUsers className="text-4xl text-indigo-500" />, label: "Users", value: 120 },
    { icon: <FaClipboardList className="text-4xl text-purple-500" />, label: "Adoption Posts", value: adoptionPosts.length },
    { icon: <FaPaw className="text-4xl text-orange-400" />, label: "Total Pets", value: pets.length },
    { icon: <FaBox className="text-4xl text-pink-400" />, label: "Products", value: products.length },
    { icon: <FaMoneyBill className="text-4xl text-green-500" />, label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}` },
  ];

  return (
    <div className="p-8 space-y-10 bg-gradient-to-br from-secondary/10 to-white min-h-screen">
      <motion.h1
        className="text-4xl font-extrabold text-gray-800 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Admin Dashboard Overview
      </motion.h1>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {summary.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            className="bg-white shadow-xl border-t-4 border-indigo-400 rounded-3xl p-6 flex flex-col items-center text-center"
          >
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-sm text-gray-500">{item.label}</h3>
            <p className="text-2xl font-bold text-gray-700 mt-1">{item.value}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12">
        <motion.div
          className="bg-white rounded-3xl shadow-lg p-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Daily Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <RechartTooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#FF8904" strokeWidth={3} dot={{ r: 5 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          className="bg-white rounded-3xl shadow-lg p-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold mb-4 text-gray-700">Pet Types Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.values(
                  pets.reduce((acc, pet) => {
                    const type = pet.type.toLowerCase();
                    acc[type] = acc[type] || { name: type, value: 0 };
                    acc[type].value++;
                    return acc;
                  }, {})
                )}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {Object.values(
                  pets.reduce((acc, pet) => {
                    const type = pet.type.toLowerCase();
                    acc[type] = acc[type] || { name: type, value: 0 };
                    acc[type].value++;
                    return acc;
                  }, {})
                ).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartTooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminProfile;
