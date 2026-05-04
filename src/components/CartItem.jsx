import { useCart } from "../context/CartContext";
import { Plus, Minus, Trash2 } from "lucide-react";
import { getProductImage } from "../utils/imageUtils";

export default function CartItem({ item }) {
  const { increaseQty, decreaseQty, removeItem } = useCart();

  return (
    <div className="flex items-center gap-4 py-6 border-b border-gray-100 group">
      {/* Product Image */}
      <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 group-hover:border-brand/20 transition-colors">
        <img 
          src={getProductImage(item.img)} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-800 text-lg line-clamp-1">{item.name}</h3>
          <button
            type="button"
            onClick={() => removeItem(item.name)}
            className="text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
        
        <p className="text-brand font-black text-lg">₹{item.price}</p>
        
        <div className="flex items-center justify-between mt-3">
          {/* Quantity Controls */}
          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
            <button
              type="button"
              onClick={() => decreaseQty(item.name)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-500 transition-all active:scale-90"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center font-bold text-gray-700 text-sm">{item.qty}</span>
            <button
              type="button"
              onClick={() => increaseQty(item.name)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-gray-500 transition-all active:scale-90"
            >
              <Plus size={14} />
            </button>
          </div>
          
          <p className="font-black text-gray-400 text-sm">
            Total: <span className="text-gray-800">₹{item.price * item.qty}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
