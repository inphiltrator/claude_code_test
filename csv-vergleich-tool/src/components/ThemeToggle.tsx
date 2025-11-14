import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/button';

export function ThemeToggle() {
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleDarkMode}
      aria-label="Toggle dark mode"
    >
      {darkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  );
}
