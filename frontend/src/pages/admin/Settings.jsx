import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import settingsApi from '../../api/settingsApi';

// Simple tab component used only in this file
const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
      active
        ? 'bg-primary text-white shadow-md shadow-primary/25'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
    </svg>
    {label}
  </button>
);

const ICONS = {
  restaurant: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  automation: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('restaurant');

  // ─── Restaurant Info State ───
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'Savory Restaurant',
    address: '123 Culinary Boulevard, Food City, FC 90210',
    phone: '+1 (555) 0199',
    email: 'hello@savory.com',
    openingTime: '09:00',
    closingTime: '22:00',
    currency: 'USD',
    taxRate: '5',
  });
  const [savingInfo, setSavingInfo] = useState(false);

  // ─── Change Password State ───
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // ─── Notifications State ───
  const [notifications, setNotifications] = useState({
    notifyNewOrders: true,
    notifyNewReservations: true,
    notifyLowStock: true,
    notifyOrderCompleted: false,
    notifyDailyReport: false,
  });

  // ─── Order Automation State ───
  const [automation, setAutomation] = useState({
    autoUpdatePendingToPreparing: 1,
    autoUpdatePreparingToReady: 2,
    autoUpdateReadyToCompleted: 2,
    autoUpdateOutForDeliveryToCompleted: 3,
  });
  const [savingAutomation, setSavingAutomation] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await settingsApi.getSettings();
        setRestaurantInfo({
          name: data.name || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || '',
          openingTime: data.openingTime || '',
          closingTime: data.closingTime || '',
          currency: data.currency || 'USD',
          taxRate: data.taxRate || '5',
        });
        setNotifications({
          notifyNewOrders: data.notifyNewOrders ?? true,
          notifyNewReservations: data.notifyNewReservations ?? true,
          notifyLowStock: data.notifyLowStock ?? true,
          notifyOrderCompleted: data.notifyOrderCompleted ?? false,
          notifyDailyReport: data.notifyDailyReport ?? false,
        });
        setAutomation({
          autoUpdatePendingToPreparing: data.autoUpdatePendingToPreparing ?? 1,
          autoUpdatePreparingToReady: data.autoUpdatePreparingToReady ?? 2,
          autoUpdateReadyToCompleted: data.autoUpdateReadyToCompleted ?? 2,
          autoUpdateOutForDeliveryToCompleted: data.autoUpdateOutForDeliveryToCompleted ?? 3,
        });
      } catch (err) {
        toast.error('Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveRestaurantInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    try {
      await settingsApi.updateRestaurantInfo(restaurantInfo);
      toast.success('Restaurant settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save restaurant settings');
    } finally {
      setSavingInfo(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await settingsApi.updateNotificationPreferences(notifications);
      toast.success('Notification preferences saved!');
    } catch (err) {
      toast.error('Failed to save notification preferences');
    }
  };

  const handleSaveAutomation = async (e) => {
    e.preventDefault();
    setSavingAutomation(true);
    try {
      await settingsApi.updateRestaurantInfo({ ...restaurantInfo, ...automation });
      toast.success('Automation settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save automation settings');
    } finally {
      setSavingAutomation(false);
    }
  };

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white text-gray-900 transition-all';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your restaurant configuration and preferences</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {user?.name} <span className="text-gray-300">·</span> <span className="text-primary font-semibold">{user?.role}</span>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">

        {/* Sidebar Tabs */}
        <div className="lg:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto">
            <TabButton active={activeTab === 'restaurant'} onClick={() => setActiveTab('restaurant')} icon={ICONS.restaurant} label="Restaurant" />
            <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} icon={ICONS.automation} label="Automation" />
            <TabButton active={activeTab === 'password'} onClick={() => setActiveTab('password')} icon={ICONS.lock} label="Password" />
            <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={ICONS.bell} label="Notifications" />
            <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={ICONS.info} label="About" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">

          {/* ── Restaurant Info Tab ── */}
          {activeTab === 'restaurant' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Restaurant Information</h2>
              <p className="text-sm text-gray-500 mb-8">Update your restaurant's public-facing details</p>

              {isLoading ? (
                <div className="animate-pulse space-y-6">
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-12 bg-gray-100 rounded-xl" />
                  <div className="h-12 bg-gray-100 rounded-xl" />
                </div>
              ) : (
                <form onSubmit={handleSaveRestaurantInfo} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Restaurant Name</label>
                    <input type="text" value={restaurantInfo.name} onChange={e => setRestaurantInfo({...restaurantInfo, name: e.target.value})} className={inputCls} required />
                  </div>
                  <div>
                    <label className={labelCls}>Contact Email</label>
                    <input type="email" value={restaurantInfo.email} onChange={e => setRestaurantInfo({...restaurantInfo, email: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Phone Number</label>
                    <input type="tel" value={restaurantInfo.phone} onChange={e => setRestaurantInfo({...restaurantInfo, phone: e.target.value})} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Address</label>
                    <input type="text" value={restaurantInfo.address} onChange={e => setRestaurantInfo({...restaurantInfo, address: e.target.value})} className={inputCls} />
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Operating Hours</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Opening Time</label>
                      <input type="time" value={restaurantInfo.openingTime} onChange={e => setRestaurantInfo({...restaurantInfo, openingTime: e.target.value})} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Closing Time</label>
                      <input type="time" value={restaurantInfo.closingTime} onChange={e => setRestaurantInfo({...restaurantInfo, closingTime: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Billing Configuration</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelCls}>Currency</label>
                      <select value={restaurantInfo.currency} onChange={e => setRestaurantInfo({...restaurantInfo, currency: e.target.value})} className={inputCls}>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="INR">INR — Indian Rupee</option>
                        <option value="BDT">BDT — Bangladeshi Taka</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Tax Rate (%)</label>
                      <input type="number" min="0" max="100" step="0.1" value={restaurantInfo.taxRate} onChange={e => setRestaurantInfo({...restaurantInfo, taxRate: e.target.value})} className={inputCls} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={savingInfo} className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20 disabled:opacity-60 flex items-center gap-2">
                    {savingInfo ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <>Save Changes</>
                    )}
                  </button>
                </div>
              </form>
              )}
            </div>
          )}

          {/* ── Automation Tab ── */}
          {activeTab === 'automation' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Order Automation</h2>
              <p className="text-sm text-gray-500 mb-8">Set the time in minutes for orders to automatically progress through statuses.</p>

              <form onSubmit={handleSaveAutomation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>Pending → Preparing</label>
                    <div className="relative">
                      <input type="number" min="1" max="1440" value={automation.autoUpdatePendingToPreparing} onChange={e => setAutomation({...automation, autoUpdatePendingToPreparing: e.target.value})} className={inputCls} required />
                      <span className="absolute right-4 top-3 text-gray-500 text-sm">minutes</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Preparing → Ready / Out for Delivery</label>
                    <div className="relative">
                      <input type="number" min="1" max="1440" value={automation.autoUpdatePreparingToReady} onChange={e => setAutomation({...automation, autoUpdatePreparingToReady: e.target.value})} className={inputCls} required />
                      <span className="absolute right-4 top-3 text-gray-500 text-sm">minutes</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Ready → Completed</label>
                    <div className="relative">
                      <input type="number" min="1" max="1440" value={automation.autoUpdateReadyToCompleted} onChange={e => setAutomation({...automation, autoUpdateReadyToCompleted: e.target.value})} className={inputCls} required />
                      <span className="absolute right-4 top-3 text-gray-500 text-sm">minutes</span>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Out for Delivery → Completed</label>
                    <div className="relative">
                      <input type="number" min="1" max="1440" value={automation.autoUpdateOutForDeliveryToCompleted} onChange={e => setAutomation({...automation, autoUpdateOutForDeliveryToCompleted: e.target.value})} className={inputCls} required />
                      <span className="absolute right-4 top-3 text-gray-500 text-sm">minutes</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={savingAutomation} className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20 disabled:opacity-60 flex items-center gap-2">
                    {savingAutomation ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                    ) : (
                      <>Save Automation Settings</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Password Tab ── */}
          {activeTab === 'password' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Change Password</h2>
              <p className="text-sm text-gray-500 mb-8">Update your account password. You will remain logged in after changing it.</p>

              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div>
                  <label className={labelCls}>Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className={inputCls}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className={inputCls}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400'].map((color, i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                            passwordData.newPassword.length > i * 3 ? color : 'bg-gray-200'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400">
                        {passwordData.newPassword.length < 4 ? 'Weak' :
                         passwordData.newPassword.length < 8 ? 'Fair' :
                         passwordData.newPassword.length < 12 ? 'Good' : 'Strong'} password
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className={labelCls}>Confirm New Password</label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className={`${inputCls} ${
                      passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword
                        ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                  <span className="text-sm text-gray-600">Show passwords</span>
                </label>

                <button
                  type="submit"
                  disabled={savingPassword || !passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
                  className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20 disabled:opacity-60 flex items-center gap-2"
                >
                  {savingPassword ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing...</>
                  ) : 'Change Password'}
                </button>
              </form>
            </div>
          )}

          {/* ── Notifications Tab ── */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Notification Preferences</h2>
              <p className="text-sm text-gray-500 mb-8">Choose which events trigger notifications in the admin panel</p>

              <div className="space-y-4">
                {[
                  { key: 'notifyNewOrders', label: 'New Orders', desc: 'Get notified when a new order is placed' },
                  { key: 'notifyNewReservations', label: 'New Reservations', desc: 'Get notified when a new reservation is made' },
                  { key: 'notifyLowStock', label: 'Low Stock Alerts', desc: 'Warn when inventory falls below the threshold' },
                  { key: 'notifyOrderCompleted', label: 'Order Completed', desc: 'Notify when an order is marked as completed' },
                  { key: 'notifyDailyReport', label: 'Daily Summary Report', desc: 'Receive a daily summary of orders and revenue' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                        notifications[key] ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                        notifications[key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-8">
                <button onClick={handleSaveNotifications} className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-md shadow-primary/20">
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* ── About Tab ── */}
          {activeTab === 'about' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">System Information</h2>
              <div className="space-y-4">
                {[
                  { label: 'Application', value: 'Savory Restaurant Management System' },
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Backend', value: 'Spring Boot 3.5.3 · Java 17' },
                  { label: 'Frontend', value: 'React 19 · Vite 8 · TailwindCSS 4' },
                  { label: 'Database', value: 'MySQL 8' },
                  { label: 'Authentication', value: 'JWT (HttpOnly Cookies) · BCrypt' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                    <span className="text-sm font-semibold text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
