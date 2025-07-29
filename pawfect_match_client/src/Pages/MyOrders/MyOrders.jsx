import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import { FaCheckCircle } from "react-icons/fa";
import Loader from "../../Components/Loader/Loader";

const MyOrders = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["myOrders", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/orders?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  if(isLoading) return <Loader></Loader>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 md:p-8"
    >
      <h2 className="text-2xl font-bold mb-4 text-center">My Paid Orders</h2>

      <div className="overflow-x-auto rounded-lg shadow border border-base-300">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200 text-base font-semibold text-center">
            <tr>
              <th>Image</th>
              <th>Product</th>
              <th>Price</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Payment Date</th>
              <th>Txn ID</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="text-center">
                <td>
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="font-medium">{order.productName}</td>
                <td>${order.price}</td>
                <td>
                  <span className="badge badge-success gap-1">
                    <FaCheckCircle className="text-white" /> Paid
                  </span>
                </td>
                <td>
                  <span className="badge badge-ghost">
                    {new Date(order.order_date).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span className="badge badge-info text-white">
                    {new Date(order.payment_date).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span className="badge badge-primary text-white">
                    {order.transactionId?.slice(0, 15)}...
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MyOrders;
