import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [restaurantInfo, setRestaurantInfo] = useState({
        name: 'Savory Restaurant',
        address: '123 Culinary Boulevard, Food City, FC 90210',
        phone: '+1 (555) 0199',
        email: 'hello@savory.com',
        openingTime: '09:00',
        closingTime: '22:00',
        currency: 'USD',
        taxRate: 5
    });

    const [isLoadingSettings, setIsLoadingSettings] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await api.get('/api/settings');
                if (response.data) {
                    setRestaurantInfo({
                        name: response.data.name || 'Savory Restaurant',
                        address: response.data.address || '',
                        phone: response.data.phone || '',
                        email: response.data.email || '',
                        openingTime: response.data.openingTime || '09:00',
                        closingTime: response.data.closingTime || '22:00',
                        currency: response.data.currency || 'USD',
                        taxRate: response.data.taxRate || 5
                    });
                }
            } catch (error) {
                console.error("Failed to load restaurant settings:", error);
            } finally {
                setIsLoadingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ restaurantInfo, isLoadingSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
