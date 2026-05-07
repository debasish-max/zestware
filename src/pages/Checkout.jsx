import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Loader2, Phone, MapPin, User, ChevronLeft, CreditCard, QrCode } from "lucide-react";
import { getProductImage } from "../utils/imageUtils";

export default function Checkout({ setToast }) {
  const { cart, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryFee = 30;
  const finalTotal = total + deliveryFee;

  useEffect(() => {
    if (!user) {
      setToast("Please login to access checkout");
      navigate("/login");
    }
  }, [user, navigate, setToast]);

  const handleProceedToPayment = () => {
    if (!customerName || !contact || !address) {
      setToast("Please fill in all billing details");
      return;
    }

    // Pass data to payment page
    navigate("/payment", {
      state: {
        orderData: {
          customer_name: customerName,
          contact_number: contact,
          address: address,
          items: cart,
          total_amount: finalTotal,
          user_id: user?.id || null,
        }
      }
    });
  };

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center gap-2 text-gray-500 font-bold hover:text-brand transition-colors mb-4"
          >
            <ChevronLeft size={20} />
            Back to Cart
          </button>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Checkout</h1>
        </div>

        <div className="space-y-8">
          {/* Billing Details Form */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <MapPin className="text-brand" size={24} />
              Billing Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all outline-none font-bold text-gray-700"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input
                  type="tel"
                  placeholder="Contact Number"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all outline-none font-bold text-gray-700"
                />
              </div>

              <div className="relative md:col-span-2">
                <MapPin className="absolute left-4 top-6 text-gray-300" size={20} />
                <textarea
                  placeholder="Detailed Delivery Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-brand/5 focus:border-brand transition-all outline-none font-bold text-gray-700 min-h-[120px]"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
              <CreditCard className="text-brand" size={24} />
              Order Summary
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.name} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                      <img 
                        src={getProductImage(item.img)} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 leading-tight">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Qty: {item.qty}</p>
                        {item.selectedSize && (
                          <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">
                            SIZE: {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-black text-gray-800">₹{item.price * item.qty}</p>
                </div>
              ))}

              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span className="text-gray-800">₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Delivery Fee</span>
                  <span className="text-gray-800">₹{deliveryFee}</span>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <span className="text-xl font-black text-gray-800">Total Amount</span>
                  <span className="text-3xl font-black text-brand">₹{finalTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Notice & Action */}
          <div className="bg-brand/5 border border-brand/10 rounded-[32px] p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0 text-brand">
                <QrCode size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-800">Online Payment Only</h3>
                <p className="text-gray-600 font-medium mt-1 leading-relaxed">
                  To ensure fast processing, we currently only accept online payments.
                  In the next step, you'll be able to scan a QR code or use a Google Pay link to complete your transaction.
                </p>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="w-full bg-brand text-white py-6 rounded-2xl font-black text-xl shadow-xl shadow-brand/20 hover:bg-gray-900 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Proceed to Payment
              <CreditCard size={24} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
