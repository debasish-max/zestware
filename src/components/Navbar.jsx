/* updated code for a minimal role-aware ui */
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { User, LayoutDashboard, ShoppingCart, Menu, X, Package, LogOut, ChevronDown, ShieldCheck, Plus, Search } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";
import { getProductImage } from "../utils/imageUtils";
export default function Navbar() {
  const { uniqueCount } = useCart();
  const { user, role } = useAuth();
  const { signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Instant Search State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*');
      if (data) setAllProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allProducts]);

  // Close menus when location changes or clicking outside
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setSearchQuery(searchParams.get('q') || '');
  }, [location, searchParams]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setIsProfileOpen(false);
      setIsMenuOpen(false);
      await signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        navigate(`/?q=${encodeURIComponent(searchQuery)}`);
        setIsSearchFocused(false);
        setIsMenuOpen(false);
      } else {
        navigate(`/`);
      }
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    navigate(`/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3 md:py-4">
        <Link to="/" className="group flex items-center gap-3">
          <img src="/zw.png" alt="ZW Logo" className="w-10 h-10 md:w-12 md:h-12 object-contain group-hover:scale-110 transition-transform" />
          <h1 className="text-2xl md:text-3xl font-black text-brand tracking-tighter">
            ZESTWEAR
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-semibold text-gray-600">
          {!isAdmin && (
            <div className="relative group flex items-center z-50">
              <Search className="absolute left-3 text-gray-400 group-focus-within:text-brand transition-colors" size={18} />
              <input
                type="text"
                className="bg-gray-50 border border-transparent rounded-full pl-10 pr-10 py-2 w-48 lg:w-64 focus:w-64 focus:lg:w-80 focus:bg-white focus:ring-4 focus:ring-gray-100 outline-none transition-all duration-300 placeholder:text-gray-400 text-sm font-medium"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={14} />
                </button>
              )}

              {isSearchFocused && searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 right-0 animate-in fade-in slide-in-from-top-2">
                  {searchResults.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <img src={getProductImage(p.img)} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-brand font-black mt-0.5">₹{p.price}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="px-4 py-3 border-t border-gray-50 mt-1">
                    <button onClick={() => navigate(`/?q=${encodeURIComponent(searchQuery)}`)} className="text-sm font-semibold text-gray-800 hover:text-brand transition-colors w-full text-center py-1">
                      View all results &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <>
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${location.pathname === '/admin' ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'}`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/admin/products"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${location.pathname === '/admin/products' ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'}`}
              >
                <Plus size={20} />
                <span>Add Products</span>
              </Link>
            </>
          )}

          {!isAdmin && (
            <Link
              to="/cart"
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${location.pathname === '/cart' ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'}`}
            >
              <ShoppingCart size={20} />
              <span>Cart</span>
              {uniqueCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white font-bold">
                  {uniqueCount}
                </span>
              )}
            </Link>
          )}

          {/* Orders Link - Visible for both but different paths */}
          {user && (
            <Link
              to={isAdmin ? "/admin/orders" : "/orders"}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${location.pathname.includes('/orders') ? 'bg-brand/10 text-brand' : 'hover:bg-gray-100'}`}
            >
              <Package size={20} />
              <span>Orders</span>
            </Link>
          )}

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`flex items-center gap-2 p-1 rounded-full transition-all border ${isProfileOpen ? 'border-brand bg-brand/5 ring-4 ring-brand/5' : 'border-gray-200 hover:border-brand/50 hover:bg-gray-50'}`}
            >
              {user ? (
                <img src={user.image_url} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
                  <User size={18} />
                </div>
              )}
              <ChevronDown size={14} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right z-50">
                {user ? (
                  <>
                    <div className="px-4 py-3 mb-1 border-b border-gray-50 bg-gray-50/30">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Type</p>
                      <p className="text-sm font-bold text-gray-700 capitalize">{role}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <DropdownItem to="/login" icon={<User size={18} />} label="Login" />
                    <DropdownItem to="/signup" icon={<ShieldCheck size={18} />} label="Sign Up" />
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Toggle & Actions */}
        <div className="md:hidden flex items-center gap-3">
          {!isAdmin && (
            <Link to="/cart" className="relative p-2.5 rounded-xl bg-gray-50 text-gray-600">
              <ShoppingCart size={22} />
              {uniqueCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white font-bold">
                  {uniqueCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 rounded-xl transition-all ${isMenuOpen ? 'bg-brand text-white' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl p-4 space-y-2 animate-in slide-in-from-top duration-200 origin-top">
          {!isAdmin && (
            <div className="relative mb-4 z-50">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="w-full bg-gray-50 border border-transparent rounded-xl pl-11 pr-11 py-3 focus:bg-white focus:ring-4 focus:ring-gray-100 outline-none transition-all duration-300 placeholder:text-gray-400 font-medium text-sm"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearch}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X size={16} />
                </button>
              )}

              {isSearchFocused && searchQuery && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 animate-in fade-in">
                  {searchResults.map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-4 px-4 py-2 hover:bg-gray-50 transition-colors">
                      <img src={getProductImage(p.img)} className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-brand font-black mt-0.5">₹{p.price}</p>
                      </div>
                    </Link>
                  ))}
                  <div className="px-4 py-3 border-t border-gray-50 mt-1">
                    <button onClick={() => { setIsMenuOpen(false); navigate(`/?q=${encodeURIComponent(searchQuery)}`); }} className="text-sm font-semibold text-gray-800 hover:text-brand transition-colors w-full text-center py-1">
                      View all results &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {user ? (
            <>
              <div className="px-4 py-3 mb-2 border-b border-gray-50 bg-gray-50/30 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Account Type</p>
                <p className="text-sm font-bold text-gray-700 capitalize">{role}</p>
              </div>

              {isAdmin && <MobileItem to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" active={location.pathname === '/admin'} />}

              <MobileItem
                to={isAdmin ? "/admin/orders" : "/orders"}
                icon={<Package size={20} />}
                label="Orders"
                active={location.pathname.includes('/orders')}
              />

              {isAdmin && <MobileItem to="/admin/products" icon={<Plus size={20} />} label="Add Products" active={location.pathname === '/admin/products'} />}
              <div className="pt-2 mt-2 border-t border-gray-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <MobileItem to="/login" icon={<User size={20} />} label="Login" />
              <MobileItem to="/signup" icon={<ShieldCheck size={20} />} label="Create Account" />
            </>
          )}
          {!isAdmin && (
            <div className="border-t border-gray-50 pt-2 mt-2">
              <MobileItem to="/" icon={<LayoutDashboard size={20} />} label="Back to Shop" />
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function DropdownItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${active ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
    >
      {icon}
      {label}
    </Link>
  );
}

