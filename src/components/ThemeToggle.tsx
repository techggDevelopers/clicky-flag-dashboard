import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/lib/themeStore';
import { motion } from 'framer-motion';

export function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="relative h-9 w-9 rounded-md border border-transparent bg-transparent hover:bg-secondary/80 flex items-center justify-center"
            aria-label="Toggle theme"
        >
            <div className="relative h-5 w-5">
                <Sun
                    className={`absolute h-5 w-5 transition-all ${theme === 'dark'
                            ? 'scale-0 rotate-[-180deg] opacity-0'
                            : 'scale-100 rotate-0 opacity-100'
                        }`}
                />
                <Moon
                    className={`absolute h-5 w-5 transition-all ${theme === 'dark'
                            ? 'scale-100 rotate-0 opacity-100'
                            : 'scale-0 rotate-180 opacity-0'
                        }`}
                />
            </div>
        </motion.button>
    );
} 