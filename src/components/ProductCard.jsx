import { useNavigate } from "react-router-dom";
import { getProductImage } from "../utils/imageUtils";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="group bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500 border border-gray-100 flex flex-col h-full relative overflow-hidden cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="w-full aspect-square overflow-hidden rounded-[1.5rem] bg-gray-50 mb-4 relative">
        <img
          src={getProductImage(product.img)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/400?text=No+Image'; }}
          loading="lazy"
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col flex-1 px-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-[15px] font-bold text-gray-800 leading-tight group-hover:text-brand transition-colors">
            {product.name}
          </h3>
          <span className="text-brand font-black text-lg whitespace-nowrap">
            ₹{product.price}
          </span>
        </div>
      </div>
    </div>
  );
}
