import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { projects } from '@/lib/data/projects'
import { aboutProjects, infos, parcours, PROJECT_LINKS } from '@/lib/data/about'
import { skillCategories } from '@/lib/data/skills'
import { site } from '@/lib/constants'
import { Reveal } from '@/components/about/Reveal'
import { ContactBlock } from '@/components/about/ContactBlock'
import '@/components/hub/hub.css'

export const metadata: Metadata = {
  title: 'À propos',
  description: site.description,
  alternates: { canonical: '/a-propos' },
  openGraph: { title: `À propos — ${site.name}`, description: site.description, url: '/a-propos' },
}

const NAV = [
  ['about', 'à propos'],
  ['parcours', 'parcours'],
  ['stack', 'stack'],
  ['projets', 'projets'],
  ['contact', 'contact'],
] as const

export default function AboutPage() {
  return (
    <main id="main" className="proj ab">
      <div className="proj-top">
        <a href="/#projets" className="proj-back">
          <span aria-hidden>←</span> Retour aux projets
        </a>
        <nav aria-label="Sections" className="ab-nav">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="proj-wrap">
        <Reveal id="about" className="ab-about">
          <figure className="ab-photo">
            <Image src="/images/maxime.jpg" alt="Maxime Pero, développeur web" width={640} height={800} sizes="(min-width: 860px) 320px, 80vw" priority />
            <figcaption>~/maxime $ whoami</figcaption>
          </figure>
          <div className="ab-text">
            <h1 className="ab-h">[à propos]</h1>
            <p>
              Je suis Maxime, développeur web full-stack basé à Lyon. Je sors d’un Bachelor Informatique (Bac+3) spécialisé en développement web full-stack, et avant ça d’un Bac Pro Systèmes Numériques orienté réseaux. Cette double base, code et infrastructure, me permet de comprendre une application de bout en bout : de l’interface jusqu’au serveur qui la fait tourner.
            </p>
            <p>
              Je conçois des sites et des applications sur mesure, du site vitrine à l’écran de supervision industrielle. Côté front, je travaille avec React, TypeScript et Vite. Côté back, avec Node.js, Express et des API REST. Je développe aussi en mobile avec Flutter, et j’ai touché à l’industriel (Node-RED, OPC-UA, Modbus) sur un vrai projet client.
            </p>
            <p>
              En parallèle, je travaille en freelance (auto-entrepreneur) pour des particuliers et des professionnels : je recueille le besoin, je développe, je mets en ligne et j’accompagne le client dans la prise en main de son site. Trois ans au contact direct des clients m’ont appris à écouter, à rester calme sous pression et à expliquer simplement des choses techniques.
            </p>
            <p className="ab-off">hors écran → sport mécanique, moto, escalade en club (3 ans) et musique_</p>
            <dl className="ab-term">
              {infos.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal id="parcours">
          <h2 className="ab-h">[parcours]</h2>
          <ol className="ab-time">
            {parcours.map((p) => (
              <li key={p.title}>
                <span className="ab-date">{p.date}</span>
                <strong>{p.title}</strong>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal id="stack">
          <h2 className="ab-h">[stack]</h2>
          <div className="ab-stack">
            {skillCategories.map((c) => (
              <div key={c.id}>
                <h3>{c.label}</h3>
                <ul className="proj-chips">
                  {c.skills.map((s) => (
                    <li key={s}>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal id="projets">
          <h2 className="ab-h">[projets]</h2>
          <div className="ab-projects">
            {aboutProjects.map((ap) => {
              const p = projects.find((x) => x.id === ap.id)
              if (!p) return null
              const links = PROJECT_LINKS[p.id] ?? { github: '', demo: '' }
              const github = links.github || p.repoUrl || (p.repo ? `${site.github}/${p.repo}` : '')
              const demo = links.demo || p.demoUrl || ''
              return (
                <article key={p.id} className="ab-card">
                  <h3>{ap.title}</h3>
                  <p>{ap.text ?? p.description}</p>
                  <ul className="proj-chips">
                    {(ap.tags ?? p.stack).map((t) => (
                      <li key={t}>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="ab-links">
                    <Link href={`/projets/${p.id}`}>fiche -&gt;</Link>
                    {demo && (
                      <a href={demo} target="_blank" rel="noreferrer">
                        démo -&gt;
                      </a>
                    )}
                    {github && (
                      <a href={github} target="_blank" rel="noreferrer">
                        github -&gt;
                      </a>
                    )}
                  </p>
                </article>
              )
            })}
          </div>
        </Reveal>

        <Reveal id="contact">
          <h2 className="ab-h">[contact]</h2>
          <ContactBlock />
        </Reveal>
      </div>
    </main>
  )
}
