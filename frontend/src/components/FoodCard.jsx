import React from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useCurrency } from '../hooks/useCurrency';

const FoodCard = ({ item }) => {
  const { items, addItem, removeItem } = useCart();
  const { formatCurrency } = useCurrency();
  const isInCart = items.some(cartItem => cartItem.id === item.id);

  const handleToggleCart = () => {
    if (isInCart) {
      removeItem(item.id);
      toast.info(`${item.name} removed from cart`);
    } else {
      addItem(item);
      toast.success(`${item.name} added to cart!`);
    }
  };

  return (
    <div className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full hover:-translate-y-2 animate-fade-in-up">
      <div className="h-56 bg-gray-100 relative shrink-0 overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out" />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-400 bg-gray-100">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md font-extrabold text-gray-900 px-4 py-2 rounded-2xl shadow-lg transform group-hover:-translate-y-1 transition-transform">
          {formatCurrency(item.price)}
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-grow relative z-10 bg-white">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors">{item.name}</h3>
          {item.category && (
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-xl ml-2 shrink-0">
              {item.category}
            </span>
          )}
        </div>
        <p className="text-gray-600 line-clamp-3 mb-6 flex-grow">{item.description}</p>
        
        <button
          onClick={handleToggleCart}
          disabled={!item.availability}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 group ${
            !item.availability 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : isInCart
                ? 'bg-green-500 hover:bg-red-500 text-white shadow-lg shadow-green-500/30 hover:shadow-red-500/30'
                : 'bg-primary text-white hover:bg-primary-hover hover-lift'
          }`}
        >
          {!item.availability ? 'Out of Stock' : (
            isInCart ? (
              <>
                <span className="block group-hover:hidden">In Cart ✓</span>
                <span className="hidden group-hover:block">Remove ✕</span>
              </>
            ) : 'Add to Cart'
          )}
        </button>
      </div>
    </div>
  );
};

export default FoodCard;
