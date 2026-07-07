import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import menuApi from '../../api/menuApi';
import { useCurrency } from '../../hooks/useCurrency';
import { useSettings } from '../../context/SettingsContext';

const Home = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { restaurantInfo } = useSettings();
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const data = await menuApi.getPopularMenus();
        const availableData = data.filter(item => item.availability?.toUpperCase() === 'AVAILABLE');
        setPopularItems(availableData.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch popular items", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-32 px-6 overflow-hidden">
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80" 
            alt="Restaurant background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-gray-900/80 mix-blend-multiply"></div>
          {/* Animated Glow Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto w-full">
          <div className="max-w-2xl bg-white/10 backdrop-blur-xl border border-white/20 p-10 md:p-14 rounded-3xl shadow-2xl animate-fade-in-up">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-sm font-bold tracking-wider uppercase mb-6 shadow-sm border border-white/30 backdrop-blur-md">
              Premium Dining Experience
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight drop-shadow-lg">
              Savor Every <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-primary drop-shadow-none">Moment.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 leading-relaxed font-medium drop-shadow-md">
              Experience culinary mastery from the comfort of your home. Fresh ingredients, masterful chefs, and lightning-fast delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/customer/menu" className="group relative overflow-hidden bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-primary/50 transition-all hover:-translate-y-1">
                <span className="relative z-10">Explore Menu</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              </Link>
              <Link to="/reservation" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg hover:-translate-y-1 transition-all shadow-lg hover:shadow-white/10">
                Reserve Table
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Menu Items */}
      <section id="popular" className="py-32 px-6 bg-white relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 animate-fade-in-up">
            <span className="text-primary font-bold tracking-wider uppercase text-sm mb-2 block">Our Signature Dishes</span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">Popular Menu Items</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-orange-400 mx-auto rounded-full"></div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {popularItems.length > 0 ? popularItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:-translate-y-2 animate-fade-in-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  
                  <div className="h-64 bg-gray-100 relative overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-sm font-bold text-gray-900 px-4 py-2 rounded-2xl shadow-lg transform group-hover:-translate-y-1 transition-transform">
                      {formatCurrency(item.price)}
                    </div>
                  </div>
                  <div className="p-8 relative z-10 bg-white group-hover:bg-transparent transition-colors duration-300">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-gray-600 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              )) : (
                <p className="col-span-3 text-center text-gray-500 py-10">No popular items available right now.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About Section placeholder */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80" alt="About us" className="rounded-2xl shadow-2xl" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">About {restaurantInfo?.name || 'Savory'}</h2>
            <p className="text-lg text-gray-600 mb-6">
              We started with a simple vision: to bring the finest culinary experiences directly to you. Whether you dine in our elegant restaurant or order for home delivery, our commitment to quality remains the same.
            </p>
            <a href="#about" className="text-primary font-bold hover:underline">Read our story &rarr;</a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
