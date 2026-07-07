import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { restaurantInfo } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const authenticated = user?.authenticated;

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FFFDFB]">
      {/* Decorative Top Banner */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-primary to-orange-500"></div>

      {/* Navigation */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 px-6 py-4 ${
        scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md border-b border-orange-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-primary/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 tracking-tight">
              {restaurantInfo?.name || 'Savory'}
            </span>
          </Link>

          {/* Center: Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-white/50 backdrop-blur-md px-2 py-1 rounded-full border border-orange-100/50 shadow-sm">
            <Link to="/" className={`px-4 py-2 rounded-full font-medium transition-all ${isActive('/') ? 'bg-orange-100 text-primary' : 'text-gray-700 hover:text-primary hover:bg-orange-50'}`}>Home</Link>
            <Link to="/customer/menu" className={`px-4 py-2 rounded-full font-medium transition-all ${isActive('/customer/menu') ? 'bg-orange-100 text-primary' : 'text-gray-700 hover:text-primary hover:bg-orange-50'}`}>Menu</Link>
            <Link to="/reservation" className={`px-4 py-2 rounded-full font-medium transition-all ${isActive('/reservation') ? 'bg-orange-100 text-primary' : 'text-gray-700 hover:text-primary hover:bg-orange-50'}`}>Reservations</Link>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {!authenticated ? (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary transition-colors font-medium px-4 py-2">Login</Link>
                <Link to="/register" className="bg-primary text-white px-6 py-2.5 rounded-full hover:bg-primary-hover transition-colors font-bold shadow-lg shadow-primary/30 hover-lift flex items-center gap-2">
                  Sign Up
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
              </>
            ) : user.role === 'CUSTOMER' ? (
              <>
                <Link to="/profile" className="text-gray-700 hover:text-primary transition-colors font-medium p-2 rounded-full hover:bg-orange-50">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-primary transition-colors font-medium p-2 rounded-full hover:bg-orange-50">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                </Link>
                <Link to="/cart" className="relative bg-orange-100 text-primary p-3 rounded-full hover:bg-orange-200 transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md shadow-red-500/50 border-2 border-white">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors p-2 ml-2">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary transition-colors font-medium">Admin Dashboard</Link>
                <span className="text-gray-300">|</span>
                <span className="text-gray-900 font-bold bg-orange-100 px-3 py-1 rounded-full">{user.name}</span>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-600 transition-colors font-medium">Logout</button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 bg-orange-50 p-2 rounded-xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-xl border-b border-orange-100 p-4 space-y-2 flex flex-col absolute top-[72px] w-full z-40">
          <Link to="/" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/customer/menu" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>Menu</Link>
          <Link to="/reservation" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>Reservations</Link>
          
          <div className="h-px w-full bg-gray-100 my-2"></div>

          {!authenticated ? (
            <>
              <Link to="/login" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-primary font-bold px-4 py-3 rounded-xl bg-orange-50" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </>
          ) : user.role === 'CUSTOMER' ? (
            <>
              <Link to="/profile" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <Link to="/orders" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
              <Link to="/cart" className="flex items-center justify-between text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>
                Cart
                {cartItemCount > 0 && (
                  <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">{cartItemCount}</span>
                )}
              </Link>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-500 font-bold px-4 py-3 rounded-xl hover:bg-red-50">Logout</button>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-700 font-medium px-4 py-3 rounded-xl hover:bg-orange-50" onClick={() => setIsMenuOpen(false)}>Admin Dashboard</Link>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="text-left text-red-500 font-bold px-4 py-3 rounded-xl hover:bg-red-50">Logout</button>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-[#1a0f0e] text-orange-100/70 pt-16 pb-8 px-6 mt-12 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-primary/20 text-primary p-2 rounded-xl">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">{restaurantInfo?.name || 'Savory'}</h2>
            </div>
            <p className="text-orange-100/60 leading-relaxed max-w-sm mb-8">
              Experience premium dining at home. We bring the finest ingredients and culinary expertise directly to your table, hot and fresh.
            </p>
            <div className="flex space-x-4">
              {/* Social placeholders */}
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-colors text-white">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Explore</h3>
            <ul className="space-y-3">
              <li><Link to="/customer/menu" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Our Menu</Link></li>
              <li><Link to="/reservation" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Book a Table</Link></li>
              <li><a href="/#about" className="hover:text-primary transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span> About Us</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4 text-orange-100/60">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="whitespace-pre-line">{restaurantInfo?.address || '123 Culinary Boulevard,\nFood City, FC 90210'}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>{restaurantInfo?.email || 'hello@savory.com'}</span>
              </li>
              {restaurantInfo?.phone && (
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>{restaurantInfo?.phone}</span>
              </li>
              )}
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-sm text-center text-orange-100/40 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>
            © {new Date().getFullYear()} {restaurantInfo?.name || 'Savory'} Restaurant. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
