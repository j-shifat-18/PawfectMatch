import { useEffect, useState } from "react";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import useAuth from "../../Hooks/useAuth";
import { Link } from "react-router";

const Cart = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      axiosSecure
        .get(`/cart?email=${user.email}`)
        .then((res) => {
          setCartItems(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load cart items", err);
          setLoading(false);
        });
    }
  }, [user?.email, axiosSecure]);

  if (loading) {
    return <div className="text-center py-10">Loading cart items...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto ">
      <h2 className="text-3xl font-bold mb-6 text-center">🛒 My Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center text-lg">Your cart is empty.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cartItems.map((item) => (
            <div key={item._id} className="bg-white rounded-xl shadow-lg overflow-hidden z-1">
              <figure>
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-48 object-cover"
                />
              </figure>
              <div className="p-4">
                <h3 className="text-xl font-bold mb-1">{item.productName}</h3>
                <p className="text-gray-600 mb-3">Price: ${item.price}</p>
                <Link
                  to={`/checkout/${item._id}`}
                  className="btn btn-primary w-full"
                >
                  Pay Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;
