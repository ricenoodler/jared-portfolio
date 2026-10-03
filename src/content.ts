// Edit this file to change the homepage text, links, and image paths.
export const site = {
  name: 'Jared Del Mundo',
  email: 'jared@delmundo.info',
  github: 'https://github.com/ricenoodler',
  linkedin: 'https://www.linkedin.com/in/jared-del-mundo-99ba23245/',
  resume: '/resume', // This route can later link to a PDF in public/resume.pdf.
};

export interface Project {
  slug: string;
  date: string;
  endDate?: string;
  featured: boolean;
  featuredPriority?: number;
  title: string;
  status: string;
  description: string;
  summary: string;
  detail: string;
  tags: string[];
  image: string;
  imageAlt: string;
  caseStudy: {
    overview: string;
    motivation: string;
    implementation: { title: string; description: string }[];
    challenges: { title: string; diagnosis: string; resolution: string }[];
    lessons: string[];
    media: { src: string; alt: string; caption: string }[];
    relatedNotes: string[];
    architecture?: 'proxmox' | 'unifi';
  };
}

export const projects: Project[] = [
  {
    slug: 'proxmox-homelab', date: '2024-10-26', featured: true, featuredPriority: 1,
    title: 'Proxmox Homelab',
    status: 'Active',
    summary: 'A hands on environment for learning how virtualization, storage, services, backups, and monitoring work together.',
    description: 'A virtualized space for learning, testing, and running services at home.',
    detail: 'A living lab for virtual machines, containers, storage, backups, and the little experiments that become bigger infrastructure projects.',
    tags: ['Proxmox', 'Linux', 'ZFS', 'Self hosting'],
    image: '/images/projects/homelab.webp',
    imageAlt: 'Illustrated placeholder for a homelab rack at sunset',
    caseStudy: {
      overview: 'My homelab brings virtual machines, container services, and shared storage into one place. It gives me room to test changes, document the results, and understand how each system affects the others.',
      motivation: 'I built my homelab because I genuinely enjoy self-hosting and wanted technology I could actually use every day. What started as a place to experiment with servers grew into my own personal infrastructure, giving me plenty of storage for my files and photos, a place to host Minecraft servers for friends, and the freedom to run services without depending entirely on third-party platforms.',
      implementation: [
        { title: 'Virtualization', description: 'Proxmox organizes the host and its virtual machines, including a Debian environment for services.' },
        { title: 'Services and storage', description: 'Container services, ZFS storage, and backups.' },
        { title: 'Observability', description: 'Monitoring belongs in the map so I can follow the health of the host and its workloads.' },
      ],
      challenges: [],
      lessons: [],
      media: [],
      relatedNotes: [],
      architecture: 'proxmox',
    },
  },
  {
    slug: 'unifi-network-segmentation', date: '2025-06-26', featured: true, featuredPriority: 2,
    title: 'UniFi Network Segmentation',
    status: 'Active',
    summary: 'A home network organized around clear device groups, deliberate traffic rules, and easier troubleshooting.',
    description: 'VLANs, firewall rules, and a more intentional home network.',
    detail: 'A practical network design exercise separating devices by purpose, defining the traffic they need, and documenting why each rule exists.',
    tags: ['UniFi', 'Networking', 'VLAN', 'Security'],
    image: '/images/projects/unifi.webp',
    imageAlt: 'Illustrated placeholder for a segmented network',
    caseStudy: {
      overview: 'This project maps how the UniFi gateway, VLANs, DNS, VPN, and connected systems fit together. The aim is to make network boundaries understandable and maintainable.',
      motivation: 'I upgraded to UniFi because my previous routers kept getting in the way of what I wanted to do with my network. I wanted Pi-hole to work across the whole house without configuring every device manually, while keeping my servers and admin devices separate from family and IoT devices. UniFi gave me the control to build that properly with VLANs, firewall rules, separate Wi-Fi networks, and exceptions for things like the printer and security cameras.',
      implementation: [
        { title: 'Network groups', description: 'Trusted, Family, and IoT are the primary groups in the topology outline.' },
        { title: 'Traffic relationships', description: 'The design focuses on segmentation, firewall relationships, DNS, and VPN access.' },
        { title: 'Homelab placement', description: 'The Proxmox host appears as a networked system here; its internal services are documented in the homelab project.' },
      ],
      challenges: [],
      lessons: [],
      media: [],
      relatedNotes: [],
      architecture: 'unifi',
    },
  },
  {
    slug: 'windows-server-ad-lab', date: '2026-06-29', endDate: '2026-07-22', featured: true, featuredPriority: 3,
    title: 'Windows Server / Active Directory Lab',
    status: 'Completed',
    summary: 'A Windows Server lab for practicing identity, policy, DNS, and everyday administration.',
    description: 'An environment for learning identity, policy, DNS, and administration.',
    detail: 'A hands on Windows Server lab exploring domain services, users and groups, Group Policy, and the day to day work of administration.',
    tags: ['Windows Server', 'Active Directory', 'GPO', 'DNS'],
    image: '/images/projects/windows-server.webp',
    imageAlt: 'Screenshot of my hypervisor running 3 Virtual Machines.',
    caseStudy: {
      overview: 'This lab is a place to work through domain services, user and group administration, Group Policy, and the supporting DNS configuration.',
      motivation: 'I built it to practice the routine decisions involved in managing a Windows environment, with room to record specific configurations and fixes as the lab grows.',
      implementation: [
        { title: 'Identity', description: 'Explore users, groups, and the domain services that connect them.' },
        { title: 'Policy and DNS', description: 'Practice Group Policy and DNS administration in a controlled lab.' },
      ],
      challenges: [],
      lessons: [],
      media: [],
      relatedNotes: [],
    },
  },
];

