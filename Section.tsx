
import React from 'react';
import { MainCategory, LinkItem } from '../types';

interface SectionProps {
  category: MainCategory;
  highlight: string;
  onLinkClick: (item: LinkItem) => void;
}

const Section: React.FC<SectionProps> = ({ category, highlight, onLinkClick }) => {
  const highlightMatch = (text: string) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() 
            ? <span key={i} className="bg-yellow-100 text-yellow-900 px-0.5 rounded">{part}</span> 
            : part
        )}
      </>
    );
  };

  return (
    <section className="mb-16 scroll-mt-24">
      <div className="flex items-baseline gap-4 mb-6 border-b border-slate-100 pb-2">
        <h2 className="text-2xl font-semibold text-slate-800">{highlightMatch(category.title)}</h2>
        {category.description && (
          <span className="text-slate-400 text-sm italic font-light">{category.description}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
        {category.subCategories.map((sub, idx) => (
          <div key={idx} className="flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 pb-1 border-b border-slate-50">
              {highlightMatch(sub.title)}
            </h3>
            <ul className="space-y-2">
              {sub.links.map(link => (
                <li key={link.id}>
                  <button 
                    onClick={() => onLinkClick(link)}
                    className="group flex flex-col text-left text-sm text-slate-600 hover:text-blue-600 transition-colors py-0.5 w-full"
                  >
                    <span className="flex items-center">
                      <span className="w-1.5 h-1.5 bg-slate-300 rounded-full mr-2 group-hover:bg-blue-500 transition-colors"></span>
                      <span className="font-medium">{highlightMatch(link.title)}</span>
                    </span>
                    {link.description && (
                      <span className="text-[11px] text-slate-400 ml-3.5 italic">{link.description}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Section;
