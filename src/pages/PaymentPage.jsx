import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { supabase } from "../lib/supabase";
import { 
  ChevronLeft, CreditCard, QrCode, Copy, 
  CheckCircle2, Loader2, ShieldCheck, Smartphone
} from "lucide-react";

export default function PaymentPage({ setToast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate("/checkout");
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  const upiId = "zestware@upi";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    if (setToast) {
      setToast("UPI ID copied to clipboard!");
      setTimeout(() => {
        setCopied(false);
        setToast("");
      }, 2000);
    }
  };

  const handleFinalizeOrder = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("orders").insert([
        {
          ...orderData,
          status: "pending",
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      clearCart();
      navigate("/order-success");
    } catch (error) {
      console.error("Error saving order:", error);
      if (setToast) {
        setToast(`Error: ${error.message || "Failed to save order"}`);
        setTimeout(() => setToast(""), 4000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 md:py-20">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <button 
            onClick={() => navigate("/checkout")}
            className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-brand transition-colors mb-6"
          >
            <ChevronLeft size={20} />
            Back to Checkout
          </button>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight mb-4">Complete Payment</h1>
          <p className="text-gray-500 font-medium">Finalize your order by making a secure online payment</p>
        </div>

        <div className="space-y-6">
          {/* Amount Card */}
          <div className="bg-gray-50 rounded-[32px] p-8 border border-gray-100 flex flex-col items-center text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">Total Amount to Pay</p>
            <div className="text-5xl font-black text-brand mb-2">₹{orderData.total_amount}</div>
            <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
              <ShieldCheck size={16} className="text-green-500" />
              Secure Payment Verification
            </div>
          </div>

          {/* Payment Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* QR Code Section */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-6">
                <QrCode size={24} />
              </div>
              <h3 className="font-black text-gray-800 mb-4">Scan QR Code</h3>
              <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-100 relative group overflow-hidden">
                <div className="flex flex-col items-center text-gray-300 group-hover:text-brand transition-colors">
                  <QrCode size={100} strokeWidth={1} />
                  <p className="text-[10px] font-black uppercase tracking-widest mt-2">Display QR here</p>
                </div>
                {/* Visual Accent */}
                <div className="absolute inset-0 border-2 border-brand/20 rounded-2xl pointer-events-none" />
              </div>
              <p className="mt-4 text-xs text-gray-400 font-bold text-center">Scan using any UPI App (GPay, PhonePe, etc.)</p>
            </div>

            {/* UPI / GPay ID Section */}
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex flex-col items-center">
              <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center text-brand mb-6">
                <Smartphone size={24} />
              </div>
              <h3 className="font-black text-gray-800 mb-4">Pay via UPI ID</h3>
              
              <div className="w-full space-y-4">
                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 text-center relative overflow-hidden group">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Our Official UPI ID</p>
                  <p className="text-xl font-black text-gray-800 select-all">{upiId}</p>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-brand hover:scale-105 transition-all"
                  >
                    {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>
                
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                    <Smartphone size={20} />
                  </div>
                  <div className="text-xs font-bold text-blue-700 leading-relaxed">
                    Open your Google Pay app and pay to the UPI ID above.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              onClick={handleFinalizeOrder}
              disabled={isSubmitting}
              className="w-full bg-brand text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-brand/20 hover:bg-gray-900 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Confirm & Complete Order
                  <CheckCircle2 size={24} />
                </>
              )}
            </button>
            <p className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              By clicking above, you confirm that you have made the payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
