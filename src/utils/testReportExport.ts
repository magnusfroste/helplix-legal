import { TestRun, TestScore, TestCase, COUNTRY_FLAGS } from '@/types/testbench';

export function generateTestReportMarkdown(
  testCase: TestCase, 
  testRun: TestRun, 
  score?: TestScore
): string {
  const flag = COUNTRY_FLAGS[testCase.country_code] || '🌍';
  const date = new Date(testRun.started_at).toLocaleDateString('sv-SE');
  
  let md = `# Testrapport: ${testCase.title}\n\n`;
  md += `**Datum:** ${date}\n`;
  md += `**Jurisdiktion:** ${flag} ${testCase.country_code}\n`;
  md += `**Ärendetyp:** ${testCase.case_type}\n`;
  md += `**Svårighetsgrad:** ${testCase.difficulty}\n`;
  md += `**Status:** ${testRun.status}\n\n`;

  md += `---\n\n`;

  // Scenario
  md += `## 📋 Scenario\n\n`;
  md += `${testCase.scenario.description}\n\n`;
  md += `### Nyckelfakta\n`;
  testCase.scenario.key_facts.forEach(fact => {
    md += `- ${fact}\n`;
  });
  md += `\n`;

  // Scores
  if (score) {
    md += `## 📊 Resultat\n\n`;
    md += `| Kategori | Poäng |\n`;
    md += `|----------|-------|\n`;
    md += `| **Totalpoäng** | **${score.overall_score}/100** |\n`;
    md += `| Faktatäckning | ${score.fact_coverage}% |\n`;
    md += `| Juridisk precision | ${score.legal_accuracy}% |\n`;
    md += `| Tidslinjeprecision | ${score.timeline_accuracy}% |\n`;
    md += `| Frågeteknik | ${score.question_quality}% |\n`;
    md += `| Språkkvalitet | ${score.language_quality}% |\n`;
    md += `| Professionalism | ${score.professionalism}% |\n\n`;

    if (score.evaluator_notes) {
      md += `### Utvärderarens anteckningar\n`;
      md += `${score.evaluator_notes}\n\n`;
    }
  }

  // Conversation
  md += `## 💬 Konversation\n\n`;
  testRun.conversation_log.forEach((msg) => {
    const roleLabel = msg.role === 'assistant' ? '🤖 AI' : msg.role === 'user' ? '👤 Användare' : '⚙️ System';
    const phase = msg.phase ? ` (${msg.phase})` : '';
    md += `### ${roleLabel}${phase}\n`;
    md += `${msg.content}\n\n`;
  });

  // Generated Report
  if (testRun.generated_report) {
    md += `---\n\n`;
    md += `## 📄 Genererad Rapport\n\n`;
    
    if (testRun.generated_report.timeline) {
      md += `### Kronologisk Tidslinje\n`;
      md += `${testRun.generated_report.timeline}\n\n`;
    }
    
    if (testRun.generated_report.legal) {
      md += `### Juridisk Sammanfattning\n`;
      md += `${testRun.generated_report.legal}\n\n`;
    }
    
    if (testRun.generated_report.interpretation) {
      md += `### Juridisk Tolkning\n`;
      md += `${testRun.generated_report.interpretation}\n\n`;
    }
  }

  // Analysis
  md += `---\n\n`;
  md += `## 🔍 Analys\n\n`;
  
  md += `### AI-dynamik\n`;
  const phases = [...new Set(testRun.conversation_log.filter(m => m.phase).map(m => m.phase))];
  md += `**Faser genomgångna:** ${phases.join(' → ') || 'Ej specificerade'}\n\n`;
  
  const assistantMessages = testRun.conversation_log.filter(m => m.role === 'assistant').length;
  const userMessages = testRun.conversation_log.filter(m => m.role === 'user').length;
  md += `**Interaktioner:** ${assistantMessages} AI-svar, ${userMessages} användarinput\n\n`;

  if (score?.evaluation_details) {
    const details = score.evaluation_details;
    
    if (details.facts_found?.length) {
      md += `### Identifierade fakta\n`;
      details.facts_found.forEach(f => md += `- ✅ ${f}\n`);
      md += `\n`;
    }
    
    if (details.facts_missing?.length) {
      md += `### Missade fakta\n`;
      details.facts_missing.forEach(f => md += `- ❌ ${f}\n`);
      md += `\n`;
    }
    
    if (details.legal_issues_identified?.length) {
      md += `### Identifierade juridiska frågor\n`;
      details.legal_issues_identified.forEach(i => md += `- ✅ ${i}\n`);
      md += `\n`;
    }
    
    if (details.strengths?.length) {
      md += `### Styrkor\n`;
      details.strengths.forEach(s => md += `- 💪 ${s}\n`);
      md += `\n`;
    }
    
    if (details.weaknesses?.length) {
      md += `### Förbättringsområden\n`;
      details.weaknesses.forEach(w => md += `- ⚠️ ${w}\n`);
      md += `\n`;
    }
  }

  md += `---\n\n`;
  md += `*Rapport genererad av Helplix Testbänk*\n`;

  return md;
}

export function downloadAsMarkdown(markdown: string, testCase: TestCase): void {
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `testrapport-${testCase.country_code}-${testCase.case_type}-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function openAsPDF(markdown: string, testCase: TestCase): void {
  const html = markdownToHtml(markdown);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Testrapport - ${testCase.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          line-height: 1.6;
          color: #1a1a1a;
        }
        h1 { color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        h3 { color: #374151; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
        th { background: #f3f4f6; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 30px 0; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
        blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 20px; color: #6b7280; }
        ul { padding-left: 20px; }
        li { margin: 5px 0; }
        @media print {
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      ${html}
    </body>
    </html>
  `);
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
  }, 250);
}

function markdownToHtml(md: string): string {
  return md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Tables
    .replace(/\|(.+)\|\n\|[-:| ]+\|\n((?:\|.+\|\n?)+)/g, (_, header, rows) => {
      const headers = header.split('|').filter(Boolean).map((h: string) => `<th>${h.trim()}</th>`).join('');
      const rowHtml = rows.trim().split('\n').map((row: string) => {
        const cells = row.split('|').filter(Boolean).map((c: string) => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');
      return `<table><thead><tr>${headers}</tr></thead><tbody>${rowHtml}</tbody></table>`;
    })
    // Lists
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)\n(<li>)/g, '$1$2')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraphs
    .replace(/^(?!<[htuol])/gm, '<p>')
    .replace(/(?<![>])$/gm, '</p>')
    // Clean up empty paragraphs
    .replace(/<p><\/p>/g, '')
    .replace(/<p><h/g, '<h')
    .replace(/<\/h([123])><\/p>/g, '</h$1>')
    .replace(/<p><hr><\/p>/g, '<hr>')
    .replace(/<p><ul>/g, '<ul>')
    .replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><table>/g, '<table>')
    .replace(/<\/table><\/p>/g, '</table>');
}
