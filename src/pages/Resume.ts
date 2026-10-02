import { site } from '../content';
import { escapeHtml, internalLink } from '../utils';

export function Resume(): string {
  return `<main class="subpage resume-page"><div class="shell"><div class="page-intro reveal"><span class="page-kicker">03 / RESUME <span lang="ja">履歴書</span></span><h1>Resume<span class="accent-dot">.</span></h1><p>An Information Technology student interested in the systems and networks that keep things running.</p></div>
    <div class="resume-layout"><div class="resume-sidebar reveal"><span class="resume-monogram">JDM<span>.</span></span><p>Curious about infrastructure.<br />Serious about learning.<br />Always looking up.</p><a href="${escapeHtml(site.linkedin)}" target="_blank" rel="noopener noreferrer" class="text-link dark-link">Connect on LinkedIn ↗</a></div><div class="resume-main"><section class="resume-block reveal"><span>01 / FOCUS</span><h2>What I’m working toward</h2><p>Systems administration, networking, infrastructure, and practical IT work. I learn best by building, testing, documenting, and improving the systems around me.</p></section><section class="resume-block reveal"><span>02 / HANDS ON</span><h2>Current lab work</h2><ul><li>Virtualization and self hosted services with Proxmox</li><li>Network segmentation and firewall design with UniFi</li><li>Windows Server and Active Directory administration</li></ul></section><section class="resume-block reveal"><span>03 / BEYOND THE LAB</span><h2>Other interests</h2><p>Aviation, music, photography, and travel all shape how I see the world and the work I want to do.</p></section></div></div>
    <div class="page-outro">${internalLink('/', '← Back to the homepage', 'text-link dark-link')}</div>
  </div></main>`;
}
