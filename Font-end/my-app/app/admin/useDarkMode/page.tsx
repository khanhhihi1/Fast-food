'use client'
import { useEffect, useState } from "react";

export default function useDarkMode() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const storedMode = localStorage.getItem("darkMode");
        const mode = storedMode === "true";
        setIsDarkMode(mode);
        document.body.classList.toggle("dark-mode", mode);
    }, []);

    useEffect(() => {
        localStorage.setItem("darkMode", String(isDarkMode));
        document.body.classList.toggle("dark-mode", isDarkMode);
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    return { isDarkMode, toggleDarkMode };
}
