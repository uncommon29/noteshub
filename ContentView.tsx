
import React, { useState } from 'react';
import { ICONS, STORAGE_KEY } from '../constants';
import { LinkItem, GitHubConfig, MainCategory } from '../types';
import { marked } from 'marked';
import { pushToGitHub } from '../services/github';

interface ContentViewProps {
  item: LinkItem | null;
  onBack: () => void;
  onEdit: (item: LinkItem) => void;
  onDelete: (id: string) => void;
  githubConfig: GitHubConfig | null;
  allKnowledge: MainCategory[];
}

const ContentView: React.FC<ContentViewProps> = ({ item, onBack, onEdit, onDelete, githubConfig, allKnowledge }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isOwner = !!githubConfig?.token;

  if (!item) return null;

  const getMarkdownHtml = () => {
    return { __html: marked.parse(item.content || "_No detailed notes available for this topic yet._") };
  };

  const handleDelete = async () => {
    if (!isOwner) return;
    if (!confirm(`Permanently delete "${item.title}" from the cloud repository?`)) return;

    setIsDeleting(true);

    const updatedKnowledge = allKnowledge.map(cat => ({
      ...cat,
      subCategories: cat.subCategories.map(sub => ({
        ...sub,
        links: sub.links.filter(l => l.id !== item.id)
      })).filter(sub => sub.links.length > 0)
    })).filter(cat => cat.subCategories.length > 0);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedKnowledge));

    if (githubConfig?.token) {
      await pushToGitHub(githubConfig, updatedKnowledge);
    }

    onDelete(item.id);
    onBack();
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-12">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group"
        >
          <ICONS.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Index</span>
        </button>

        {isOwner && (
          <div className="flex items-center gap-6">
            <button 
              onClick={() => onEdit(item)}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              <span>Edit Page</span>
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-slate-300 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest"
            >
              {isDeleting ? (
                <div className="w-3 h-3 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              )}
              <span>{isDeleting ? 'Removing...' : 'Delete'}</span>
            </button>
          </div>
        )}
      </div>

      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
          {item.title}
        </h1>
        {item.description && (
          <p className="text-xl text-slate-500 font-light leading-relaxed border-l-4 border-blue-100 pl-6 italic mb-8">
            {item.description}
          </p>
        )}
      </div>

      <article className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-900 prose-headings:font-black prose-a:text-blue-600 prose-img:rounded-3xl prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:py-2 prose-blockquote:px-6">
        <div 
          className="whitespace-pre-wrap leading-relaxed text-slate-700"
          dangerouslySetInnerHTML={getMarkdownHtml()}
        />
      </article>

      <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-widest font-black">
        <div className="flex items-center gap-2">
          {isOwner && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
          <span>Ref: {item.id}</span>
        </div>
        <span>InsightHub Knowledge &bull; {isOwner ? 'Owner Dashboard' : 'Public Access'}</span>
      </div>
    </div>
  );
};

export default ContentView;
