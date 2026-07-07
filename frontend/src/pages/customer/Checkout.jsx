import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { useCurrency } from '../../hooks/useCurrency';
import orderApi from '../../api/orderApi';
import tableApi from '../../api/tableApi';
import userApi from '../../api/userApi';
import addressApi from '../../api/addressApi';

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  
  const [orderType, setOrderType] = useState('Dine In');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', zipCode: '' });

  const [paymentMethod, setPaymentMethod] = useState('PAY_AT_COUNTER');
  const [walletBalance, setWalletBalance] = useState(0);

  const finalTotal = total + (total * 0.05); // including 5% tax

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await tableApi.getAllTables();
        setTables(data.filter(t => t.status === 'AVAILABLE'));
      } catch (error) {
        console.error("Failed to load tables", error);
      }
    };
    if (orderType === 'Dine In') {
      fetchTables();
    }
  }, [orderType]);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await addressApi.getMyAddresses();
        setAddresses(data);
        if (data.length > 0) {
          setSelectedAddress(data[0].id.toString());
        } else {
          setIsAddingNewAddress(true);
        }
      } catch (error) {
        console.error("Failed to fetch addresses", error);
      }
    };
    if (orderType === 'Delivery' && user?.authenticated) {
      fetchAddresses();
    }
  }, [orderType, user]);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const profile = await userApi.getMyProfile();
        setWalletBalance(profile.walletBalance || 0);
      } catch (error) {
        console.error("Failed to fetch wallet", error);
      }
    };
    if (user?.authenticated) {
      fetchWallet();
    }
  }, [user]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (orderType === 'Dine In' && !selectedTable) {
      toast.error('Please select an available table');
      return;
    }

    if (paymentMethod === 'WALLET' && walletBalance < finalTotal) {
      toast.error('Insufficient wallet balance. Please add funds or pay at counter.');
      return;
    }

    let finalAddressId = null;
    if (orderType === 'Delivery') {
      if (isAddingNewAddress) {
        if (!newAddress.label || !newAddress.street || !newAddress.city || !newAddress.zipCode) {
          toast.error('Please fill all new address fields');
          return;
        }
      } else if (!selectedAddress) {
        toast.error('Please select a delivery address');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      if (orderType === 'Delivery' && isAddingNewAddress) {
        const added = await addressApi.addAddress(newAddress);
        finalAddressId = added.id;
      } else if (orderType === 'Delivery') {
        finalAddressId = parseInt(selectedAddress);
      }

      const payload = {
        orderType: orderType === 'Dine In' ? 'DINE_IN' : orderType.toUpperCase(),
        tableId: orderType === 'Dine In' ? parseInt(selectedTable) : null,
        addressId: orderType === 'Delivery' ? finalAddressId : null,
        paymentMethod: paymentMethod,
        items: items.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          specialNote: ""
        }))
      };

      const newOrder = await orderApi.addOrder(payload);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/customer/order-confirmation/${newOrder.id}`);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h1>
        
        <form onSubmit={handlePlaceOrder}>
          {/* Order Type Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Type</h2>
            <div className="flex space-x-4">
              {['Dine In', 'Takeaway', 'Delivery'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setOrderType(type);
                    if (type !== 'Dine In') setSelectedTable('');
                  }}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors border ${
                    orderType === type 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Table Selection */}
          {orderType === 'Dine In' && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Select Table</h2>
              <select 
                required 
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
              >
                <option value="">Select an available table...</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>Table {table.tableNumber} ({table.capacity} seats)</option>
                ))}
              </select>
            </div>
          )}

          {/* Address Selection */}
          {orderType === 'Delivery' && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Delivery Address</h2>
                {addresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                    className="text-primary font-bold hover:underline"
                  >
                    {isAddingNewAddress ? 'Select Existing' : '+ Add New Address'}
                  </button>
                )}
              </div>

              {!isAddingNewAddress ? (
                <div>
                  {addresses.length === 0 ? (
                    <p className="text-gray-500 mb-3">You have no saved addresses.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map(addr => (
                        <label key={addr.id} className={`cursor-pointer p-4 rounded-xl border flex flex-col items-start transition-colors ${selectedAddress === addr.id.toString() ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            <input 
                              type="radio" 
                              name="selectedAddress" 
                              value={addr.id}
                              checked={selectedAddress === addr.id.toString()}
                              onChange={(e) => setSelectedAddress(e.target.value)}
                              className="text-primary focus:ring-primary"
                            />
                            <span className="font-bold text-gray-900">{addr.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 pl-7">{addr.street}</p>
                          <p className="text-sm text-gray-500 pl-7">{addr.city}, {addr.zipCode}</p>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Home, Work)</label>
                    <input type="text" required value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input type="text" required value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input type="text" required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                      <input type="text" required value={newAddress.zipCode} onChange={e => setNewAddress({...newAddress, zipCode: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className={`cursor-pointer p-4 rounded-xl border flex flex-col justify-center transition-colors ${paymentMethod === 'PAY_AT_COUNTER' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="PAY_AT_COUNTER"
                    checked={paymentMethod === 'PAY_AT_COUNTER'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="font-bold text-gray-900">Pay at Counter</span>
                </div>
                <p className="text-sm text-gray-500 pl-7">Pay with cash or card when you pick up your order or finish dining.</p>
              </label>

              <label className={`cursor-pointer p-4 rounded-xl border flex flex-col justify-center transition-colors ${paymentMethod === 'WALLET' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="WALLET"
                      checked={paymentMethod === 'WALLET'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="font-bold text-gray-900">Digital Wallet</span>
                  </div>
                  <span className={`font-bold ${walletBalance >= finalTotal ? 'text-green-600' : 'text-red-500'}`}>
                    Balance: {formatCurrency(walletBalance)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 pl-7">Pay seamlessly using your pre-loaded wallet funds.</p>
                {walletBalance < finalTotal && paymentMethod === 'WALLET' && (
                  <p className="text-xs text-red-500 pl-7 mt-2">Insufficient balance. Add funds in your Profile.</p>
                )}
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 mt-6">
            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Total Amount</span>
              <span className="text-primary">{formatCurrency(finalTotal)}</span>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (paymentMethod === 'WALLET' && walletBalance < finalTotal)}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
