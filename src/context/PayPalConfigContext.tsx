import React, { createContext, useContext, ReactNode } from 'react';

interface PayPalConfigContextType {
  isConnected: boolean;
}

const PayPalConfigContext = createContext<PayPalConfigContextType | undefined>(undefined);

export const PayPalConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <PayPalConfigContext.Provider value={{ isConnected: false }}>
      {children}
    </PayPalConfigContext.Provider>
  );
};

export function usePayPalConfig(): PayPalConfigContextType {
  const ctx = useContext(PayPalConfigContext);
  if (!ctx) throw new Error('usePayPalConfig must be used within PayPalConfigProvider');
  return ctx;
}
