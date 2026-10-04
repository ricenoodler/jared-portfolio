// Edit this file to change the homepage text, links, and image paths.
export const site = {
  name: 'Jared Del Mundo',
  email: 'jared@delmundo.info',
  instagram: 'https://www.instagram.com/from_jared/',
  github: 'https://github.com/ricenoodler',
  linkedin: 'https://www.linkedin.com/in/jared-del-mundo-99ba23245/',
  resume: '/resume.pdf', // Place the PDF at public/resume.pdf.
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
    media: { src?: string; alt: string; caption: string; plannedPath?: string }[];
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
    title: 'Windows Server & Active Directory Lab',
    status: 'Completed',
    summary: 'Built and administered a three-machine Windows environment, from virtual networking and DNS to Active Directory, domain membership, and automated tasks with PowerShell.',
    description: 'Built a multi-VM Windows Server lab for networking, Active Directory, DNS, user and OU administration, Task Scheduler, and PowerShell automation.',
    detail: 'Two Windows Server 2025 VMs and a Windows 11 Education client formed a progressively built savn.local domain in VMware Workstation.',
    tags: ['Windows Server 2025', 'Windows 11', 'Active Directory', 'Active Directory Domain Services', 'DNS', 'PowerShell', 'Task Scheduler', 'VMware Workstation', 'Virtual Networking', 'System Administration'],
    image: '/images/projects/windows-server.webp',
    imageAlt: 'VMware Workstation showing the three virtual machines in the Windows lab.',
    caseStudy: {
      overview: 'I built a three-machine lab with two Windows Server 2025 VMs and a Windows 11 Education client. After checking IP configuration and connectivity across the virtual network, I promoted the primary server to a domain controller for savn.local. I then added DNS, domain membership, organizational units, user administration, scheduled tasks, and PowerShell automation.',
      motivation: 'I wanted to see how everyday Windows administration fits together in a working environment. Each stage depended on the last: network connectivity first, then DNS and the directory, then centralized accounts and automated tasks.',
      implementation: [
        { title: 'Virtual networking', description: 'Created three VMs in VMware Workstation, reviewed their IP configuration, and used ping from each system to confirm that all three could communicate.' },
        { title: 'Active Directory and DNS', description: 'Installed Active Directory Domain Services, promoted JMD-SU26-S25-S1 to the savn.local domain controller, configured DNS, and joined the member server and Windows 11 client to the domain.' },
        { title: 'Organizational units', description: 'Created Administration, Research, and Sales OUs to organize domain objects and give the directory a clear administrative structure.' },
        { title: 'Local and domain accounts', description: 'Created local and domain users, placed a domain user in the Administration OU, and tested both types of login. I also checked what happened when the domain controller was unavailable.' },
        { title: 'Task Scheduler', description: 'Created a task from the domain controller for the second Windows Server. A domain-user logon trigger launched Notepad when that user signed in.' },
        { title: 'PowerShell automation', description: 'Wrote a PowerShell script and scheduled it to run at logon, displaying a welcome message, the current date and time, and the domain name.' },
      ],
      challenges: [],
      lessons: [
        'This lab connected Windows administration concepts that made more sense together than in isolation. Network connectivity had to work before DNS and Active Directory could support the rest of the environment.',
        'Managing local and domain accounts side by side made the difference between machine-level access and centralized authentication concrete. The OUs gave the directory a useful structure for administration.',
        'Testing a login while the domain controller was unavailable made the dependency on centralized services especially clear. Remote scheduled tasks and the PowerShell logon script showed how administration can move from manual steps toward repeatable actions.',
      ],
      media: [
        { alt: 'Planned screenshot of connectivity between all three VMs', caption: 'Connectivity across the three-machine virtual network', src: '/images/projects/windows-lab/connectivity.webp' },
        { alt: 'Planned screenshot of Active Directory Users and Computers', caption: 'Active Directory Users and Computers', src: '/images/projects/windows-lab/active-directory.webp' },
        { alt: 'Planned screenshot of the Administration, Research, and Sales organizational units', caption: 'Administration, Research, and Sales OUs', src: '/images/projects/windows-lab/organizational-units.webp' },
        { alt: 'Planned screenshot of a domain user in the Administration OU', caption: 'Domain user in the Administration OU', src: '/images/projects/windows-lab/domain-user.webp' },
        { alt: 'Planned screenshot of a successful domain login', caption: 'Successful domain login', src: '/images/projects/windows-lab/domain-login.webp' },
        { alt: 'Planned screenshot of login behavior without the domain controller', caption: 'Login behavior with the domain controller unavailable', src: '/images/projects/windows-lab/controller-unavailable.webp' },
        { alt: 'Planned screenshot of the remote scheduled task configuration', caption: 'Remote task in Task Scheduler', src: '/images/projects/windows-lab/task-scheduler.webp' },
        { alt: 'Planned screenshot of the PowerShell scheduled task output', caption: 'PowerShell logon script output', src: '/images/projects/windows-lab/powershell-output.webp' },
      ],
      relatedNotes: [],
    },
  }
];

