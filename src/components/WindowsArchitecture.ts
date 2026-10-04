export function WindowsArchitecture(): string {
  return `<section class="case-section case-architecture windows-architecture" aria-labelledby="architecture-title">
    <div class="shell">
      <div class="case-section-grid">
        <div class="case-section-heading"><span class="case-section-number">02 / SYSTEM MAP</span><h2 id="architecture-title">The lab architecture<span class="accent-dot">.</span></h2></div>
        <div class="case-section-copy"><p>Three virtual machines in VMware Workstation share the savn.local domain. The domain controller provides DNS and directory services to the member server and Windows 11 client.</p></div>
      </div>
      <div class="windows-map" role="img" aria-label="savn.local contains domain controller JMD-SU26-S25-S1 with DNS and Active Directory, member server JMD-SU26-S25-S2, and Windows 11 client JMD-SU26-W11-C1. The controller centrally administers the other systems and contains Administration, Research, and Sales organizational units.">
        <div class="windows-map-domain"><span>DOMAIN</span><strong>savn.local</strong><small>VMware Workstation virtual network</small></div>
        <div class="windows-map-machines">
          <div class="windows-map-machine windows-map-controller">
            <span class="windows-map-role">01 / DIRECTORY + DNS</span>
            <h3>JMD-SU26-S25-S1</h3>
            <p>Windows Server 2025</p>
            <strong>Domain controller</strong>
            <span class="windows-map-service">Active Directory Domain Services · DNS</span>
            <div class="windows-map-ous"><span>ACTIVE DIRECTORY</span><ul><li>Administration OU</li><li>Research OU</li><li>Sales OU</li></ul></div>
          </div>
          <div class="windows-map-machine">
            <span class="windows-map-role">02 / DOMAIN MEMBER</span>
            <h3>JMD-SU26-S25-S2</h3>
            <p>Windows Server 2025</p>
            <strong>Member server</strong>
            <span class="windows-map-dependency">DNS + directory dependency</span>
          </div>
          <div class="windows-map-machine">
            <span class="windows-map-role">03 / DOMAIN MEMBER</span>
            <h3>JMD-SU26-W11-C1</h3>
            <p>Windows 11 Education</p>
            <strong>Domain client</strong>
            <span class="windows-map-dependency">Centralized authentication</span>
          </div>
        </div>
        <p class="windows-map-legend">Domain membership · DNS and directory services · centralized administration</p>
      </div>
    </div>
  </section>`;
}
