import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import {
  ShoppingCart, ChevronLeft, ChevronRight,
  Minus, Plus, ShieldCheck, Truck, RefreshCw
} from "lucide-react";
import { getProductImage } from "../utils/imageUtils";

export default function ProductDetails({ setToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [thumbOffset, setThumbOffset] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error.message);
      setToast("Product not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const getImages = (img) => {
    if (!img) return [];
    if (Array.isArray(img)) return img;
    if (typeof img === 'string' && img.startsWith('[')) {
      try { return JSON.parse(img); } catch (e) { }
    }
    return [img];
  };

  const images = getImages(product?.img);
  const visibleThumbs = images.slice(thumbOffset, thumbOffset + 4);

  const handleAddToCart = () => {
    if (!selectedSize && product?.sizes?.length > 0) {
      setToast("Please select a size");
      return;
    }
    addToCart({ ...product, selectedSize, qty: quantity });
    setToast("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white pb-20 pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm font-bold text-gray-400 mb-8">
          <button onClick={() => navigate("/")} className="hover:text-brand">Home</button>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 flex flex-col md:flex-row-reverse gap-4">
            {/* Main Image */}
            <div className="flex-1 aspect-[4/5] bg-gray-50 rounded-[2.5rem] overflow-hidden relative group">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>

            {/* Thumbnails Sidebar */}
            <div className="flex md:flex-col gap-3 w-full md:w-24 shrink-0">
              {images.length > 4 && thumbOffset > 0 && (
                <button
                  onClick={() => setThumbOffset(prev => Math.max(0, prev - 1))}
                  className="hidden md:flex items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-brand/5 text-gray-400 hover:text-brand transition-all"
                >
                  <ChevronLeft className="rotate-90" size={20} />
                </button>
              )}

              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible no-scrollbar">
                {visibleThumbs.map((img, idx) => {
                  const actualIdx = idx + thumbOffset;
                  return (
                    <button
                      key={actualIdx}
                      onClick={() => setActiveImage(actualIdx)}
                      className={`relative w-20 h-24 md:w-full md:h-28 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImage === actualIdx ? 'border-brand ring-4 ring-brand/10' : 'border-gray-100 hover:border-brand/30'
                        }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>

              {images.length > 4 && thumbOffset + 4 < images.length && (
                <button
                  onClick={() => setThumbOffset(prev => Math.min(images.length - 4, prev + 1))}
                  className="hidden md:flex items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-brand/5 text-gray-400 hover:text-brand transition-all"
                >
                  <ChevronRight className="rotate-90" size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-black text-brand">₹{product.price}</span>
                <span className="text-xl text-gray-300 line-through font-bold">₹{Math.floor(product.price * 1.4)}</span>
                <span className="bg-red-50 text-red-500 px-3 py-1 rounded-lg text-xs font-black uppercase">-40% OFF</span>
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed font-medium">
              {product.description || "Premium quality cotton blend fabric. Designed for ultimate comfort and style. Perfect for everyday wear."}
            </p>

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Select Size</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[56px] h-12 flex items-center justify-center rounded-xl font-bold transition-all border-2 ${selectedSize === size
                          ? 'bg-brand border-brand text-white shadow-lg shadow-brand/20'
                          : 'bg-white border-gray-100 text-gray-400 hover:border-brand/20'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-800">Quantity</h3>
              <div className="flex items-center bg-gray-50 w-fit rounded-2xl p-1.5 border border-gray-100">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-gray-500 transition-all active:scale-90"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-black text-gray-800 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white text-gray-500 transition-all active:scale-90"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-brand text-white h-16 rounded-[1.25rem] font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-brand/20 hover:bg-gray-900 transition-all active:scale-[0.98]"
              >
                <ShoppingCart size={24} />
                Add To Cart
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Verified Quality</p>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <Truck size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Fast Shipping</p>
              </div>
              <div className="flex items-center gap-3 text-gray-500">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
                  <RefreshCw size={20} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest leading-tight">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
