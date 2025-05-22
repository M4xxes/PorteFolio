import { motion, AnimatePresence } from 'framer-motion';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#0a0a0a] text-white">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Contact />
          
          <footer className="py-8 text-center text-sm text-gray-400">
            <p>© 2024 Maxime Pero. Tous droits réservés.</p>
          </footer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;