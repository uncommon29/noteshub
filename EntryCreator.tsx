
import React, { useState, useEffect } from 'react';
import { ICONS, STORAGE_KEY } from '../constants';
import { MainCategory, LinkItem, GitHubConfig } from '../types';
import { pushToGitHub } from '../services/github';
import { marked } from 'marked';

interface EntryCreatorProps {
  onBack: () => void;
  existingCategories: MainCategory[];
  onSave: (newKnowledge: MainCategory[]) => void;
  githubConfig: GitHubConfig | null;
  editItem?: LinkItem | null;
}

const EntryCreator: React.FC<EntryCreatorProps> = ({ 
  onBack, 
  existingCategories, 
  onSave, 
  githubConfig,
  editItem 
}) => {
  const findParentInfo = () => {
    if (!editItem) return { category: '', subCategory: '' };
    for (const cat of existingCategories) {
      for (const sub of cat.subCategories) {
        if (sub.links.some(l => l.id === editItem.id)) {
          return { category: cat.title, subCategory: sub.title };
        }
      }
    }
    return { category: '', subCategory: '' };
  };

  const initialParents = findParentInfo();
  const [formData, setFormData] = useState({
    category: initialParents.category,
    subCategory: initialParents.subCategory,
    title: editItem?.title || '',
    description: editItem?.description || '',
    content: editItem?.content || ''
  });

  const [isPreview, setIsPreview] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const hasChanged = 
      formData.title !== (editItem?.title || '') ||
      formData.content !== (editItem?.content || '') ||
      formData.category !== initialParents.category ||
      formData.subCategory !== initialParents.subCategory ||
      formData.description !== (editItem?.description || '');
    setIsDirty(hasChanged);
  }, [formData, editItem, initialParents]);

  const handleBack = () => {
    if (isDirty && !confirm("Discard unsaved changes?")) return;
    onBack();
  };

  const handleSave = async () => {
    if (!formData.category || !formData.subCategory || !formData.title) {
      alert("Category, Sub-Category, and Title are required.");
      return;
    }

    setStatus('saving');

    const updatedKnowledge: MainCategory[] = JSON.parse(JSON.stringify(existingCategories));
    
    // Remove existing if editing
    if (editItem) {
      updatedKnowledge.forEach(cat => {
        cat.subCategories.forEach(sub => {
          sub.links = sub.links.filter(l => l.id !== editItem.id);
        });
        cat.subCategories = cat.subCategories.filter(sub => sub.links.length > 0);
      });
    }

    const finalItem: LinkItem = {
      id: editItem?.id || `item-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      content: formData.content
    };

    let cat = updatedKnowledge.find(c => c.title.toLowerCase() === formData.category.toLowerCase());
    if (!cat) {
      cat = { title: formData.category, subCategories: [] };
      updatedKnowledge.push(cat);
    }

    let sub = cat.subCategories.find(s => s.title.toLowerCase() === formData.subCategory.toLowerCase());
    if (!sub) {
      sub = { title: formData.subCategory, links: [] };
      cat.subCategories.push(sub);
    }

    sub.links.push(finalItem);
    const cleanedKnowledge = updatedKnowledge.filter(c => c.subCategories.length > 0);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanedKnowledge));
    onSave(cleanedKnowledge);

    if (githubConfig?.token) {
      const success = await pushToGitHub(githubConfig, cleanedKnowledge);
      if (!success) {
        setStatus('error');
        alert("Synced locally, but cloud update failed. Check your token scope.");
        setStatus('idle');
        return;
      }
    }

    setStatus('saved');
    setTimeout(() => onBack(), 800);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors group">
          <ICONS.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Discard</span>
        </button>

        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setIsPreview(false)}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isPreview ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Editor
          </button>
          <button 
            onClick={() => setIsPreview(true)}
            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isPreview ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Full Preview
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className={`${isPreview ? 'hidden' : 'lg:col-span-7'} space-y-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl`}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
              <input 
                list="categories"
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm font-medium"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
              <datalist id="categories">
                {existingCategories.map(c => <option key={c.title} value={c.title} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Sub-Category</label>
              <input 
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none text-sm font-medium"
                value={formData.subCategory}
                onChange={e => setFormData({...formData, subCategory: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Subject Title</label>
            <input 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-bold text-xl"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Advanced SQL Optimization"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Content (Markdown)</label>
            <textarea 
              rows={12}
              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none font-mono text-xs leading-relaxed"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
              placeholder="# Start writing your notes here..."
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={status !== 'idle' || !isDirty}
            className={`w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest transition-all ${
              status === 'saved' ? 'bg-green-500 text-white' : 
              !isDirty ? 'bg-slate-50 text-slate-300 cursor-not-allowed' :
              'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-95'
            }`}
          >
            {status === 'saving' ? 'Syncing...' : status === 'saved' ? 'Success' : editItem ? 'Save Updates' : 'Publish Entry'}
          </button>
        </div>

        {/* Live Rendering Pane */}
        <div className={`${isPreview ? 'lg:col-span-12' : 'lg:col-span-5'} bg-slate-50/50 p-8 md:p-12 rounded-[2.5rem] border border-slate-200/50 min-h-[500px] sticky top-32 overflow-y-auto max-h-[calc(100vh-200px)]`}>
          <div className="flex items-center gap-2 mb-8 text-slate-400 border-b border-slate-200 pb-4">
            <ICONS.Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Preview</span>
          </div>
          
          <div className="prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-black">
            <h1 className="!mb-4 !text-3xl">{formData.title || 'Untitled'}</h1>
            <div 
              className="markdown-content"
              dangerouslySetInnerHTML={{ __html: marked.parse(formData.content || "*Your content will appear here as you type...*") }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntryCreator;
