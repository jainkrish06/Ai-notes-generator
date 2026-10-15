import React from 'react';
import { ListCollapse, ChevronRight } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const lines = content.split('\n');
  const items: TocItem[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const text = line.replace(/^##\s+/, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      items.push({ id, text, level: 2 });
    } else if (line.startsWith('### ')) {
      const text = line.replace(/^###\s+/, '').trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      items.push({ id, text, level: 3 });
    }
  }

  if (items.length < 2) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
        <ListCollapse className="w-3.5 h-3.5 text-indigo-600" />
        <span>Table of Contents</span>
      </div>
      <nav className="space-y-1 max-h-[360px] overflow-y-auto pr-1 text-xs sm:text-sm">
        {items.map((item, idx) => (
          <button
            key={idx}
            onClick={() => scrollToHeading(item.id)}
            className={`w-full text-left truncate flex items-center gap-1.5 py-1 px-2 rounded-md transition-colors hover:bg-slate-50 cursor-pointer ${
              item.level === 3 ? 'pl-5 text-slate-500 hover:text-slate-900 text-xs' : 'font-medium text-slate-700 hover:text-indigo-600'
            }`}
          >
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="truncate">{item.text.replace(/\*\*/g, '')}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
