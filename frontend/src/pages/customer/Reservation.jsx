import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import reservationApi from '../../api/reservationApi';
import tableApi from '../../api/tableApi';
import { useSettings } from '../../context/SettingsContext';

const Reservation = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const { restaurantInfo } = useSettings();
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guestCount: 2,
    tableId: ''
  });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const data = await tableApi.getAllTables();
        setTables(data.filter(t => t.status === 'AVAILABLE'));
      } catch (error) {
        console.error("Failed to load tables", error);
      }
    };
    fetchTables();
  }, []);

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!formData.tableId) {
      toast.error('Please select a table to proceed');
      return;
    }

    setLoading(true);
    try {
      const dateTimeString = `${formData.date}T${formData.time}:00`;
      
      const payload = {
        reservationTime: dateTimeString,
        guestCount: parseInt(formData.guestCount),
        tableId: parseInt(formData.tableId)
      };

      await reservationApi.addReservation(payload);
      
      // Success toast with action hint
      toast.success(
        <div>
          <p className="font-bold">Table reserved successfully!</p>
          <p className="text-sm">Why not pre-order food to skip the wait?</p>
        </div>,
        { autoClose: 5000 }
      );
      
      navigate('/customer/menu'); // Navigate to menu for pre-ordering hint
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to make reservation';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left Side: Visual/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80" 
          alt="Elegant restaurant setting" 
          className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
        />
        <div className="relative z-20 flex flex-col justify-end p-12 h-full text-white">
          <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md self-start border border-white/20">
            Premium Experience
          </span>
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Reserve Your <br/> <span className="text-primary">Perfect Evening</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-md">
            Whether it's a romantic dinner or a family gathering, secure your spot at {restaurantInfo?.name || 'Savory'} and let us take care of the rest.
          </p>
        </div>
      </div>

      {/* Right Side: Interactive Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 bg-gray-50 overflow-y-auto min-h-screen">
        <div className="max-w-xl w-full mx-auto animate-fade-in-up">
          <div className="lg:hidden mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Reserve a Table</h1>
            <p className="text-gray-500">Book your perfect spot at {restaurantInfo?.name || 'Savory'} in advance.</p>
          </div>

          <form onSubmit={handleReserve} className="space-y-8">
            {/* Step 1: Details */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                Reservation Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Time</label>
                  <input 
                    type="time" 
                    required 
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Number of Guests</label>
                  <select 
                    required 
                    value={formData.guestCount}
                    onChange={(e) => setFormData({...formData, guestCount: e.target.value})}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,12,15].map(n => <option key={n} value={n}>{n} {n===1?'Person':'People'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 2: Visual Table Selector */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="bg-primary/10 text-primary w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                Select Your Table
              </h2>
              
              {tables.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                  <p>No tables currently available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {tables.map(table => {
                    const isSelected = formData.tableId === String(table.id);
                    const isSuitable = parseInt(formData.guestCount) <= table.capacity;
                    
                    return (
                      <button
                        key={table.id}
                        type="button"
                        onClick={() => setFormData({...formData, tableId: String(table.id)})}
                        className={`relative p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center justify-center text-center group ${
                          isSelected 
                            ? 'border-primary bg-primary/5 shadow-md scale-105' 
                            : 'border-gray-100 bg-white hover:border-primary/40 hover:bg-gray-50'
                        } ${!isSuitable ? 'opacity-50' : ''}`}
                      >
                        {isSelected && (
                          <div className="absolute -top-2 -right-2 bg-primary text-white p-1 rounded-full shadow-sm">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                          </svg>
                        </div>
                        <span className="font-bold text-gray-900 text-xs block whitespace-nowrap">{table.tableNumber}</span>
                        <div className="flex flex-col items-center mt-1 space-y-0.5">
                          <span className={`text-[10px] leading-tight ${!isSuitable ? 'text-red-500 font-bold' : 'text-gray-600 font-medium'}`}>
                            {table.capacity} seats
                          </span>
                          {table.location && (
                            <span className="text-[9px] leading-tight text-gray-400 font-bold uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                              {table.location}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Confirming...
                </>
              ) : (
                'Confirm Reservation'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
