import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

const ManageCoupons = () => {
  const axiosSecure = useAxiosSecure();
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: coupons = [], refetch } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const res = await axiosSecure.get("/coupons");
      return res.data;
    },
  });

  const onSubmit = async (data) => {
    try {
      await axiosSecure.post("/coupons", data);
      Swal.fire("Success!", "Coupon added successfully", "success");
      reset();
      setShowModal(false);
      refetch();
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.message || "Failed to add", "error");
    }
  };

  const handleDateUpdate = async (id, newDate) => {
    try {
      await axiosSecure.patch(`/coupons/${id}`, { expireDate: newDate });
      Swal.fire("Updated!", "Coupon expiry updated", "success");
      refetch();
    } catch (err) {
      Swal.fire("Error", "Could not update", "error");
    }
  };

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Manage Coupons</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          Add Coupon
        </button>
      </div>

      {/* Coupon Table */}
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="table table-zebra w-full text-sm">
          <thead className="bg-base-200 text-base font-semibold">
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Code</th>
              <th>Discount (%)</th>
              <th>Expire Date</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon._id}>
                <td>{coupon.title}</td>
                <td>{coupon.description}</td>
                <td><span className="badge badge-primary">{coupon.code}</span></td>
                <td>{coupon.discount}</td>
                <td>
                  <input
                    type="date"
                    defaultValue={coupon.expireDate?.slice(0, 10)}
                    className="input input-bordered input-sm"
                    onBlur={(e) => handleDateUpdate(coupon._id, e.target.value)}
                  />
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-success text-white"
                    onClick={() =>
                      handleDateUpdate(
                        coupon._id,
                        document.getElementById(`date-${coupon._id}`).value
                      )
                    }
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Coupon Modal */}
      {showModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Coupon</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 mt-4">
              <input
                {...register("title", { required: true })}
                type="text"
                placeholder="Title"
                className="input input-bordered w-full"
              />
              <textarea
                {...register("description")}
                placeholder="Description"
                className="textarea textarea-bordered w-full"
              />
              <input
                {...register("code", { required: true })}
                type="text"
                placeholder="Coupon Code"
                className="input input-bordered w-full"
              />
              <input
                {...register("discount", { required: true })}
                type="number"
                placeholder="Discount %"
                className="input input-bordered w-full"
              />
              <input
                {...register("expireDate", { required: true })}
                type="date"
                className="input input-bordered w-full"
              />
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </motion.div>
  );
};

export default ManageCoupons;
