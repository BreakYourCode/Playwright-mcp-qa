import * as fs from 'fs';
import * as path from 'path';
import { Result } from 'axe-core';

interface PageViolations {
  page: string;
  violations: Result[];
}

export class AccessibilityReporter {
  private violations: PageViolations[] = [];
  private outputDir: string;

  constructor(outputDir: string = 'playwright-report') {
    this.outputDir = outputDir;
  }

  addViolations(pageName: string, violations: Result[]): void {
    if (violations.length > 0) {
      this.violations.push({ page: pageName, violations });
    }
  }

  getViolations(): PageViolations[] {
    return this.violations;
  }

  generateReport(testName: string = 'Accessibility Test'): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const html = this.generateHTML(testName);
    const reportPath = path.join(this.outputDir, 'accessibility-report.html');
    fs.writeFileSync(reportPath, html, 'utf8');
    console.log(`\n📊 Accessibility report generated: ${reportPath}`);
  }

  private generateHTML(testName: string): string {
    const stats = this.calculateStats();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Report - ${testName}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }
    
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    
    .header .test-name {
      font-size: 1.1rem;
      opacity: 0.9;
    }
    
    .header .timestamp {
      font-size: 0.9rem;
      opacity: 0.8;
      margin-top: 0.5rem;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .summary-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-left: 4px solid;
    }
    
    .summary-card.total { border-left-color: #667eea; }
    .summary-card.critical { border-left-color: #e53e3e; }
    .summary-card.serious { border-left-color: #dd6b20; }
    .summary-card.moderate { border-left-color: #d69e2e; }
    .summary-card.minor { border-left-color: #38a169; }
    
    .summary-card .label {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #718096;
      margin-bottom: 0.5rem;
    }
    
    .summary-card .value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #2d3748;
    }
    
    .charts-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    
    .chart-container {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .chart-container h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      color: #2d3748;
    }
    
    .violations-section {
      margin-top: 2rem;
    }
    
    .page-block {
      background: white;
      border-radius: 8px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    .page-header {
      background: #f7fafc;
      padding: 1.5rem;
      border-bottom: 2px solid #e2e8f0;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.2s;
    }
    
    .page-header:hover {
      background: #edf2f7;
    }
    
    .page-header h3 {
      font-size: 1.25rem;
      color: #2d3748;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .page-badge {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    .toggle-icon {
      font-size: 1.5rem;
      transition: transform 0.3s;
    }
    
    .page-content {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }
    
    .page-block.expanded .page-content {
      max-height: 10000px;
    }
    
    .page-block.expanded .toggle-icon {
      transform: rotate(180deg);
    }
    
    .violation-item {
      padding: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .violation-item:last-child {
      border-bottom: none;
    }
    
    .violation-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 1rem;
    }
    
    .violation-title {
      flex: 1;
    }
    
    .violation-title h4 {
      font-size: 1.1rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }
    
    .violation-id {
      font-size: 0.875rem;
      color: #718096;
      font-family: 'Courier New', monospace;
    }
    
    .impact-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .impact-critical {
      background: #fed7d7;
      color: #c53030;
    }
    
    .impact-serious {
      background: #feebc8;
      color: #c05621;
    }
    
    .impact-moderate {
      background: #fefcbf;
      color: #b7791f;
    }
    
    .impact-minor {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .violation-description {
      color: #4a5568;
      margin-bottom: 1rem;
      line-height: 1.6;
    }
    
    .violation-meta {
      display: flex;
      gap: 2rem;
      margin-top: 1rem;
    }
    
    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #718096;
    }
    
    .meta-item strong {
      color: #2d3748;
    }
    
    .learn-more {
      display: inline-block;
      margin-top: 0.75rem;
      color: #667eea;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
    }
    
    .learn-more:hover {
      text-decoration: underline;
    }
    
    .affected-elements {
      margin-top: 1rem;
      padding: 1rem;
      background: #f7fafc;
      border-radius: 4px;
      border-left: 3px solid #cbd5e0;
    }
    
    .affected-elements h5 {
      font-size: 0.875rem;
      color: #4a5568;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .element-item {
      background: white;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      border: 1px solid #e2e8f0;
    }
    
    .element-target {
      font-family: 'Courier New', monospace;
      color: #667eea;
      margin-bottom: 0.5rem;
    }
    
    .element-html {
      font-family: 'Courier New', monospace;
      color: #718096;
      font-size: 0.8rem;
      word-break: break-all;
    }
    
    .no-violations {
      background: white;
      padding: 3rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .no-violations .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    
    .no-violations h2 {
      font-size: 1.5rem;
      color: #2d3748;
      margin-bottom: 0.5rem;
    }
    
    .no-violations p {
      color: #718096;
    }
    
    .footer {
      margin-top: 3rem;
      padding: 2rem;
      text-align: center;
      color: #718096;
      font-size: 0.875rem;
    }
    
    @media (max-width: 768px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .charts-section {
        grid-template-columns: 1fr;
      }
      
      .violation-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>♿ Accessibility Report</h1>
    <div class="test-name">${testName}</div>
    <div class="timestamp">Generated: ${new Date().toLocaleString()}</div>
  </div>
  
  <div class="container">
    <div class="summary-grid">
      <div class="summary-card total">
        <div class="label">Total Violations</div>
        <div class="value">${stats.total}</div>
      </div>
      <div class="summary-card critical">
        <div class="label">Critical</div>
        <div class="value">${stats.critical}</div>
      </div>
      <div class="summary-card serious">
        <div class="label">Serious</div>
        <div class="value">${stats.serious}</div>
      </div>
      <div class="summary-card moderate">
        <div class="label">Moderate</div>
        <div class="value">${stats.moderate}</div>
      </div>
      <div class="summary-card minor">
        <div class="label">Minor</div>
        <div class="value">${stats.minor}</div>
      </div>
    </div>
    
    ${this.violations.length > 0 ? `
    <div class="charts-section">
      <div class="chart-container">
        <h2>Violations by Severity</h2>
        <canvas id="severityChart"></canvas>
      </div>
      <div class="chart-container">
        <h2>Violations by Page</h2>
        <canvas id="pageChart"></canvas>
      </div>
    </div>
    
    <div class="violations-section">
      ${this.generateViolationsHTML()}
    </div>
    ` : `
    <div class="no-violations">
      <div class="icon">✅</div>
      <h2>No Accessibility Violations Found!</h2>
      <p>All scanned pages passed accessibility checks.</p>
    </div>
    `}
  </div>
  
  <div class="footer">
    Powered by axe-core | Learn more at <a href="https://www.deque.com/axe/" target="_blank">deque.com/axe</a>
  </div>
  
  <script>
    // Toggle page sections
    document.querySelectorAll('.page-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('expanded');
      });
    });
    
    ${this.violations.length > 0 ? `
    // Severity Chart
    const severityCtx = document.getElementById('severityChart').getContext('2d');
    new Chart(severityCtx, {
      type: 'doughnut',
      data: {
        labels: ['Critical', 'Serious', 'Moderate', 'Minor'],
        datasets: [{
          data: [${stats.critical}, ${stats.serious}, ${stats.moderate}, ${stats.minor}],
          backgroundColor: ['#e53e3e', '#dd6b20', '#d69e2e', '#38a169'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 12 }
            }
          }
        }
      }
    });
    
    // Page Chart
    const pageCtx = document.getElementById('pageChart').getContext('2d');
    new Chart(pageCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(this.violations.map(v => v.page))},
        datasets: [{
          label: 'Violations',
          data: ${JSON.stringify(this.violations.map(v => v.violations.length))},
          backgroundColor: '#667eea',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 }
          }
        }
      }
    });
    ` : ''}
  </script>
</body>
</html>`;
  }

  private calculateStats() {
    let critical = 0, serious = 0, moderate = 0, minor = 0;
    
    this.violations.forEach(pageViolations => {
      pageViolations.violations.forEach(violation => {
        const impact = violation.impact || 'minor';
        switch (impact) {
          case 'critical': critical++; break;
          case 'serious': serious++; break;
          case 'moderate': moderate++; break;
          case 'minor': minor++; break;
        }
      });
    });
    
    return {
      total: critical + serious + moderate + minor,
      critical,
      serious,
      moderate,
      minor
    };
  }

  private generateViolationsHTML(): string {
    return this.violations.map(pageViolations => `
      <div class="page-block">
        <div class="page-header">
          <h3>
            📄 ${pageViolations.page}
            <span class="page-badge">${pageViolations.violations.length} violation${pageViolations.violations.length !== 1 ? 's' : ''}</span>
          </h3>
          <span class="toggle-icon">▼</span>
        </div>
        <div class="page-content">
          ${pageViolations.violations.map(violation => `
            <div class="violation-item">
              <div class="violation-header">
                <div class="violation-title">
                  <h4>${violation.help}</h4>
                  <div class="violation-id">${violation.id}</div>
                </div>
                <span class="impact-badge impact-${violation.impact || 'minor'}">${violation.impact || 'minor'}</span>
              </div>
              <div class="violation-description">${violation.description}</div>
              <div class="violation-meta">
                <div class="meta-item">
                  <strong>Affected Elements:</strong> ${violation.nodes.length}
                </div>
              </div>
              <a href="${violation.helpUrl}" target="_blank" class="learn-more">
                Learn more about this rule →
              </a>
              ${violation.nodes.length > 0 ? `
                <div class="affected-elements">
                  <h5>Affected Elements (showing first ${Math.min(3, violation.nodes.length)})</h5>
                  ${violation.nodes.slice(0, 3).map(node => `
                    <div class="element-item">
                      <div class="element-target">${node.target.join(' > ')}</div>
                      <div class="element-html">${this.escapeHtml(node.html.substring(0, 150))}${node.html.length > 150 ? '...' : ''}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  private escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}
