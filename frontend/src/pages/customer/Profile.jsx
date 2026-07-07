import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userApi from '../../api/userApi';
import addressApi from '../../api/addressApi';
import reservationApi from '../../api/reservationApi';
import { toast } from 'react-toastify';
import { useCurrency } from '../../hooks/useCurrency';

const Profile = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: '', street: '', city: '', zipCode: '' });

  // Wallet Top-up Modal State (replaces window.prompt)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Delete Address Confirm State (replaces window.confirm)
  const [addressToDelete, setAddressToDelete] = useState(null);

  // Cancel Reservation Confirm State (replaces window.confirm)
  const [reservationToCancel, setReservationToCancel] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [profileData, addressesData, reservationsData] = await Promise.all([
        userApi.getMyProfile(),
        addressApi.getMyAddresses(),
        reservationApi.getMyReservations()
      ]);
      setProfile(profileData);
      setAddresses(addressesData);
      setReservations(reservationsData.sort((a, b) => b.id - a.id));
    } catch (error) {
      console.error(error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    const amount = parseFloat(walletAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setIsAddingFunds(true);
    try {
      const updatedProfile = await userApi.addFundsToWallet(amount);
      setProfile(updatedProfile);
      toast.success(`Successfully added ${formatCurrency(amount)} to wallet`);
      setIsWalletModalOpen(false);
      setWalletAmount('');
    } catch (error) {
      toast.error('Failed to add funds');
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressApi.addAddress(newAddress);
      toast.success('Address added successfully!');
      setIsAddressModalOpen(false);
      setNewAddress({ label: '', street: '', city: '', zipCode: '' });
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const confirmDeleteAddress = async () => {
    if (!addressToDelete) return;
    try {
      await addressApi.deleteAddress(addressToDelete.id);
      toast.success('Address deleted');
      fetchProfileData();
    } catch (error) {
      toast.error('Failed to delete address');
    } finally {
      setAddressToDelete(null);
    }
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;
    try {
      await reservationApi.deleteReservation(reservationToCancel.id);
      toast.success('Reservation cancelled successfully');
      fetchProfileData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setReservationToCancel(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12 px-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-36" />
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-48" />
          <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-6">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-primary/20">
              {profile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900">{profile?.name || user?.name}</h1>
              <p className="text-gray-500">{profile?.email || user?.email}</p>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {profile?.phone}
              </p>
            </div>
          </div>

          {/* Wallet Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 min-w-[200px] text-center shadow-sm">
            <p className="text-sm font-semibold text-green-800 uppercase tracking-wider mb-1">Digital Wallet</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(profile?.walletBalance ?? 0)}</p>
            <button
              onClick={() => { setWalletAmount(''); setIsWalletModalOpen(true); }}
              className="mt-3 text-sm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Funds
            </button>
          </div>
        </div>

        {/* Addresses Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add New Address
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No addresses saved yet.</p>
              <p className="text-gray-400 text-sm mt-1">Add an address to speed up checkout.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {addresses.map(address => (
                <div key={address.id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-start hover:border-primary transition-colors group">
                  <div>
                    <span className="inline-block bg-orange-50 text-primary text-xs font-bold px-2 py-1 rounded mb-2">
                      {address.label}
                    </span>
                    <p className="text-gray-900 font-medium">{address.street}</p>
                    <p className="text-gray-500 text-sm">{address.city}, {address.zipCode}</p>
                  </div>
                  <button
                    onClick={() => setAddressToDelete(address)}
                    className="text-gray-300 group-hover:text-red-400 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reservations Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Reservations</h2>
          </div>

          {reservations.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
              <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 font-medium">No reservations found.</p>
              <p className="text-gray-400 text-sm mt-1">Book a table to see your reservations here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map(res => {
                const resDate = new Date(res.reservationTime);
                return (
                  <div key={res.id} className="border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-primary transition-colors">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-lg text-gray-900">
                          {resDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {resDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          res.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {res.status}
                        </span>
                      </div>
                      <p className="text-gray-600 font-medium">
                        🪑 {res.guestCount} {res.guestCount === 1 ? 'Guest' : 'Guests'}
                        {res.tableNumber ? ` • Table ${res.tableNumber}` : ' • Table Pending'}
                      </p>
                    </div>
                    {res.status === 'PENDING' && (
                      <button
                        onClick={() => setReservationToCancel(res)}
                        className="text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors text-sm border border-transparent hover:border-red-200"
                      >
                        Cancel Reservation
                      </button>
                    )}
                    {res.status === 'CONFIRMED' && (
                      <div className="text-right md:ml-4">
                        <p className="text-sm text-gray-500 mb-1">To cancel, please call:</p>
                        <a href="tel:+15550199" className="inline-block bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-primary/20 transition-colors">
                          +1 (555) 0199
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Wallet Top-up Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsWalletModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Add Funds to Wallet</h2>
            </div>

            <p className="text-sm text-gray-500 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-green-600 mb-6">{formatCurrency(profile?.walletBalance ?? 0)}</p>

            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Add</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    autoFocus
                    value={walletAmount}
                    onChange={e => setWalletAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {[10, 25, 50, 100].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWalletAmount(amt.toString())}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                      parseFloat(walletAmount) === amt
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-400'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsWalletModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingFunds || !walletAmount || parseFloat(walletAmount) <= 0}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isAddingFunds ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
                  ) : (
                    <>Add {walletAmount ? formatCurrency(parseFloat(walletAmount)) : 'Funds'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setIsAddressModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Address</h2>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Home, Work)</label>
                <input required type="text" value={newAddress.label} onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input required type="text" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input required type="text" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  <input required type="text" value={newAddress.zipCode} onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-primary focus:border-primary" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsAddressModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors">Save Address</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Address Confirm Modal (replaces window.confirm) */}
      {addressToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Address</h3>
            </div>
            <p className="text-gray-600 mb-6">Are you sure you want to delete the <strong>{addressToDelete.label}</strong> address? This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAddressToDelete(null)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Cancel</button>
              <button onClick={confirmDeleteAddress} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Reservation Confirm Modal (replaces window.confirm) */}
      {reservationToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Cancel Reservation</h3>
            </div>
            <p className="text-gray-600 mb-2">Are you sure you want to cancel your reservation for:</p>
            <p className="font-bold text-gray-900 mb-6">
              {new Date(reservationToCancel.reservationTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} · {reservationToCancel.guestCount} guests
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setReservationToCancel(null)} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors">Keep Reservation</button>
              <button onClick={confirmCancelReservation} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors">Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
