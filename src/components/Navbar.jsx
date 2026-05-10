/* updated code for a minimal role-aware ui */
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { User, LayoutDashboard, ShoppingCart, Menu, X, Package, LogOut, ChevronDown, ShieldCheck, Plus } from "lucide-react";
import { useClerk } from "@clerk/clerk-react";

export default function Navbar() {
  const { uniqueCount } = useCart();
  const { user, role } = useAuth();
  const { signOut } = useClerk();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const location = useLocation();

  const isAdmin = role === 'admin';

  // Close menus when location changes or clicking outside
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
  }, [location]);

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
              <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
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