export const interests = [
  { number: '01', title: 'Aviation', japanese: '飛行機', description: 'Airplanes, airports, and everything that gets off the ground. I’m working toward flight training and love anything aviation related.', image: '/images/interests/aviation.svg', alt: 'Illustrated placeholder of an airplane at dusk' },
  { number: '02', title: 'Music', japanese: '音楽', description: 'Whether it’s playing, listening, or discovering new artists, music has always been a huge part of my life.', image: '/images/interests/music.svg', alt: 'Illustrated placeholder of a record player' },
  { number: '03', title: 'Photography / Travel', japanese: '写真・旅', description: 'I like capturing moments, exploring new places, and noticing good design in cities, architecture, and airports.', image: '/images/interests/photography.svg', alt: 'Illustrated placeholder of a city street at dusk' },
  { number: '04', title: 'Technology', japanese: '技術', description: 'Servers, networking, self hosting, and tinkering with systems that probably don’t need to be this complicated.', image: '/images/interests/technology.svg', alt: 'Illustrated placeholder of a desk and computer' },
];

export const values = [
  { icon: '✝', title: 'Faith', description: 'My Catholic faith shapes how I think about purpose, service, discipline, and how I treat others.' },
  { icon: '◎', title: 'Curiosity', description: 'I enjoy understanding how things work instead of stopping at “it works.”' },
  { icon: '◇', title: 'Service', description: 'I value helping people, making things easier to understand, and being dependable.' },
  { icon: '↗', title: 'Growth', description: 'I want to keep learning, take on challenges, and improve over time.' },
];

export const trivia = [
  'I’m fascinated by airports almost as much as airplanes.',
  'I have a habit of turning “one small server project” into an entire infrastructure project.',
  'I almost always have music playing somewhere around me.',
  'I like city lights, architecture, and exploring new places.',
  'I document the fix because I know I’ll forget it later.',
  'I’m always down for a good plane spotting session.',
];

export const moments = [
  { title: 'Above the clouds', caption: 'A place for a favorite window seat or flying memory.', image: '/images/moments/moment-01.svg', alt: 'Illustrated placeholder for an aviation photo' },
  { title: 'City after dark', caption: 'A place for a city or travel photo and the story behind it.', image: '/images/moments/moment-02.svg', alt: 'Illustrated placeholder for a city photo' },
  { title: 'Making music', caption: 'A place for a moment on stage, in rehearsal, or behind an instrument.', image: '/images/moments/moment-03.svg', alt: 'Illustrated placeholder for a music photo' },
  { title: 'Somewhere new', caption: 'A place for a little piece of a trip worth remembering.', image: '/images/moments/moment-04.svg', alt: 'Illustrated placeholder for a travel photo' },
  { title: 'On the ground', caption: 'A place for an airport, airplane, or Pegasus Pilots moment.', image: '/images/moments/moment-05.svg', alt: 'Illustrated placeholder for an airport photo' },
  { title: 'Night lights', caption: 'A place for a frame from a city evening.', image: '/images/moments/moment-06.svg', alt: 'Illustrated placeholder for a night city photo' },
];

export const sortedProjects = [...projects].sort((a,b)=>b.date.localeCompare(a.date));
export const featuredProjects = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featuredPriority ?? Number.MAX_SAFE_INTEGER) - (b.featuredPriority ?? Number.MAX_SAFE_INTEGER)
    || a.slug.localeCompare(b.slug))
  .slice(0, 3);
