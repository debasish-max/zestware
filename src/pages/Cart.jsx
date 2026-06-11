import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import { ShoppingBag, ArrowRight, XCircle, ShoppingCart } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addDays, format } from "date-fns";

export default function Cart({ setToast }) {
  const { user } = useAuth();
  const { cart, total, clearCart } = useCart();
  const navigate = useNavigate();
  const deliveryFee = cart.length > 0 ? (total >= 1300 ? 0 : 50) : 0;
  const finalTotal = total + deliveryFee;
  const deliveryDate = format(addDays(new Date(), 10), "dd MMM yyyy");

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
          <ShoppingCart className="text-gray-300" size={40} />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-xs">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/"
          className="bg-brand text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-brand/20 flex items-center gap-2"
        >
          Go to Shop
          <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
              Your Cart
              <span className="text-lg font-bold text-gray-400">({cart.length})</span>
            </h2>
            <button
              onClick={clearCart}
              className="text-red-500 font-bold text-sm flex items-center gap-1 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <XCircle size={16} />
              Cancel All
            </button>
          </div>

          <div className="space-y-2">
            {cart.map((item) => (
              <CartItem key={`${item.name}-${item.selectedSize}`} item={item} />
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full md:w-[350px]">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 sticky top-24 shadow-sm">
            <h3 className="text-xl font-black text-gray-800 mb-6">Order Summary</h3>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Subtotal</span>
                <span className="text-gray-800">₹{total}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? "text-green-600" : "text-gray-800"}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black text-gray-800">Total</span>
                  <span className="text-2xl font-black text-brand">₹{finalTotal}</span>
                </div>
                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mt-4 bg-green-50/50 w-full py-3 rounded-xl border border-green-100/50 text-center">
                  Estimated Delivery: {deliveryDate}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  setToast("Please login to proceed to checkout");
                  navigate("/login");
                  return;
                }
                navigate("/checkout");
              }}
              className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-opacity shadow-lg shadow-brand/20 group"
            >
              Checkout
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <p className="mt-6 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Secure Checkout • 256-bit SSL
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
