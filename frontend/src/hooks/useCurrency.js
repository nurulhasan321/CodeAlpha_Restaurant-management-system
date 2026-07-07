import { useSettings } from '../context/SettingsContext';

export const useCurrency = () => {
    const { restaurantInfo } = useSettings() || {};
    const currency = restaurantInfo?.currency || 'USD';

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) amount = 0;
        amount = Number(amount);
        
        const locales = {
            'USD': 'en-US',
            'EUR': 'en-IE',
            'GBP': 'en-GB',
            'INR': 'en-IN',
            'BDT': 'en-BD'
        };
        
        return new Intl.NumberFormat(locales[currency] || 'en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    return { formatCurrency, currency };
};
