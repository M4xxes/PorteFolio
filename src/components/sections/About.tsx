import { site } from '@/lib/constants'
import { Button, Container, SectionHead } from '@/components/ui/Kit'
import { Ext } from '@/components/ui/Glyph'

/** À propos, en deux mini-blocs. */
export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="py-28 lg:py-40">
      <Container>
        <SectionHead index="04" label="À propos" title={<span id="about-title">Maxime Pero</span>} />
        <div className="mt-16 grid gap-x-6 gap-y-14 lg:grid-cols-12">
          <div className="border-t border-line pt-4 lg:col-span-5">
            <h3 className="ui text-fg-2">À propos</h3>
            <p className="mt-6 text-base">
              Je suis en Bachelor Informatique à Ynov Lyon depuis 2023, en spécialité full-stack web. Je travaille surtout en
              React, TypeScript et Node.js. J’ai livré des projets pour de vrais clients : un écran de supervision
              industrielle, le site d’une praticienne en massage équin, le portfolio d’une photographe.
            </p>
          </div>
          <div className="border-t border-line pt-4 lg:col-span-5 lg:col-start-7">
            <h3 className="ui text-fg-2">Avec qui je travaille</h3>
            <p className="mt-6 text-base">
              Je cherche une alternance dans une équipe produit ou un studio web. Je prends aussi des projets freelance
              pour des TPE : site vitrine, refonte d’un site existant, petit outil métier. Chaque projet ci-dessus indique
              ce que j’y ai fait, et ce qui revient à quelqu’un d’autre.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap gap-2">
          <Button href={site.cvUrl} external variant="outline">
            CV (PDF)<Ext />
          </Button>
          <Button href={site.github} external variant="text">
            GitHub<Ext />
          </Button>
          <Button href={site.linkedin} external variant="text">
            LinkedIn<Ext />
          </Button>
        </div>
      </Container>
    </section>
  )
}
