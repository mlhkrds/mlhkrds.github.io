// All site copy. Approved text stays verbatim; items marked DRAFT still need the owner's sign-off.

export type Company = { name: string; logo: string; width: number; height: number; current?: boolean };
export type WorkIcon = 'mobile' | 'web' | 'ai' | 'architecture' | 'developer' | 'leadership';
export type WorkArea = { icon: WorkIcon; title: string; text: string };
export type StackApp = { name: string; icon: string };
export type StackGroup = { id: 'mobile' | 'web' | 'ai' | 'backend' | 'cloud'; title: string; apps: StackApp[] };
export type StoryStep = { plate: string; title: string; meta: string; text: string };
export type Role = { title: string; period: string };
export type Job = { company: string; logo: string; logoWidth: number; roles: Role[]; summary: string; tags: string[] };
export type NowItem = { label: string; text: string };
export type Principle = { title: string; text: string };

export const hero = {
  badge: 'Senior Software Engineer',
  firstName: 'Melih',
  lastName: 'Karadaş',
  lead: 'I develop and implement software across mobile, web, and artificial intelligence platforms, concentrating on scalability, speed, and development efficiency.',
  primaryCta: 'Get in touch',
  secondaryCta: 'GitHub profile',
};

export const companies: { kicker: string; items: Company[] } = {
  kicker: "Where I've worked",
  items: [
    { name: 'Insider One', logo: '/logos/insider-one.png', width: 177, height: 25, current: true },
    { name: 'Quorion Software', logo: '/logos/quorion.svg', width: 137, height: 28 },
    { name: 'Erlab Technology', logo: '/logos/erlab-technology.png', width: 92, height: 33 },
    { name: 'Atatürk University', logo: '/logos/ataturk-university.png', width: 127, height: 40 },
  ],
};

export const about = {
  kicker: 'About',
  title: "Software that's fast, stable and easy to build on.",
  paragraphs: [
    'I am a senior software engineer with experience across mobile, web and backend development. On mobile, my focus is SDK development: I design cross-platform SDKs with a native iOS and Android core and plugins for React Native, Flutter and Ionic-Cordova, integrated into apps used on millions of devices. Alongside SDKs, I also build mobile apps.',
    'On the web, I built full-stack applications with Angular, Next.js, Node.js and Python, covering everything from server-side rendering to gRPC services and data layers on MySQL, Memcached and Solr. I also developed high-performance Web SDKs and REST APIs for real-time data.',
    'Lately, I have been focusing on AI-assisted software development, building agentic workflows with Claude Code and Codex and helping my team make AI part of everyday engineering.',
  ],
};

// DRAFT
export const story: { kicker: string; title: string; steps: StoryStep[] } = {
  kicker: 'How an SDK ships',
  title: 'From a native core to millions of devices.',
  steps: [
    {
      plate: '01 · Native core',
      title: 'One core, written natively',
      meta: 'Swift · Kotlin',
      text: 'The heart of the SDK lives in Swift and Kotlin: small, fast and careful with memory, because it always runs inside someone else’s app.',
    },
    {
      plate: '02 · Bridges',
      title: 'Bridges for every stack',
      meta: 'React Native · Flutter · Ionic-Cordova',
      text: 'Thin plugin layers bring the same core to React Native, Flutter and Ionic-Cordova, so every team integrates it the way they already build.',
    },
    {
      plate: '03 · Host apps',
      title: 'Live on millions of devices',
      meta: 'iOS · Android',
      text: 'Partner apps ship it to millions of devices, where stable APIs and clear documentation matter as much as speed.',
    },
  ],
};

