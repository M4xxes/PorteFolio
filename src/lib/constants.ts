export const site = {
  name: 'Maxime Pero',
  role: 'Développeur Full-Stack',
  email: 'maximepero12@gmail.com',
  github: 'https://github.com/M4xxes',
  githubUser: 'M4xxes',
  linkedin: 'https://www.linkedin.com/in/maximepero-b320a3356',
  cvUrl: '/assets/cv-maxime-pero.pdf',
  cvPreviewUrl: '/assets/cv-preview.webp',
  photoUrl: '/assets/profile.jpg',
  location: 'Lyon, France',
  availability: 'Ouvert au CDI et aux missions freelance',
  description:
    'Maxime Pero, développeur web full-stack à Lyon. React, TypeScript, Node.js. Sites vitrines, applications web et interfaces industrielles. Ouvert à un CDI et aux missions freelance.',
  // Netlify expose l'URL de production dans `URL` au moment du build.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? 'http://localhost:3000',
}

export const navLinks = [
  { href: '/#top', label: 'Accueil', index: '00' },
  { href: '/#projets', label: 'Projets', index: '01' },
  { href: '/a-propos', label: 'À propos', index: '02' },
] as const
