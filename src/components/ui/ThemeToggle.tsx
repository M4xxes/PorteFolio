import { Moon, Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      className="relative w-10 h-10 flex items-center justify-center rounded-lg
                 border border-c-border bg-elevated text-c-muted
                 hover:text-accent hover:border-accent transition-colors duration-200"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.18 }}
        >
          {isDark ? <Sun size={17} /> : <Moon size={17} />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  )
}