export const work: { kicker: string; title: string; areas: WorkArea[] } = {
  kicker: 'What I work on',
  title: 'From architecture to AI-assisted delivery.',
  areas: [
    {
      icon: 'mobile',
      title: 'Mobile engineering',
      text: 'Native iOS & Android using Swift & Kotlin, respectively, and Cross Platform applications along with Plugins in React Native, Expo, Flutter, and Ionic-Cordova.',
    },
    {
      icon: 'web',
      title: 'Full-stack web',
      text: 'Angular and Next.js UIs for server-side rendering; Node.js and Python applications through gRPC protocol; data storage in MySQL, Memcached, LMDB and Solr.',
    },
    {
      icon: 'ai',
      title: 'AI-assisted development',
      text: 'Claude Code & Codex at the heart of everyday business, with customizations based on projects, Skills and MCP integration for the whole team within the company.',
    },
    {
      icon: 'architecture',
      title: 'Architecture and performance',
      text: 'Architectures that are modular and scalable, with a keen focus on memory efficiency and performance.',
    },
    {
      icon: 'developer',
      title: 'Developer experience',
      text: 'Well-documented APIs, reusable UI components, and continuous integration and delivery with automated testing on every release.',
    },
    {
      icon: 'leadership',
      title: 'Technical leadership',
      text: 'Establishing technical standards and guidance for the team, ranging from system design to AI-assisted software development practices.',
    },
  ],
};

// DRAFT (titles and dates come from the CV; summaries still need sign-off)
export const experience: { kicker: string; title: string; jobs: Job[] } = {
  kicker: 'Experience',
  title: 'From testing products to designing SDKs.',
  jobs: [
    {
      company: 'Insider One',
      logo: '/logos/insider-one.png',
      logoWidth: 124,
      roles: [
        { title: 'Senior Software Engineer', period: 'Dec 2024 – Present' },
        { title: 'Software Engineer II', period: 'Oct 2021 – Dec 2024' },
        { title: 'Software Engineer', period: 'Oct 2019 – Jun 2021' },
      ],
      summary:
        'Cross-platform mobile SDKs used in apps on millions of devices, built on the Web SDKs and partner APIs I worked on first. Lately, leading AI-assisted engineering practices across the team.',
      tags: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'Claude Code'],
    },
    {
      company: 'Quorion Software',
      logo: '/logos/quorion.svg',
      logoWidth: 100,
      roles: [{ title: 'Web Software Specialist', period: 'Jun 2021 – Oct 2021' }],
      summary: 'A drag-and-drop brochure builder in React that lets retail customers create brochures from ready-made templates.',
      tags: ['React'],
    },
    {
      company: 'Erlab Technology',
      logo: '/logos/erlab-technology.png',
      logoWidth: 68,
      roles: [{ title: 'Tester', period: 'Jun 2018 – Oct 2019' }],
      summary: 'Manual testing of the web panel for video-encoding services, improving product quality and the user experience.',
      tags: ['QA'],
    },
    {
      company: 'Atatürk University',
      logo: '/logos/ataturk-university.png',
      logoWidth: 92,
      roles: [
        { title: 'IT Support & Software Developer', period: 'Jul 2017 – Jun 2018' },
        { title: 'Consultant', period: 'Jun 2016 – Jul 2017' },
      ],
      summary: 'Supported in-house software projects while training as a developer, after keeping live and recorded lectures running smoothly.',
      tags: [],
    },
  ],
};

