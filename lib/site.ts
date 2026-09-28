export type SectionId = 'about' | 'story' | 'work' | 'experience' | 'stack' | 'now' | 'principles' | 'contact';
export type Section = { id: SectionId; label: string; inNav: boolean };

type Site = {
  url: string;
  links: { linkedin: string; github: string; x: string };
  email: string | null;
  cvUrl: string | null;
};

export const site: Site = {
  url: 'https://mlhkrds.dev',
  links: {
    linkedin: 'https://www.linkedin.com/in/melih-karadas/',
    github: 'https://github.com/mlhkrds',
    x: 'https://x.com/mlhkrdsdev',
  },
  email: null,
  cvUrl: null,
};

export const sections: Section[] = [
  { id: 'about', label: 'About', inNav: true },
  { id: 'story', label: 'SDK story', inNav: false },
  { id: 'work', label: 'Work', inNav: true },
  { id: 'experience', label: 'Experience', inNav: true },
  { id: 'stack', label: 'Stack', inNav: true },
  { id: 'now', label: 'Now', inNav: false },
  { id: 'principles', label: 'Principles', inNav: false },
  { id: 'contact', label: 'Contact', inNav: true },
];
