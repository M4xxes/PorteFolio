import { ThemeProvider } from './context/ThemeContext'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { About } from './components/sections/About'
import { Skills } from './components/sections/Skills'
import { Projects } from './components/sections/Projects'
import { Experience } from './components/sections/Experience'
import { Education } from './components/sections/Education'
import { Interests } from './components/sections/Interests'
import { Contact } from './components/sections/Contact'

function App() {
  return (
    <ThemeProvider>
      {/* Fond global géré par les variables CSS dans index.css */}
      <div className="min-h-screen bg-bg text-c-text font-sans">
        <Navbar />

        <main id="main-content">
          <Hero />
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Education />
          <Interests />
          <Contact />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  )
}

export default App