export const stack: { kicker: string; title: string; groups: StackGroup[] } = {
  kicker: 'Stack',
  title: 'Tools I build with.',
  // Each group runs platforms and languages first, then frameworks, then tools and services.
  groups: [
    {
      id: 'mobile',
      title: 'Mobile',
      apps: [
        { name: 'iOS', icon: 'apple' },
        { name: 'Swift', icon: 'swift' },
        { name: 'Objective-C', icon: 'devicon-objectivec' },
        { name: 'Android', icon: 'android' },
        { name: 'Kotlin', icon: 'kotlin' },
        { name: 'Java', icon: 'devicon-java' },
        { name: 'React Native', icon: 'react' },
        { name: 'Expo', icon: 'expo' },
        { name: 'Flutter', icon: 'flutter' },
        { name: 'Dart', icon: 'dart' },
        { name: 'Cordova', icon: 'apachecordova' },
        { name: 'Ionic', icon: 'ionic' },
        { name: 'Xcode', icon: 'xcode' },
        { name: 'Gradle', icon: 'gradle' },
        { name: 'CocoaPods', icon: 'cocoapods' },
        { name: 'Firebase', icon: 'firebase' },
      ],
    },
    {
      id: 'web',
      title: 'Web',
      apps: [
        { name: 'TypeScript', icon: 'typescript' },
        { name: 'JavaScript', icon: 'javascript' },
        { name: 'React', icon: 'react' },
        { name: 'Next.js', icon: 'nextdotjs' },
        { name: 'Angular', icon: 'angular' },
        { name: 'Angular Material', icon: 'devicon-angularmaterial-plain' },
        { name: 'RxJS', icon: 'reactivex' },
        { name: 'Sass', icon: 'sass' },
        { name: 'Webpack', icon: 'webpack' },
      ],
    },
    {
      id: 'backend',
      title: 'Backend & data',
      apps: [
        { name: 'Node.js', icon: 'nodedotjs' },
        { name: 'Express', icon: 'express' },
        { name: 'Python', icon: 'python' },
        { name: 'gRPC', icon: 'devicon-grpc' },
        { name: 'MySQL', icon: 'devicon-mysql' },
        { name: 'SQLite', icon: 'sqlite' },
        { name: 'Memcached', icon: 'devicon-memcached-plain' },
        { name: 'LMDB', icon: 'glyph-database' },
        { name: 'Solr', icon: 'apachesolr' },
      ],
    },
    {
      id: 'cloud',
      title: 'Cloud & delivery',
      apps: [
        { name: 'AWS', icon: 'amazonaws' },
        { name: 'Google Cloud', icon: 'googlecloud' },
        { name: 'Azure', icon: 'microsoftazure' },
        { name: 'GitHub Actions', icon: 'githubactions' },
        { name: 'Git', icon: 'git' },
        { name: 'Linux', icon: 'linux' },
        { name: 'Bash', icon: 'gnubash' },
        { name: 'Jest', icon: 'jest' },
        { name: 'Playwright', icon: 'playwright' },
        { name: 'Postman', icon: 'postman' },
        { name: 'Stryker', icon: 'stryker' },
        { name: 'Jira', icon: 'jira' },
        { name: 'Confluence', icon: 'confluence' },
      ],
    },
    {
      id: 'ai',
      title: 'AI',
      apps: [
        { name: 'Claude Code', icon: 'claude' },
        { name: 'Codex', icon: 'openai' },
        { name: 'Cursor', icon: 'cursor' },
        { name: 'MCP', icon: 'modelcontextprotocol' },
        { name: 'Agentic workflows', icon: 'glyph-agents' },
      ],
    },
  ],
};

// DRAFT
export const now: { kicker: string; title: string; updated: string; items: NowItem[] } = {
  kicker: 'Now',
  title: 'What I’m focused on.',
  updated: 'Updated September 2026',
  items: [
    { label: 'Building', text: 'Cross-platform mobile SDKs as a Senior Software Engineer.' },
    { label: 'Exploring', text: 'Agentic workflows with Claude Code and Codex, and MCP integrations that connect them to real tools.' },
    { label: 'Sharing', text: 'AI-assisted development practices with my team, from project setup to code review.' },
  ],
};

// DRAFT
export const principles: { kicker: string; title: string; items: Principle[] } = {
  kicker: 'Principles',
  title: 'How I like to build.',
  items: [
    { title: 'Performance is a feature', text: 'An SDK runs inside someone else’s app, so every kilobyte and millisecond is borrowed.' },
    { title: 'Stable APIs, boring upgrades', text: 'Integrating teams should be able to update without reading a migration guide.' },
    { title: 'Docs are part of the product', text: 'If a partner team needs a meeting to integrate, the documentation isn’t done yet.' },
    { title: 'Automate the repeatable', text: 'CI, tests and AI agents take the routine work, so people can focus on decisions.' },
  ],
};

export const contact = {
  kicker: 'Contact',
  title: "Let's talk.",
  text: 'Regardless of whether it’s engineering through mobile, web or artificial intelligence assistance, feel free to contact me. LinkedIn is the quickest way to get hold of me.',
  linkedin: 'Message me on LinkedIn',
  github: 'GitHub profile',
  x: 'Follow on X',
};

// DRAFT
export const footer = {
  copyright: '© 2026 Melih Karadaş',
  note: 'Designed and built with Next.js. Hosted on GitHub Pages.',
};
