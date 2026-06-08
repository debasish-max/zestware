import Hero from "../components/Hero";
import FeaturedShowcase from "../components/FeaturedShowcase";
import ProductCard from "../components/ProductCard";
import { useEffect, useState, useRef } from "react";
import { Search, ChevronLeft, ChevronRight, MessageSquare, Info, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function Home({ setToast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const collectionRef = useRef(null);
  const headerRef = useRef(null);
  const prevPage = useRef(page);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    // Only scroll if the page number has actually changed
    if (prevPage.current !== page) {
      prevPage.current = page;

      if (headerRef.current) {
        const timer = setTimeout(() => {
          const offset = 90;
          const elementPosition = headerRef.current.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [page]);


  const filtered = products.filter((p) =>
    (!p.category || p.category === 'normal') && p.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="bg-white">
      <Hero />
      <FeaturedShowcase />

      {/* New Arrivals Section */}
      {products.some(p => p.category === 'new_arrival') && (
        <section className="relative py-20 md:py-32 overflow-hidden bg-white">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gray-50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand/5 rounded-full blur-3xl opacity-50 translate-y-1/3 -translate-x-1/3 pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-[3px] w-12 bg-brand"></div>
                  <span className="text-brand font-black tracking-[0.2em] uppercase text-[10px]">Fresh Drops</span>
                </div>
                <h2 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[0.9] mb-8">
                  New<br />Arrivals.
                </h2>
                <p className="text-xl text-gray-500 font-medium leading-relaxed">
                  The latest pieces to elevate your everyday rotation. Limited stock available.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-4 mb-4">
                <div className="w-16 h-[2px] bg-gray-100"></div>
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                  Edition 2026
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 pb-8 lg:pb-16">
              {products.filter(p => p.category === 'new_arrival').map((p, idx) => (
                <div key={p.id} className={`transform transition-all duration-700 hover:-translate-y-4 ${idx % 2 !== 0 ? 'lg:translate-y-16' : ''}`}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section ref={collectionRef} id="collection" className="max-w-7xl mx-auto px-4 py-10 md:py-20">

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h2 ref={headerRef} className="text-4xl font-black text-gray-800 tracking-tight mb-2">Our Collection</h2>
            <p className="text-gray-500 font-medium">Premium quality apparel for your everyday life</p>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand transition-colors" size={20} />
            <input
              className="bg-white border-2 border-gray-50 rounded-2xl px-12 py-3.5 w-full md:w-80 shadow-sm focus:ring-4 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-gray-300 font-medium"
              placeholder="Search products..."
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-brand" size={48} />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Loading Collection...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {paginated.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
              />
            ))}
            {paginated.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <Search className="mx-auto mb-4 text-gray-200" size={64} />
                <h3 className="text-xl font-bold text-gray-400">No products found</h3>
                <p className="text-gray-400">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {filtered.length > perPage && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-3 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-brand hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 shadow-sm transition-all active:scale-90"
            >
              <ChevronLeft />
            </button>
            <span className="font-black text-gray-800 tracking-widest text-sm">
              PAGE {page} OF {Math.ceil(filtered.length / perPage)}
            </span>
            <button
              onClick={() =>
                handlePageChange(page * perPage < filtered.length ? page + 1 : page)
              }
              disabled={page * perPage >= filtered.length}
              className="p-3 bg-white border border-gray-100 text-gray-600 rounded-2xl hover:bg-brand hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-gray-600 shadow-sm transition-all active:scale-90"
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="relative overflow-hidden bg-white py-24 px-4 border-t border-gray-50">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-gray-50 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-bounce">
            <Info className="text-brand" size={32} />
          </div>
          <h2 className="text-5xl font-black text-gray-800 mb-8 tracking-tighter">About ZESTWEAR</h2>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            We provide premium quality clothing designed with a focus on style, comfort, and durability.
            Every garment is carefully selected and crafted to ensure you look and feel your best,
            bringing a touch of modern luxury to your everyday wardrobe.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-gray-50 py-24 px-4 relative">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-brand/20">
              <MessageSquare className="text-white" size={32} />
            </div>
            <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">Get in Touch</h2>
            <p className="text-gray-500 font-bold">Have a question or custom request? Reach out to our team.</p>
          </div>

          <form className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Full Name</label>
                <input
                  type="text"
                  placeholder=""
                  className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Email Address</label>
                <input
                  type="email"
                  placeholder=""
                  className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 pl-4">Your Message</label>
              <textarea
                placeholder=""
                rows="4"
                className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-3xl focus:ring-4 focus:ring-brand/10 focus:bg-white focus:border-brand transition-all outline-none font-bold resize-none"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-brand text-white py-5 rounded-[2rem] text-lg font-black tracking-tight hover:bg-gray-800 transition-all duration-300 shadow-xl shadow-brand/20 active:scale-[0.98]"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
