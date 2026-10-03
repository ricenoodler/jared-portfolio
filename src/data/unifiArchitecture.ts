import type { Architecture, ArchitectureConnection, ArchitectureNode } from './architecture';

// Public topology only. Do not add keys, tunnel IDs, credentials, or public addresses.
const n = (id: string, label: string, type: string, parent: string | undefined, description: string, category = 'network', extra: Partial<ArchitectureNode> = {}): ArchitectureNode =>
  ({ id, label, type, parent, description, category, collapsedByDefault: true, ...extra });
const c = (from: string, to: string, type: ArchitectureConnection['type'], label: string, views: string[]): ArchitectureConnection =>
  ({ from, to, type, label, direction: 'forward', views });

export const unifiArchitecture: Architecture = {
  title: 'UniFi network architecture explorer',
  intro: 'Follow the gateway, network groups, traffic policy, DNS, and remote access.',
  rootId: 'udr7',
  views: [
    { id: 'overview', label: 'Overview', description: 'Internet, gateway, networks, DNS, remote access, and the Proxmox host.', focus: ['udr7'] },
    { id: 'vlans', label: 'VLANs', description: 'Trusted, Family, and IoT are separate network groups.', focus: ['trusted', 'family', 'iot', 'proxmox'] },
    { id: 'firewall', label: 'Firewall', description: 'Allowed, blocked, and exception paths are labeled explicitly.', focus: ['trusted', 'family', 'iot', 'printer'] },
    { id: 'dns', label: 'DNS', description: 'Clients use Pi-hole on DebianDelMundo, then cloudflared for DNS-over-HTTPS.', focus: ['dns', 'dns-clients', 'pi-hole', 'cloudflared', 'doh-upstream'] },
    { id: 'remote', label: 'Remote access', description: 'WireGuard reaches the UDR7; Tailscale is a separate access path.', focus: ['remote', 'wireguard', 'tailscale'] },
  ],
  nodes: [
    n('udr7', 'UniFi UDR7', 'Gateway', undefined, 'The home network gateway and the point where segmentation policy meets.', 'gateway', { position: { x: 0, y: 0, z: 0 } }),
    n('internet', 'Internet', 'Uplink', 'udr7', 'The inbound and outbound connection through the gateway.', 'external'),
    n('trusted', 'Trusted', 'VLAN · 10.0.0.0/24', 'udr7', 'Trusted systems and clients, including the homelab host.', 'vlan', { details: [{ label: 'Subnet', value: '10.0.0.0/24' }] }),
    n('family', 'Family', 'VLAN · 10.20.20.0/24', 'udr7', 'A separate network for family devices.', 'vlan', { details: [{ label: 'Subnet', value: '10.20.20.0/24' }] }),
    n('iot', 'IoT', 'VLAN · 10.30.30.0/24', 'udr7', 'Connected devices are isolated from Trusted by default.', 'vlan', { details: [{ label: 'Subnet', value: '10.30.30.0/24' }] }),
    n('dns', 'DNS', 'Name resolution', 'udr7', 'The client-to-Pi-hole-to-cloudflared DNS path.', 'dns'),
    n('remote', 'VPN / remote access', 'Access paths', 'udr7', 'Remote client access through WireGuard and a separate Tailscale path.', 'remote'),
    n('proxmox', 'Proxmox host', 'Networked system', 'udr7', 'The homelab as one networked system on Trusted. Its internals are explored on the Proxmox page.', 'system', {
      link: { label: 'Explore Proxmox architecture →', href: '/projects/proxmox-homelab#architecture' },
      details: [{ label: 'Network', value: 'Trusted' }],
    }),

    n('debian-vm', 'Debian VM', 'Representative system', 'trusted', 'The primary Linux VM as a network participant.', 'system'),
    n('monitor-vm', 'MonitorVM', 'Representative system', 'trusted', 'The monitoring VM as a network participant.', 'system'),
    n('trusted-clients', 'Trusted clients', 'Client group', 'trusted', 'Representative trusted devices.', 'device'),
    n('family-devices', 'Family devices', 'Client group', 'family', 'Representative family devices, without an exhaustive inventory.', 'device'),
    n('printer', 'Printer', 'IoT device', 'iot', 'A printer on IoT; narrowly scoped access may be allowed where required.', 'device'),
    n('other-iot', 'Other IoT devices', 'Device group', 'iot', 'Other connected devices shown as a group.', 'device'),

    n('dns-clients', 'Clients', 'DNS requesters', 'dns', 'Devices that send name-resolution requests.', 'device'),
    n('pi-hole', 'Pi-hole', 'DNS service', 'dns', 'Pi-hole runs on DebianDelMundo and serves client DNS requests.', 'dns', { details: [{ label: 'Host', value: 'DebianDelMundo' }] }),
    n('cloudflared', 'cloudflared', 'DNS-over-HTTPS helper', 'pi-hole', 'Forwards Pi-hole requests toward a DNS-over-HTTPS upstream.', 'dns'),
    n('doh-upstream', 'DNS-over-HTTPS upstream', 'Upstream resolver', 'cloudflared', 'Encrypted upstream resolution, without publishing endpoint details.', 'external'),

    n('wireguard', 'WireGuard', 'VPN path', 'remote', 'A remote client connects through WireGuard to the UDR7 and home network.', 'remote'),
    n('remote-client', 'Remote client', 'Access origin', 'wireguard', 'A client outside the home network using the WireGuard path.', 'device'),
    n('tailscale', 'Tailscale', 'Additional path', 'remote', 'A separate remote-access path in the network design.', 'remote'),
  ],
  connections: [
    c('internet', 'udr7', 'runs', 'Internet → UniFi UDR7', ['overview']),
    c('udr7', 'trusted', 'contains', 'UDR7 → Trusted', ['overview', 'vlans']),
    c('udr7', 'family', 'contains', 'UDR7 → Family', ['overview', 'vlans']),
    c('udr7', 'iot', 'contains', 'UDR7 → IoT', ['overview', 'vlans']),
    c('trusted', 'udr7', 'allowed', 'Trusted → all networks: allowed', ['firewall']),
    c('family', 'trusted', 'blocked', 'Family → Trusted: blocked', ['firewall']),
    c('iot', 'trusted', 'blocked', 'IoT → Trusted: blocked', ['firewall']),
    c('trusted', 'printer', 'exception', 'Printer access: allowed only where specifically required', ['firewall']),
    c('trusted', 'proxmox', 'contains', 'Proxmox host sits on Trusted', ['vlans']),
    c('dns-clients', 'pi-hole', 'dns', 'Clients → Pi-hole', ['dns']),
    c('pi-hole', 'cloudflared', 'dns', 'Pi-hole → cloudflared', ['dns']),
    c('cloudflared', 'doh-upstream', 'dns', 'cloudflared → DNS-over-HTTPS upstream', ['dns']),
    c('remote-client', 'wireguard', 'remote', 'Remote client → WireGuard', ['remote']),
    c('wireguard', 'udr7', 'remote', 'WireGuard → UDR7 / home network', ['remote']),
    c('tailscale', 'udr7', 'remote', 'Tailscale is a separate remote-access path', ['remote']),
  ],
};
