/**
 * Componente de toggle de tema com animação
 * Sol ☀️ para light mode, Lua 🌙 para dark mode
 */

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Inicializar tema baseado na preferência salva ou do sistema
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsAnimating(true);
    
    // Adicionar classe de transição
    document.documentElement.classList.add('theme-transition');
    
    setTimeout(() => {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      
      if (newIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      
      // Remover classe de transição após a animação
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
        setIsAnimating(false);
      }, 300);
    }, 150);
  };

  return (
    <button
      onClick={toggleTheme}
      disabled={isAnimating}
      className={`
        relative p-2.5 rounded-xl
        bg-gradient-to-br transition-all duration-300
        ${isDark 
          ? 'from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30' 
          : 'from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30'
        }
        border border-border/50 hover:border-border
        hover:scale-105 active:scale-95
        group
      `}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {/* Container dos ícones com animação */}
      <div className="relative w-5 h-5 overflow-hidden">
        {/* Sol */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 text-amber-500
            transition-all duration-300 ease-in-out
            ${isDark 
              ? 'rotate-90 scale-0 opacity-0' 
              : 'rotate-0 scale-100 opacity-100'
            }
          `}
        />
        
        {/* Lua */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 text-indigo-400
            transition-all duration-300 ease-in-out
            ${isDark 
              ? 'rotate-0 scale-100 opacity-100' 
              : '-rotate-90 scale-0 opacity-0'
            }
          `}
        />
      </div>
      
      {/* Efeito de brilho no hover */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        ${isDark 
          ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' 
          : 'bg-gradient-to-br from-amber-500/10 to-orange-500/10'
        }
      `} />
      
      {/* Indicador de estado (ponto colorido) */}
      <div className={`
        absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full
        transition-all duration-300
        ${isDark 
          ? 'bg-indigo-400 shadow-[0_0_6px_2px_rgba(129,140,248,0.5)]' 
          : 'bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.5)]'
        }
      `} />
    </button>
  );
}

