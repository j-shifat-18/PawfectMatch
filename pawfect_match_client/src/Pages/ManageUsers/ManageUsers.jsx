import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaUserShield, FaUserTimes } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await axiosSecure.get("/users");
      return res.data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ email, updatedData }) => {
      const res = await axiosSecure.patch(`/users/${email}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["all-users"]);
    },
  });

  const handleRoleToggle = (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    Swal.fire({
      title: `Make ${user.name} ${newRole}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then((result) => {
      if (result.isConfirmed) {
        updateUserMutation.mutate({
          email: user.email,
          updatedData: { role: newRole },
        });
        Swal.fire("Updated!", `${user.name} is now a ${newRole}`, "success");
      }
    });
  };

  const handleBlockUser = (user) => {
    Swal.fire({
      title: `Block ${user.name}?`,
      text: "This will restrict their access.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Block",
    }).then((result) => {
      if (result.isConfirmed) {
        updateUserMutation.mutate({
          email: user.email,
          updatedData: { role: "blocked" },
        });
        Swal.fire("Blocked!", `${user.name} has been blocked.`, "success");
      }
    });
  };

  if (isLoading) {
    return <div className="text-center py-10 text-xl font-bold">Loading users...</div>;
  }

  return (
    <motion.div
      className="p-4 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Manage Users</h2>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="table table-zebra w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th>#</th>
              <th>Photo</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Last Login</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id} className="hover">
                <th>{index + 1}</th>
                <td>
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={user.photoURL} alt="User" />
                    </div>
                  </div>
                </td>
                <td className="font-medium">{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <p
                    className={`badge p-3 text-white ${
                      user.role === "admin"
                        ? "badge-success"
                        : user.role === "blocked"
                        ? "badge-error"
                        : "badge-info"
                    }`}
                  >
                    {user.role}
                  </p>
                </td>
                <td>{new Date(user.created_at).toLocaleString()}</td>
                <td>{new Date(user.last_log_in).toLocaleString()}</td>
                <td>
                  <div className="flex items-center gap-2 justify-center">
                    {user.role !== "blocked" && (
                      <button
                        className="btn rounded-full btn-outline btn-error hover:text-white"
                        onClick={() => handleBlockUser(user)}
                      >
                        <FaUserTimes /> Block
                      </button>
                    )}
                    <button
                      className="btn btn-outline rounded-full btn-primary "
                      onClick={() => handleRoleToggle(user)}
                    >
                      {user.role === "admin" ? (
                        <>
                          <MdAdminPanelSettings /> Remove Admin
                        </>
                      ) : (
                        <>
                          <FaUserShield /> Make Admin
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default ManageUsers;
