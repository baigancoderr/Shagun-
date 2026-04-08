import { createContext, useContext, useState, useEffect } from "react";

const DemoModeContext = createContext();

export const useDemoMode = () => {
    const context = useContext(DemoModeContext);
    if (!context) {
        throw new Error("useDemoMode must be used within DemoModeProvider");
    }
    return context;
};

export const DemoModeProvider = ({ children }) => {
    // Check localStorage for demo mode status
    const [isDemoMode, setIsDemoMode] = useState(() => {
        return localStorage.getItem("userDemoMode") === "true";
    });

    // Sync with localStorage whenever demo mode changes
    useEffect(() => {
        if (isDemoMode) {
            localStorage.setItem("userDemoMode", "true");
        } else {
            localStorage.removeItem("userDemoMode");
        }
    }, [isDemoMode]);

    const value = {
        isDemoMode,
        setIsDemoMode,
    };

    return (
        <DemoModeContext.Provider value={value}>
            {children}
        </DemoModeContext.Provider>
    );
};
