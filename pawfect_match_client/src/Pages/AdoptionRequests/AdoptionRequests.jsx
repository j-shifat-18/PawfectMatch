import { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const AdoptionRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  // Fetch incoming adoption requests for owner
  useEffect(() => {
    if (user?.email) {
      axiosSecure
        .get(`/adoption-requests/${user.email}`)
        .then((res) => setRequests(res.data))
        .catch((err) => console.error("Error fetching requests:", err));
    }
  }, [user?.email, axiosSecure]);

  const handleAccept = async (request) => {
    try {
      const petId = request.petId;
      const newOwnerEmail = request.requestedBy.email;

      // 1. Update pet document
      await axiosSecure.patch(`/pets/${petId}/transfer`, {
        newOwnerEmail,
      });

      // 2. Mark request as accepted
      await axiosSecure.patch(`/adoption-requests/${request._id}/status`, {
        status: "accepted",
      });

      // 3. Remove from UI
      setRequests((prev) => prev.filter((r) => r._id !== request._id));

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Request has been approved.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to accept the request.", "error");
    }
  };

  const handleReject = async (request) => {
    try {
      // 1. Mark request as rejected
      await axiosSecure.patch(`/adoption-requests/${request._id}/status`, {
        status: "rejected",
      });

      // 2. Remove from UI
      setRequests((prev) => prev.filter((r) => r._id !== request._id));

      Swal.fire({
        position: "top-end",
        icon: "success",
        title: "Request has been rejected.",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to reject the request.", "error");
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center text-xl font-semibold mt-10">
        No incoming adoption requests right now 🐶
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-6">
      <h2 className="text-2xl font-bold mb-4">Incoming Adoption Requests 📨</h2>
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Pet Name</th>
            <th>Requester</th>
            <th>Email</th>
            <th>Requested At</th>
            <th>Actions</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <tr key={req._id}>
              <td>{index + 1}</td>
              <td>{req.petName}</td>
              <td>{req.requestedBy.name}</td>
              <td>{req.requestedBy.email}</td>
              <td>{new Date(req.requestedAt).toLocaleString()}</td>
              <td className="space-x-2 flex flex-col md:flex-row">
                <button
                  className="btn btn-primary text-sm btn-sm px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-colors"
                  onClick={() => handleAccept(req)}
                >
                  Accept
                </button>
                <button
                  className="btn btn-error  btn-sm px-6 py-2 rounded-full font-semibold hover:btn-secondary text-white transition-colors text-sm"
                  onClick={() => handleReject(req)}
                >
                  Reject
                </button>
              </td>
              <td>
                <button
                  className="btn bg-gradient-to-r from-cyan-400 to-blue-500 btn-sm px-6 py-2 rounded-full font-semibold hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 text-white transition-colors text-sm"
                  onClick={() => {
                    navigate(`/dashboard/profile/${req.requestedBy.email}`)
                    // Placeholder: navigate to profile or open modal
                    // Swal.fire({
                    //   position: "top-end",
                    //   icon: "success",
                    //   title: "Coming soon!Profile viewing not implemented",
                    //   showConfirmButton: false,
                    //   timer: 1500,
                    // });
                    // Swal.fire();
                  }}
                >
                  Visit Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdoptionRequests;
