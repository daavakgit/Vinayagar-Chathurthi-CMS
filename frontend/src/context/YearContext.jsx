import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSettingsApi } from '../services/api';

const YearContext = createContext();

export const YearProvider = ({ children }) => {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [availableYears, setAvailableYears] = useState([2026, 2027, 2028]);
  const [settingsList, setSettingsList] = useState([]);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSettingsApi();
      if (res.success && res.data) {
        setSettingsList(res.data);
        const years = res.data.map((s) => s.year).sort((a, b) => b - a);
        setAvailableYears(years.length > 0 ? years : [2026]);

        // Find current active setting or default to selectedYear
        const currentActive = res.data.find((s) => s.isCurrentYear) || res.data[0];
        if (currentActive && !res.data.find((s) => s.year === selectedYear)) {
          setSelectedYear(currentActive.year);
        }
      }
    } catch (err) {
      console.warn('Failed to load settings from server, using defaults:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    const active = settingsList.find((s) => s.year === Number(selectedYear));
    if (active) {
      setCurrentSetting(active);
    } else {
      // Fallback default setting for selected year
      setCurrentSetting({
        eventName: 'Vinayagar Chathurthi',
        year: Number(selectedYear),
        workingDefaultAmount: 2000,
        studentDefaultAmount: 500,
        expenseCategories: [
          'Decoration',
          'Food',
          'Sound System',
          'Pooja Items',
          'Electricity',
          'Transport',
          'Printing',
          'Cleaning',
          'Hall/Ground',
          'Other',
        ],
      });
    }
  }, [selectedYear, settingsList]);

  return (
    <YearContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        availableYears,
        settingsList,
        currentSetting,
        refreshSettings: fetchSettings,
        loading,
      }}
    >
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => useContext(YearContext);
