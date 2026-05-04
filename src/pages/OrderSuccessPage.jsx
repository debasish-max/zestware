import { Link } from "react-router-dom";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function OrderSuccessPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-[#fffcf7]">
      <div className={`max-w-md w-full text-center transition-all duration-1000 transform ${show ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 bg-brand/20 rounded-full blur-2xl animate-pulse" />
          <div className="relative bg-white rounded-full p-6 shadow-2xl shadow-brand/10 border border-gray-100">
            <CheckCircle size={80} className="text-brand animate-in zoom-in duration-500" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">
          Order Placed!
        </h1>

        <p className="text-gray-500 text-lg font-medium mb-10 leading-relaxed">
          Thank you for your purchase. Your premium apparel will be ready soon. You can track your order in your profile.
        </p>

        <div className="flex flex-col gap-4">
          <Link
            to="/"
            className="group bg-brand text-white py-4 px-8 rounded-2xl font-black text-lg shadow-xl shadow-brand/20 hover:bg-gray-800 transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
          >
            <ShoppingBag size={20} />
            Continue to Shop
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/orders"
            className="bg-white text-gray-700 py-4 px-8 rounded-2xl font-black text-lg border-2 border-gray-100 hover:border-brand hover:text-brand transition-all duration-300 active:scale-95"
          >
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
