// Edit this file to change the homepage text, links, and image paths.
export const site = {
  name: 'Jared Del Mundo',
  email: 'jared@delmundo.info',
  github: 'https://github.com/ricenoodler',
  linkedin: 'https://www.linkedin.com/in/jared-del-mundo-99ba23245/',
  resume: '/resume', // This route can later link to a PDF in public/resume.pdf.
};

export const projects = [
  {
    slug: 'proxmox-homelab', date: '2026-10-01', featured: true,
    title: 'Proxmox Homelab',
    description: 'A virtualized space for learning, testing, and running services at home.',
    detail: 'A living lab for virtual machines, containers, storage, backups, and the little experiments that become bigger infrastructure projects.',
    tags: ['Proxmox', 'Linux', 'ZFS', 'Self hosting'],
    image: '/images/projects/homelab.svg',
    imageAlt: 'Illustrated placeholder for a homelab rack at sunset',
  },
  {
    slug: 'unifi-network-segmentation', date: '2026-09-20', featured: true,
    title: 'UniFi Network Segmentation',
    description: 'VLANs, firewall rules, and a more intentional home network.',
    detail: 'A practical network design exercise separating devices by purpose, defining the traffic they need, and documenting why each rule exists.',
    tags: ['UniFi', 'Networking', 'VLAN', 'Security'],
    image: '/images/projects/unifi.svg',
    imageAlt: 'Illustrated placeholder for a segmented network',
  },
  {
    slug: 'windows-server-ad-lab', date: '2026-08-15', featured: true,
    title: 'Windows Server / Active Directory Lab',
    description: 'An environment for learning identity, policy, DNS, and administration.',
    detail: 'A hands on Windows Server lab exploring domain services, users and groups, Group Policy, and the day to day work of administration.',
    tags: ['Windows Server', 'Active Directory', 'GPO', 'DNS'],
    image: '/images/projects/windows-server.svg',
    imageAlt: 'Illustrated placeholder for a Windows Server lab',
  },
];

export const interests = [
  { number: '01', title: 'Aviation', japanese: '飛行機', description: 'Airplanes, airports, and everything that gets off the ground. I’m working toward flight training and love anything aviation related.', image: '/images/interests/aviation.svg', alt: 'Illustrated placeholder of an airplane at dusk' },
  { number: '02', title: 'Music', japanese: '音楽', description: 'Whether it’s playing, listening, or discovering new artists, music has always been a huge part of my life.', image: '/images/interests/music.svg', alt: 'Illustrated placeholder of a record player' },
  { number: '03', title: 'Photography / Travel', japanese: '写真・旅', description: 'I like capturing moments, exploring new places, and noticing good design in cities, architecture, and airports.', image: '/images/interests/photography.svg', alt: 'Illustrated placeholder of a city street at dusk' },
  { number: '04', title: 'Technology', japanese: '技術', description: 'Servers, networking, self hosting, and tinkering with systems that probably don’t need to be this complicated.', image: '/images/interests/technology.svg', alt: 'Illustrated placeholder of a desk and computer' },
];

export const values = [
  { icon: '✦', title: 'Faith', description: 'My Catholic faith shapes how I think about purpose, service, discipline, and how I treat others.' },
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
export const featuredProjects = sortedProjects.filter(p=>p.featured).slice(0,3);