export const aboutContent = {
  heading: 'About Me',
  subheading: 'A little more about me.',
  paragraphs: [
    'I have a REALLY bad habit of getting way too interested in things, which usually starts with “I’ll just try this” and ends with me several hours deep into something I definitely did not plan on doing. (Like making this website!)',
    'Right now, I’m finishing my IT degree at UCF, building experience, and figuring out what I want the next few years of my life to look like. I like learning things because they’re genuinely interesting to me, not just because they make a good résumé bullet.',
    'I care a lot about doing things well, being useful to the people around me, and making room for the things I actually enjoy.',
    'Welcome to my website and enjoy my collection of projects and thoughts I CAN’T fit on a resume!',
  ],
};

export interface AboutPhoto {
  image: string;
  alt: string;
  caption: string;
  plannedPath?: string;
}

// Replace image paths with your own photos in public/images/about/ as you add them.
export const aboutPhotos: AboutPhoto[] = [
  { image: '/images/about/aviation.webp', alt: 'Jared holding his private pilot certificate beside an aircraft and examiner', caption: 'Aviation and flight training' },
  { image: '/images/about/music.gif', alt: 'Jared working on a music recording', caption: 'Making music' },
  { image: '/images/about/travel.webp', alt: 'A Chicago train viewed during a trip', caption: 'Travel and photography' },
  { image: '/images/about/homelab.webp', alt: 'Jared working inside a computer case', caption: 'Building and learning with technology' },
  { image: '', alt: 'Pegasus Pilots photo to be added', caption: 'Pegasus Pilots', plannedPath: '/images/about/pegasus-pilots.webp' },
  { image: '', alt: 'Church audiovisual team photo to be added', caption: 'Church AV', plannedPath: '/images/about/church-av.webp' },
];

export const interests = [
  { number: '01', title: 'Aviation', description: 'Airplanes, airports, and everything that gets off the ground. I’m working toward flight training and love anything aviation related.', image: '/images/interests/checkridedpe.webp', alt: 'Me holding my Private Pilots License standing next to a Designated Pilot Examiner (DPE)' },
  { number: '02', title: 'Music', description: 'Whether it’s playing, listening, or discovering new artists, music has always been a huge part of my life.', image: '/images/interests/garagebandrecording.gif', alt: 'Illustrated placeholder of a record player' },
  { number: '03', title: 'Photography / Travel', description: 'I like capturing moments, exploring new places, and noticing good design in cities, architecture, and airports.', image: '/images/interests/trainchicago.webp', alt: 'Blurred picture of red line train through Howard Station in Chicago' },
  { number: '04', title: 'Technology', description: 'Servers, networking, self hosting, and tinkering with systems that probably don’t need to be this complicated.', image: '/images/interests/buildingnode.webp', alt: 'Illustrated placeholder of a desk and computer' },
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
