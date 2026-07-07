import React, { useState, useEffect } from 'react';
import menuApi from '../../api/menuApi';
import categoryApi from '../../api/categoryApi';
import FoodCard from '../../components/FoodCard';
import { MenuSkeletonCard } from '../../components/Skeleton';

const Menu = () => {
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuData, categoryData] = await Promise.all([
          menuApi.getAllMenus(),
          categoryApi.getAllCategories()
        ]);
        setMenus(menuData || []);
        setCategories(categoryData || []);
      } catch (error) {
        console.error('Failed to fetch menu data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMenus = React.useMemo(() => {
    let result = menus.filter(item => {
      // Only show available items
      const isAvail = item.availability?.toUpperCase() === 'AVAILABLE';
      if (!isAvail) return false;
      
      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(term);
        const matchesDesc = item.description?.toLowerCase().includes(term);
        if (!matchesName && !matchesDesc) return false;
      }
      
      return true;
    });

    // Sort
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [menus, selectedCategory, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen pb-24">
        {/* Menu Header (Static while loading) */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary/80 py-20 px-6 mb-12 shadow-inner">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">Our Menu</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-24">
            {[...Array(8)].map((_, i) => (
              <MenuSkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Menu Header with Gradient */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-primary/80 py-20 px-6 mb-12 shadow-inner">
        <div className="max-w-7xl mx-auto text-center animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase mb-4 border border-white/20 backdrop-blur-sm">
            Handcrafted with Love
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">Our Menu</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Discover our delicious offerings. From appetizers to desserts, we have something to satisfy every craving.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Search, Sort, and Category Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-12 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
            {/* Search */}
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-all shadow-inner"
              />
            </div>
            
            {/* Sort */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-500 uppercase tracking-wider shrink-0">Sort By:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full md:w-auto pl-3 pr-8 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm cursor-pointer transition-all font-medium text-gray-700"
              >
                <option value="default">Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-5 py-2 rounded-full font-bold transition-all duration-300 text-sm ${
                selectedCategory === 'All' 
                  ? 'bg-primary text-white shadow-md shadow-primary/30' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full font-bold transition-all duration-300 text-sm ${
                  selectedCategory === cat.name 
                    ? 'bg-primary text-white shadow-md shadow-primary/30' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMenus.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xl font-medium text-gray-900">No menu items found.</p>
            <p className="text-gray-500 mt-2">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;
