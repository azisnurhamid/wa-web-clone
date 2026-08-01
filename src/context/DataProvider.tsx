import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSettings } from '../services/api';

interface AppData {
  botReplies: any;
  contacts: any;
  scenarios: any;
  app: any;
  assets: any;
  payment: any;
  seo: any;
  theme: any;
  locales: {
    id: any;
    en: any;
  };
}

interface DataContextType {
  data: AppData | null;
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextType>({
  data: null,
  loading: true,
  error: null
});

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await fetchSettings();
        const parsedData: any = {};
        
        // Settings come back as [{ key: '...', value: '...' }]
        if (Array.isArray(settings)) {
          settings.forEach((setting: any) => {
            try {
              parsedData[setting.key] = JSON.parse(setting.value);
            } catch (e) {
              console.error(`Failed to parse JSON for key ${setting.key}`);
            }
          });
        }
        
        // Make sure we have the required data
        const appData: AppData = {
          botReplies: parsedData['bot-replies'] || {},
          contacts: parsedData['contacts'] || {},
          scenarios: parsedData['scenarios'] || {},
          app: parsedData['app'] || {},
          assets: parsedData['assets'] || {},
          payment: parsedData['payment'] || {},
          seo: parsedData['seo'] || {},
          theme: parsedData['theme'] || {},
          locales: {
            id: parsedData['locales-id'] || {},
            en: parsedData['locales-en'] || {}
          }
        };
        
        setData(appData);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch app data:", err);
        setError(err.message || "Failed to load data");
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-[#f0f2f5]">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-[#667781] font-medium">Loading Application Data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-screen w-full flex items-center justify-center bg-[#f0f2f5]">
          <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
            <h2 className="text-2xl text-red-500 font-bold mb-4">Error Loading Data</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#00a884] text-white px-6 py-2 rounded shadow hover:bg-[#008f6f]"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        children
      )}
    </DataContext.Provider>
  );
};
