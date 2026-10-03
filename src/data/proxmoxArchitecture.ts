import type { Architecture, ArchitectureConnection, ArchitectureNode } from './architecture';

// Public inventory only. Never add credentials, public addresses, tunnel IDs, or serial numbers.
const n = (id: string, label: string, type: string, parent: string | undefined, description: string, category = 'system', extra: Partial<ArchitectureNode> = {}): ArchitectureNode =>
  ({ id, label, type, parent, description, category, collapsedByDefault: true, ...extra });
const containerDescriptions: Record<string, string> = {
  immich_server: 'The main Immich application service.',
  immich_machine_learning: 'Machine-learning jobs for the Immich stack.',
  immich_postgres: 'The Immich database.',
  immich_redis: 'Cache and queue support for Immich.',
  'nextcloud-aio-mastercontainer': 'Coordinates the Nextcloud AIO deployment.',
  'nextcloud-aio-nextcloud': 'The Nextcloud application container.',
  'nextcloud-aio-apache': 'Web front end for Nextcloud.',
  'nextcloud-aio-database': 'Database service for Nextcloud.',
  'nextcloud-aio-redis': 'Cache service for Nextcloud.',
  'nextcloud-aio-collabora': 'Document editing support.',
  'nextcloud-aio-clamav': 'Malware scanning helper.',
  'nextcloud-aio-imaginary': 'Image processing helper.',
  'nextcloud-aio-notify-push': 'Push notification helper.',
  'nextcloud-aio-talk': 'Calls and communication service.',
  'nextcloud-aio-talk-recording': 'Recording helper for Talk.',
  'nextcloud-aio-whiteboard': 'Collaborative whiteboard helper.',
  'nextcloud-aio-borgbackup': 'Inactive Borg backup helper container.',
  'nextcloud-aio-watchtower': 'Inactive update helper container.',
  ollama: 'Local model runtime in the AI stack.',
  'open-webui': 'Web interface for the AI stack.',
  searxng: 'Search component in the AI stack.',
  cAdvisor: 'Container metrics exporter.',
  'dcgm-exporter': 'GPU metrics exporter.',
  Diun: 'Container image update notification tool.',
  WUD: 'Container update tracking tool.',
  'palworld-health': 'Health companion for the Palworld server.',
};
const containers = (parent: string, names: string[], status?: ArchitectureNode['status']): ArchitectureNode[] =>
  names.map((name) => n(name, name, 'Container', parent, containerDescriptions[name] ?? `A container in the ${parent.replaceAll('-', ' ')} group.`, 'container', status ? { status } : {}));
const c = (from: string, to: string, type: ArchitectureConnection['type'], label: string, views: string[]): ArchitectureConnection =>
  ({ from, to, type, label, direction: 'forward', views });

