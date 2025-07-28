import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import useAuth from "../../Hooks/useAuth";
import Swal from "sweetalert2";

const Checkout = () => {
  const { id } = useParams();
  const stripe = useStripe();
  const elements = useElements();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosSecure.get(`/orders/${id}`).then((res) => {
      setOrder(res.data);

      axiosSecure
        .post("/create-payment-intent", {
          price: res.data.price,
        })
        .then((res) => {
          setClientSecret(res.data.clientSecret);
        });
    });
  }, [id, axiosSecure]);

  const handleApplyCoupon = () => {
    if (!couponCode) return;

    axiosSecure
      .get(`/validate-coupon/${couponCode}`)
      .then((res) => {
        if (res.data.valid) {
          setDiscountPercent(res.data.discount);
          Swal.fire("Success", `Coupon applied: ${res.data.discount}% off`, "success");
        }
      })
      .catch((err) => {
        Swal.fire("Error", err.response?.data?.message || "Invalid coupon", "error");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !order) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          name: user?.displayName || "Anonymous",
          email: user?.email,
        },
      },
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      if (result.paymentIntent.status === "succeeded") {
        await axiosSecure.patch(`/orders/paid/${id}`);
        Swal.fire("Success", "Payment completed!", "success");
        // navigate("/dashboard/payment-history");
      }
    }
  };

  if (!order) return <div>Loading...</div>;

  const finalPrice = order.price - (order.price * discountPercent) / 100;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white/70 shadow rounded-xl z-10 relative">
      <h2 className="text-2xl font-bold mb-4">Checkout</h2>

      <p className="mb-2">Product: {order.productName}</p>
      <p className="mb-2">Original Price: ${order.price.toFixed(2)}</p>
      {discountPercent > 0 && (
        <p className="mb-2 text-green-600">Discount Applied: {discountPercent}%</p>
      )}
      <p className="mb-4 font-bold">Total: ${finalPrice.toFixed(2)}</p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter coupon code"
          className="input input-bordered w-full"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
        />
        <button className="btn btn-outline" onClick={handleApplyCoupon}>
          Apply
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <CardElement className="border p-4 rounded-md" />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button className="btn btn-primary mt-4 w-full" type="submit" disabled={!stripe || !clientSecret}>
          Pay ${finalPrice.toFixed(2)}
        </button>
      </form>
    </div>
  );
};

export default Checkout;