export const site = {
  name: 'Maxime Pero',
  role: 'Développeur Full-Stack',
  email: 'maximepero12@gmail.com',
  github: 'https://github.com/M4xxes',
  githubUser: 'M4xxes',
  linkedin: 'https://www.linkedin.com/in/maxime-pero-b320a3356/',
  cvUrl: '/assets/cv-maxime-pero.pdf',
  cvPreviewUrl: '/assets/cv-preview.webp',
  photoUrl: '/assets/profile.jpg',
  location: 'Lyon, France',
  availability: 'Ouvert à l’alternance et aux projets freelance',
  description:
    'Portfolio de Maxime Pero, développeur full-stack à Lyon : sites et applications web en React, TypeScript et Node.js, du site vitrine à l’écran de supervision industrielle.',
  // Netlify expose l'URL de production dans `URL` au moment du build.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? 'http://localhost:3000',
}

export const navLinks = [
  { href: '/', label: 'Accueil', index: '00' },
  { href: '/projects', label: 'Projets', index: '01' },
  { href: '/about', label: 'À propos', index: '02' },
  { href: '/contact', label: 'Contact', index: '03' },
] as const

export const INTRO_STORAGE_KEY = 'portfolio:intro-seen'

export const easing = {
  smooth: [0.16, 1, 0.3, 1] as const,
  inOut: [0.76, 0, 0.24, 1] as const,
}
