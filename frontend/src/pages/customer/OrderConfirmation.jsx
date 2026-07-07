import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderApi from '../../api/orderApi';
import { useCurrency } from '../../hooks/useCurrency';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatCurrency } = useCurrency();
  const [error, setError] = useState('');

  const fetchOrder = useCallback(async () => {
    try {
      const orders = await orderApi.getMyOrders();
      const currentOrder = orders.find(o => o.id === parseInt(id));
      if (currentOrder) {
        setOrder(currentOrder);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
    // Poll every 5 seconds for status updates
    const intervalId = setInterval(fetchOrder, 5000);
    return () => clearInterval(intervalId);
  }, [fetchOrder]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Loading order details...</div>;
  }

  if (error || !order) {
    return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error || 'Order not found'}</div>;
  }

  const getStatusStep = (status) => {
    switch (status) {
      case 'PENDING': return 1;
      case 'PREPARING': return 2;
      case 'READY': return 3;
      case 'COMPLETED': return 4;
      default: return 0; // CANCELLED or Unknown
    }
  };

  const currentStep = getStatusStep(order.status);
  
  const steps = [
    { label: 'Order Placed', desc: 'We have received your order.' },
    { label: 'Preparing', desc: 'Kitchen is preparing your food.' },
    { label: 'Ready', desc: 'Your food is ready!' },
    { label: 'Completed', desc: 'Enjoy your meal!' }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-6">Order ID: #{order.id}</p>
          
          <div className="inline-block bg-primary/10 text-primary font-bold px-6 py-3 rounded-xl">
            {order.status === 'PENDING' ? 'Waiting for kitchen to accept...' :
             order.status === 'PREPARING' ? 'Estimated time: 15-20 mins' :
             order.status === 'READY' ? 'Please collect your food!' : 'Completed'}
          </div>
        </div>

        {/* Live Tracker Section */}
        {order.status !== 'CANCELLED' && (
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-8">Live Order Status</h2>
            
            <div className="relative flex justify-between">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10"></div>
              <div 
                className="absolute top-5 left-0 h-1 bg-primary transition-all duration-500 -z-10"
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              ></div>

              {steps.map((step, index) => {
                const stepNum = index + 1;
                const isCompleted = currentStep >= stepNum;
                const isCurrent = currentStep === stepNum;

                return (
                  <div key={index} className="flex flex-col items-center w-1/4 text-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-4 transition-colors ${
                      isCompleted ? 'bg-primary text-white border-primary' : 'bg-white text-gray-400 border-gray-200'
                    } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                      {isCompleted ? '✓' : stepNum}
                    </div>
                    <div className={`mt-4 font-bold ${isCurrent ? 'text-primary' : (isCompleted ? 'text-gray-900' : 'text-gray-400')}`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 hidden md:block">
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>
          <div className="space-y-4 mb-6">
            {order?.items?.map((item, index) => (
              <div key={index} className="flex justify-between text-gray-700">
                <span>{item?.quantity}x {item?.menuItemName}</span>
                <span className="font-bold">{formatCurrency(item?.subtotal)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-bold text-gray-900">{order?.paymentMethod === 'WALLET' ? 'Digital Wallet' : 'Pay at Counter'}</span>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-500">Payment Status</span>
            <span className={`font-bold ${order?.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
              {order?.paymentStatus}
            </span>
          </div>
          
          {order?.orderType === 'DELIVERY' && order?.deliveryAddress && (
            <div className="border-t border-gray-100 pt-4 mt-4 text-left">
              <span className="text-gray-500 block mb-1">Delivery Address</span>
              <span className="font-medium text-gray-900 block bg-gray-50 p-3 rounded-lg">{order?.deliveryAddress}</span>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 mt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(order?.totalAmount)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/customer/menu" className="flex-1 bg-primary hover:bg-primary-hover text-white text-center font-bold py-4 rounded-xl transition-colors">
            Order More Food
          </Link>
          <Link to="/orders" className="flex-1 bg-white hover:bg-gray-50 text-gray-700 text-center font-bold py-4 rounded-xl transition-colors border border-gray-200">
            View All Orders
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderConfirmation;
