import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import reviewApi from '../../api/reviewApi';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { useCurrency } from '../../hooks/useCurrency';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  
  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();

    // Set up SSE connection for real-time updates
    const sseBase = import.meta.env.VITE_API_BASE_URL || '';
    const eventSource = new EventSource(`${sseBase}/api/orders/stream`);
    
    eventSource.addEventListener('orderUpdate', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Real-time update received:', data);
        
        // Update the specific order in the state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.id === data.orderId 
              ? { ...order, status: data.status } 
              : order
          )
        );
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    });

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close(); // Cleanup on unmount
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await orderApi.getMyOrders();
      const sorted = data.sort((a, b) => b.id - a.id);
      setOrders(sorted);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = (order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach(item => {
        addItem({
          id: item.menuItemId,
          name: item.menuItemName,
          price: item.price
        });
      });
      toast.success('Items added to cart!');
      navigate('/customer/cart');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderApi.updateOrderStatus(orderId, 'CANCELLED');
      toast.success('Order cancelled successfully');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const openReviewModal = (orderId) => {
    setSelectedOrderId(orderId);
    setFoodRating(5);
    setDeliveryRating(5);
    setComment('');
    setIsReviewModalOpen(true);
  };

  const submitReview = async () => {
    try {
      await reviewApi.addReview({
        orderId: selectedOrderId,
        foodRating,
        deliveryRating,
        comment
      });
      toast.success('Review submitted successfully!');
      setIsReviewModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-4 h-32 animate-pulse">
                <div className="w-1/2">
                  <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 rounded"></div>
                </div>
                <div className="w-1/4 flex flex-col items-end gap-2">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-8 w-20 bg-gray-200 rounded-full mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">My Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center border border-gray-100 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm">When you place an order, it will appear here so you can track its status.</p>
            <Link to="/customer/menu" className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm">
              Explore Our Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => navigate(`/customer/order-confirmation/${order.id}`)}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4 cursor-pointer hover:border-primary hover:shadow-md transition-all"
              >
                <div>
                  <h3 className="font-bold text-gray-900">Order #{order.id} - {order.orderType}</h3>
                  {order.tableNumber && <p className="text-sm font-medium text-gray-600">Table {order.tableNumber}</p>}
                  {order.orderType === 'DELIVERY' && order.deliveryAddress && (
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">To: {order.deliveryAddress}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {order.items?.map(item => `${item.quantity}x ${item.menuItemName}`).join(', ')}
                  </p>
                </div>
                <div className="text-left md:text-right flex flex-col items-start md:items-end gap-2">
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(order);
                      }}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded font-medium transition-colors"
                    >
                      Reorder
                    </button>
                    {order.status === 'PENDING' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order.id);
                        }}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded font-medium transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    {order.status === 'COMPLETED' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openReviewModal(order.id);
                        }}
                        className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded font-medium transition-colors"
                      >
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Order #{selectedOrderId}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Food Rating (1-5)</label>
                <input 
                  type="number" min="1" max="5" 
                  value={foodRating} onChange={(e) => setFoodRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Rating (1-5)</label>
                <input 
                  type="number" min="1" max="5" 
                  value={deliveryRating} onChange={(e) => setDeliveryRating(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                <textarea 
                  value={comment} onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                  rows="3" placeholder="Tell us about your experience..."
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={submitReview}
                className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
