import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onSelectSection?: (sectionText: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onSelectSection }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Helper to parse inline styles: bold, italic, code, links
  const renderInline = (text: string): React.ReactNode => {
    // Split by inline code, bold, italic
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Very simple inline parser
    while (remaining.length > 0) {
      // Inline Code: `code`
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`([\s\S]*)$/);
      // Bold: **bold**
      const boldMatch = remaining.match(/^(.*?)\*\*([^*]+)\*\*([\s\S]*)$/);
      // Italic: *italic*
      const italicMatch = remaining.match(/^(.*?)\*([^*]+)\*([\s\S]*)$/);

      // Find the earliest match
      let bestIndex = Infinity;
      let firstMatch: { type: 'code' | 'bold' | 'italic'; before: string; matchText: string; after: string } | null = null;

      if (codeMatch && codeMatch[1].length < bestIndex) {
        bestIndex = codeMatch[1].length;
        firstMatch = { type: 'code', before: codeMatch[1], matchText: codeMatch[2], after: codeMatch[3] };
      }
      if (boldMatch && boldMatch[1].length < bestIndex) {
        bestIndex = boldMatch[1].length;
        firstMatch = { type: 'bold', before: boldMatch[1], matchText: boldMatch[2], after: boldMatch[3] };
      }
      if (italicMatch && italicMatch[1].length < bestIndex) {
        bestIndex = italicMatch[1].length;
        firstMatch = { type: 'italic', before: italicMatch[1], matchText: italicMatch[2], after: italicMatch[3] };
      }

      if (!firstMatch) {
        parts.push(remaining);
        break;
      }

      if (firstMatch.before) {
        parts.push(firstMatch.before);
      }

      if (firstMatch.type === 'code') {
        parts.push(
          <code
            key={`c-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded text-xs font-mono bg-indigo-50 text-indigo-800 border border-indigo-100"
          >
            {firstMatch.matchText}
          </code>
        );
      } else if (firstMatch.type === 'bold') {
        parts.push(
          <strong key={`b-${keyIdx++}`} className="font-semibold text-slate-900">
            {firstMatch.matchText}
          </strong>
        );
      } else if (firstMatch.type === 'italic') {
        parts.push(
          <em key={`i-${keyIdx++}`} className="italic text-slate-700">
            {firstMatch.matchText}
          </em>
        );
      }

      remaining = firstMatch.after;
    }

    return <>{parts}</>;
  };

  // Split lines into structured blocks
  const lines = content.split('\n');
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];

  const flushTable = (key: number) => {
    if (tableHeader.length > 0 || tableRows.length > 0) {
      blocks.push(
        <div key={`table-${key}`} className="my-6 overflow-x-auto rounded-lg border border-slate-200 shadow-xs">
          <table className="w-full text-left text-sm border-collapse bg-white">
            {tableHeader.length > 0 && (
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  {tableHeader.map((th, idx) => (
                    <th key={idx} className="px-4 py-3 border-r border-slate-100 last:border-r-0">
                      {renderInline(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100">
              {tableRows.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-4 py-3 text-slate-700 border-r border-slate-100 last:border-r-0">
                      {renderInline(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeader = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for code blocks
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        const fullCode = codeBuffer.join('\n');
        const codeId = `code-${i}`;
        blocks.push(
          <div key={`code-block-${i}`} className="my-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-md">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-mono uppercase tracking-wider">{codeLang || 'CODE'}</span>
              <button
                onClick={() => handleCopyCode(fullCode, codeId)}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Copy snippet"
              >
                {copiedCodeId === codeId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeId === codeId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs sm:text-sm font-mono text-slate-100 overflow-x-auto leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
      } else {
        flushTable(i);
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check for tables
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const cells = line.split('|').slice(1, -1);
      // Check if it's separator row | :--- | :--- |
      if (line.includes('---')) {
        inTable = true;
        continue;
      }
      if (!inTable) {
        tableHeader = cells;
        inTable = true;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      blocks.push(<hr key={`hr-${i}`} className="my-8 border-t border-slate-200" />);
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      const headingText = line.replace(/^#\s+/, '');
      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      blocks.push(
        <h1
          key={`h1-${i}`}
          id={id}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-6 mb-3 scroll-mt-24 border-b border-slate-200/80 pb-3"
        >
          {renderInline(headingText)}
        </h1>
      );
      continue;
    }

    if (line.startsWith('## ')) {
      const headingText = line.replace(/^##\s+/, '');
      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      blocks.push(
        <div key={`h2-wrap-${i}`} className="group relative">
          <h2
            id={id}
            className="text-xl sm:text-2xl font-bold text-slate-900 mt-8 mb-3 scroll-mt-24 flex items-center justify-between"
          >
            <span>{renderInline(headingText)}</span>
            {onSelectSection && (
              <button
                onClick={() => onSelectSection(headingText)}
                className="opacity-0 group-hover:opacity-100 text-xs px-2.5 py-1 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-opacity font-medium"
              >
                Refine Section
              </button>
            )}
          </h2>
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      const headingText = line.replace(/^###\s+/, '');
      const id = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      blocks.push(
        <h3
          key={`h3-${i}`}
          id={id}
          className="text-lg font-semibold text-slate-800 mt-6 mb-2 scroll-mt-24"
        >
          {renderInline(headingText)}
        </h3>
      );
      continue;
    }

    // Blockquotes / Callout notes
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      blocks.push(
        <div
          key={`quote-${i}`}
          className="my-4 p-4 rounded-xl bg-indigo-50/70 border-l-4 border-indigo-600 text-slate-800 flex items-start gap-3 text-sm leading-relaxed"
        >
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div className="flex-1 italic">{renderInline(quoteText)}</div>
        </div>
      );
      continue;
    }

    // Unordered List (- or *)
    if (line.match(/^[\*\-]\s+/)) {
      const itemText = line.replace(/^[\*\-]\s+/, '');
      blocks.push(
        <li key={`li-${i}`} className="ml-5 list-disc text-slate-700 text-sm sm:text-base leading-relaxed my-1.5 marker:text-indigo-500">
          {renderInline(itemText)}
        </li>
      );
      continue;
    }

    // Ordered List (1., 2., etc.)
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      blocks.push(
        <li key={`ol-${i}`} className="ml-5 list-decimal text-slate-700 text-sm sm:text-base leading-relaxed my-1.5 marker:font-semibold marker:text-indigo-600">
          {renderInline(olMatch[2])}
        </li>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      blocks.push(<div key={`empty-${i}`} className="h-2" />);
      continue;
    }

    // Standard paragraph
    blocks.push(
      <p key={`p-${i}`} className="text-slate-700 text-sm sm:text-base leading-relaxed my-2">
        {renderInline(line)}
      </p>
    );
  }

  flushTable(lines.length);

  return <div className="prose-content">{blocks}</div>;
};
