import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

const OrderRequests = () => {
  const axiosSecure = useAxiosSecure();
  const [refresh, setRefresh] = useState(false);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["allPaidOrders", refresh],
    queryFn: async () => {
      const res = await axiosSecure.get("/orders?status=paid");
      return res.data;
    },
  });

  useEffect(() => {
    refetch();
  }, [refresh, refetch]);

  const handleStatusChange = async (id, status) => {
    const confirm = await Swal.fire({
      title: `Are you sure to mark as ${status}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: status === "delivered" ? "#10B981" : "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Yes, ${status}!`,
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axiosSecure.patch(`/orders/${id}`, {
          status,
        });
        if (res.data.modifiedCount || res.data.status === status) {
          Swal.fire("Success", `Order marked as ${status}`, "success");
          setRefresh(!refresh);
        }
      } catch (err) {
        Swal.fire("Error", "Something went wrong!", "error");
      }
    }
  };

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-4">All Order Requests</h2>

      {isLoading ? (
        <span className="loading loading-dots loading-lg text-center block" />
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="table table-zebra w-full text-sm">
            <thead className="bg-base-200 text-base font-semibold">
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Price</th>
                <th>Order Date</th>
                <th>Payment Date</th>
                <th>Transaction ID</th>
                <th>Delivery Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, i) => (
                <tr key={order._id}>
                  <td>{i + 1}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <img
                        src={order.productImage}
                        alt={order.productName}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <span>{order.productName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-accent">${order.price}</span>
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString()}</td>
                  <td>{new Date(order.payment_date).toLocaleDateString()}</td>
                  <td className="text-xs"><span className="bg-primary px-2 py-1 rounded-lg text-white">{order.transactionId}</span></td>
                  <td>
                    <span
                      className={`badge text-white ${
                        order.delivery_status === "delivered"
                          ? "badge-success"
                          : order.delivery_status === "rejected"
                          ? "badge-error"
                          : "badge-warning"
                      }`}
                    >
                      {order.delivery_status}
                    </span>
                  </td>
                  <td className="space-x-2">
                    <button
                      onClick={() =>
                        handleStatusChange(order._id, "delivered")
                      }
                      className="btn btn-sm rounded-full text-white btn-primary"
                      disabled={order.delivery_status !== "pending"}
                    >
                      Deliver
                    </button>
                    <button
                      onClick={() => handleStatusChange(order._id, "rejected")}
                      className="btn btn-sm rounded-full text-white btn-error"
                      disabled={order.delivery_status !== "pending"}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default OrderRequests;
