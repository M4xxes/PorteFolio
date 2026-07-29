'use client'

import { useState } from 'react'
import { Preloader } from '@/components/sections/Preloader'
import { Hero } from '@/components/sections/Hero'
import { About } from '@/components/sections/About'
import { Skills } from '@/components/sections/Skills'
import { Projects } from '@/components/sections/Projects'
import { Experience } from '@/components/sections/Experience'
import { Contact } from '@/components/sections/Contact'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  const [loaded, setLoaded] = useState(false)

  return (
    <>
      <Preloader onComplete={() => setLoaded(true)} />
      <main>
        <Hero ready={loaded} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