export const proxmoxArchitecture: Architecture = {
  title: 'Proxmox architecture explorer',
  intro: 'Start with the host, then open a branch to see what runs where.',
  rootId: 'host',
  views: [
    { id: 'overview', label: 'Overview', description: 'The host, its VMs, storage, backup paths, and monitoring.', focus: ['host'] },
    { id: 'compute', label: 'Compute', description: 'Physical hardware and the virtual machines it hosts.', focus: ['host', 'debian', 'vaultwarden-vm', 'monitor-vm'] },
    { id: 'services', label: 'Services', description: 'Docker workloads on DebianDelMundo, grouped by purpose.', focus: ['debian', 'docker'] },
    { id: 'storage', label: 'Storage', description: 'The RAIDZ2 pool and datasets used by workloads.', focus: ['zfs', 'zpool1'] },
    { id: 'backups', label: 'Backups', description: 'Borg, snapshots, and application backup datasets.', focus: ['backups', 'nextcloud-borg', 'zfs-snapshots', 'immich-backup-flow'] },
    { id: 'monitoring', label: 'Monitoring', description: 'Systems and exporters feed Prometheus, then Grafana.', focus: ['monitoring', 'exporters', 'prometheus', 'grafana'] },
  ],
  nodes: [
    n('host', 'delmundo', 'Proxmox host', undefined, 'The physical virtualization host at the center of the homelab.', 'compute', {
      position: { x: 0, y: 0, z: 0 },
      details: [
        { label: 'CPU', value: 'Intel i7-12700K' },
        { label: 'Memory', value: '64 GiB RAM' },
        { label: 'Motherboard', value: 'MSI PRO B660M-A WIFI DDR4' },
        { label: 'HBA', value: 'LSI 9207-8i' },
        { label: 'Disks', value: '6 × WD Red Plus 4 TB' },
        { label: 'Boot drive', value: 'WD SN770 250 GB NVMe' },
        { label: 'UPS', value: 'APC Back-UPS XS 1050M' },
      ],
    }),
    n('debian', 'DebianDelMundo', 'VM100 · Virtual machine', 'host', 'Primary Docker host for self-hosted services.', 'compute', {
      position: { x: -2, y: 1, z: 0 },
      details: [
        { label: 'Role', value: 'Primary Docker host' },
        { label: 'Host', value: 'delmundo' },
        { label: 'Network', value: 'Trusted' },
      ],
    }),
    n('vaultwarden-vm', 'Vaultwarden VM', 'VM101 · Virtual machine', 'host', 'A dedicated VM for Vaultwarden.', 'compute', { position: { x: -1, y: 1, z: 0 }, details: [{ label: 'Role', value: 'Dedicated VM' }] }),
    n('monitor-vm', 'MonitorVM', 'Virtual machine', 'host', 'A VM dedicated to monitoring workloads.', 'compute', { position: { x: 1, y: 1, z: 0 } }),
    n('zfs', 'ZFS storage', 'Storage branch', 'host', 'The zpool1 RAIDZ2 pool and its workload datasets.', 'storage', { position: { x: 2, y: 1, z: 0 } }),
    n('backups', 'Backups', 'Recovery branch', 'host', 'Separate paths for Nextcloud, ZFS snapshots, and Immich backups.', 'backup'),
    n('monitoring', 'Monitoring', 'Observability branch', 'host', 'Collectors and exporters feed metrics into Prometheus and Grafana.', 'monitoring'),

    n('docker', 'Docker workloads', 'Container host', 'debian', 'Application stacks and supporting services on DebianDelMundo.', 'service'),
    n('dns-access', 'DNS & access', 'Service group', 'docker', 'DNS, proxy, tunnel, and remote-access tooling.', 'service'),
    n('pi-hole', 'Pi-hole', 'DNS service', 'dns-access', 'DNS service on DebianDelMundo.', 'service'),
    n('cloudflared', 'cloudflared', 'Container', 'pi-hole', 'DNS-over-HTTPS upstream helper for Pi-hole.', 'container'),
    n('caddy', 'Caddy', 'Container', 'dns-access', 'Reverse proxy in the Docker inventory.', 'container'),
    n('cloudflare-tunnel', 'Cloudflare Tunnel', 'Access path', 'dns-access', 'Tunnel-based access path, shown without IDs or credentials.', 'service'),
    n('tailscale', 'Tailscale', 'Remote access', 'dns-access', 'Additional remote-access path.', 'service'),

    n('immich', 'Immich', 'Application stack', 'docker', 'Photo service with server, machine-learning, database, and Redis containers.', 'stack'),
    ...containers('immich', ['immich_server', 'immich_machine_learning', 'immich_postgres', 'immich_redis']),
    n('nextcloud-aio', 'Nextcloud AIO', 'Application stack', 'docker', 'Nextcloud and its supporting containers, grouped so the default view stays readable.', 'stack'),
    n('nc-core', 'Core services', 'Container group', 'nextcloud-aio', 'Application, web, database, and cache containers.', 'stack'),
    ...containers('nc-core', ['nextcloud-aio-mastercontainer', 'nextcloud-aio-nextcloud', 'nextcloud-aio-apache', 'nextcloud-aio-database', 'nextcloud-aio-redis']),
    n('nc-collab', 'Collaboration', 'Container group', 'nextcloud-aio', 'Office, Talk, notifications, recording, and whiteboard helpers.', 'stack'),
    ...containers('nc-collab', ['nextcloud-aio-collabora', 'nextcloud-aio-notify-push', 'nextcloud-aio-talk', 'nextcloud-aio-talk-recording', 'nextcloud-aio-whiteboard']),
    n('nc-media', 'Media & security', 'Container group', 'nextcloud-aio', 'Scanning and image-processing helpers.', 'stack'),
    ...containers('nc-media', ['nextcloud-aio-clamav', 'nextcloud-aio-imaginary']),
    n('nc-maintenance', 'Maintenance helpers', 'Container group', 'nextcloud-aio', 'Inactive/helper containers can be revealed when needed.', 'stack'),
    ...containers('nc-maintenance', ['nextcloud-aio-borgbackup', 'nextcloud-aio-watchtower'], 'inactive'),

    n('media', 'Media', 'Service group', 'docker', 'Media services in the current inventory.', 'service'),
    n('jellyfin', 'Jellyfin', 'Media service', 'media', 'Media server in the current Docker inventory.', 'container'),
    n('ai', 'AI stack', 'Application stack', 'docker', 'Local model, web interface, and search components.', 'stack'),
    ...containers('ai', ['ollama', 'open-webui', 'searxng']),
    n('game-servers', 'Game servers', 'Service group', 'docker', 'Minecraft and Palworld servers, separated for easier exploration.', 'service'),
    n('minecraft', 'Minecraft', 'Game server group', 'game-servers', 'Minecraft server instances in the inventory.', 'stack'),
    ...containers('minecraft', ['mc-samworld', 'McBoomersWorld', 'iloveKendallMC', 'MinecraftBedrockServer', 'mcJjk']),
    n('palworld', 'Palworld', 'Game server group', 'game-servers', 'Palworld server and health companion.', 'stack'),
    ...containers('palworld', ['palworld-serverv2', 'palworld-health']),
    n('infra-tools', 'Infrastructure / tools', 'Service group', 'docker', 'Management, registry, and practice services.', 'service'),
    ...containers('infra-tools', ['portainer', 'registry', 'mysql-practice']),
    n('docker-ops', 'Monitoring & updates', 'Service group', 'docker', 'Container telemetry and update tooling.', 'monitoring'),
    ...containers('docker-ops', ['cAdvisor', 'dcgm-exporter', 'Diun', 'WUD']),
    n('inactive-lab', 'Inactive containers', 'Inventory group', 'docker', 'Exited containers kept out of the default map.', 'service', { status: 'inactive' }),
    ...containers('inactive-lab', ['cobalt', 'cobalt-watchtower-1'], 'inactive'),

    n('zpool1', 'zpool1', 'RAIDZ2 pool', 'zfs', 'Six 4 TB disks arranged as a RAIDZ2 pool.', 'storage', { details: [{ label: 'Layout', value: 'RAIDZ2' }, { label: 'Disks', value: '6 × 4 TB WD Red Plus' }] }),
    ...['SamWorld', 'iloveKendall', 'nextcloud', 'photos', 'snapshots', 'nextcloud-backups', 'immich-backups'].map((name) =>
      n(`dataset-${name}`, name, 'ZFS dataset', 'zpool1', `Dataset in zpool1 for ${name.replaceAll('-', ' ')}.`, 'storage')),

    n('nextcloud-borg', 'Borg backup', 'Backup path', 'backups', 'Nextcloud AIO backup path using Borg.', 'backup'),
    n('zfs-snapshots', 'ZFS snapshots', 'Backup path', 'backups', 'Snapshots associated with ZFS storage.', 'backup'),
    n('immich-backup-flow', 'Immich backups', 'Backup path', 'backups', 'Immich data is associated with the immich-backups dataset.', 'backup'),

    n('metrics-sources', 'Systems & devices', 'Metric sources', 'monitoring', 'Hosts, workloads, storage, and network devices being observed.', 'monitoring'),
    n('exporters', 'Exporters / collectors', 'Metric collection', 'monitoring', 'Collectors expose host, VM, disk, network, and container metrics.', 'monitoring'),
    ...['Node Exporter', 'PVE Exporter', 'ZFS Exporter', 'smartctl Exporter', 'Unpoller'].map((name) =>
      n(`exporter-${name.toLowerCase().replaceAll(' ', '-')}`, name, 'Exporter', 'exporters', `Collector in the monitoring pipeline.`, 'monitoring')),
    n('prometheus', 'Prometheus', 'Metrics store', 'monitoring', 'Collects time-series metrics from exporters and collectors.', 'monitoring'),
    n('grafana', 'Grafana', 'Dashboard', 'monitoring', 'Visualizes metrics collected by Prometheus.', 'monitoring'),
    n('upptime', 'Upptime', 'Availability', 'monitoring', 'Availability monitoring in the observability inventory.', 'monitoring'),
  ],
  connections: [
    c('debian', 'docker', 'runs', 'DebianDelMundo runs Docker workloads', ['compute', 'services']),
    c('dataset-SamWorld', 'minecraft', 'storage', 'SamWorld supports Minecraft', ['storage']),
    c('dataset-iloveKendall', 'minecraft', 'storage', 'iloveKendall supports Minecraft', ['storage']),
    c('dataset-nextcloud', 'nextcloud-aio', 'storage', 'nextcloud supports Nextcloud AIO', ['storage']),
    c('dataset-photos', 'immich', 'storage', 'photos supports Immich', ['storage']),
    c('nextcloud-aio', 'nextcloud-borg', 'backup', 'Nextcloud → Borg backup', ['backups']),
    c('zfs', 'zfs-snapshots', 'backup', 'ZFS → snapshots', ['backups']),
    c('zfs-snapshots', 'dataset-snapshots', 'storage', 'Snapshots use the snapshots dataset', ['storage', 'backups']),
    c('immich', 'dataset-immich-backups', 'backup', 'Immich → immich-backups dataset', ['backups', 'storage']),
    c('dataset-nextcloud-backups', 'nextcloud-borg', 'backup', 'nextcloud-backups supports Borg recovery', ['backups', 'storage']),
    c('metrics-sources', 'exporters', 'observes', 'Systems / devices → exporters / collectors', ['monitoring']),
    c('exporters', 'prometheus', 'observes', 'Exporters / collectors → Prometheus', ['monitoring']),
    c('cAdvisor', 'prometheus', 'observes', 'cAdvisor → Prometheus', ['monitoring']),
    c('dcgm-exporter', 'prometheus', 'observes', 'dcgm-exporter → Prometheus', ['monitoring']),
    c('prometheus', 'grafana', 'observes', 'Prometheus → Grafana', ['monitoring']),
  ],
};
