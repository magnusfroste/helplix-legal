import { TestRun, TestScore, TestCase } from '@/types/testbench';
import { Button } from '@/components/ui/button';
import { FileDown, FileText } from 'lucide-react';
import { generateTestReportMarkdown, downloadAsMarkdown, openAsPDF } from '@/utils/testReportExport';

interface TestReportExportProps {
  testCase: TestCase;
  testRun: TestRun;
  score?: TestScore;
}

export function TestReportExport({ testCase, testRun, score }: TestReportExportProps) {
  const handleDownloadMarkdown = () => {
    const markdown = generateTestReportMarkdown(testCase, testRun, score);
    downloadAsMarkdown(markdown, testCase);
  };

  const handleDownloadPDF = () => {
    const markdown = generateTestReportMarkdown(testCase, testRun, score);
    openAsPDF(markdown, testCase);
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleDownloadMarkdown}>
        <FileText className="h-4 w-4 mr-1" />
        Markdown
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
        <FileDown className="h-4 w-4 mr-1" />
        PDF
      </Button>
    </div>
  );
}

// Simple markdown to HTML converter
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
