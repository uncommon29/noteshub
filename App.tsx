
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import Section from './components/Section';
import ContentView from './components/ContentView';
import EntryCreator from './components/EntryCreator';
import GitHubSettings from './components/GitHubSettings';
import AIExplorer from './components/AIExplorer';
import { KNOWLEDGE_BASE, ICONS, STORAGE_KEY } from './constants';
import { AppView, LinkItem, MainCategory, GitHubConfig, SortOption } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [activeItem, setActiveItem] = useState<LinkItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('alpha-asc');
  const [knowledge, setKnowledge] = useState<MainCategory[]>([]);
  const [githubConfig, setGithubConfig] = useState<GitHubConfig | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);

  useEffect(() => {
    const savedKnowledge = localStorage.getItem(STORAGE_KEY);
    if (savedKnowledge) {
      try {
        setKnowledge(JSON.parse(savedKnowledge));
      } catch (e) {
        setKnowledge(KNOWLEDGE_BASE);
      }
    } else {
      setKnowledge(KNOWLEDGE_BASE);
    }

    const savedGH = localStorage.getItem('gh_config');
    if (savedGH) {
      setGithubConfig(JSON.parse(savedGH));
    }
  }, []);

  const isOwner = !!githubConfig?.token;

  const processedKnowledge = useMemo(() => {
    let result = JSON.parse(JSON.stringify(knowledge)) as MainCategory[];

    // 1. Search Filtering
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(cat => {
        const catMatches = cat.title.toLowerCase().includes(lowerSearch);
        const subMatches = cat.subCategories.some(sub => 
          sub.title.toLowerCase().includes(lowerSearch) ||
          sub.links.some(link => link.title.toLowerCase().includes(lowerSearch))
        );
        return catMatches || subMatches;
      }).map(cat => {
        if (cat.title.toLowerCase().includes(lowerSearch)) return cat;
        return {
          ...cat,
          subCategories: cat.subCategories.filter(sub => 
            sub.title.toLowerCase().includes(lowerSearch) ||
            sub.links.some(link => link.title.toLowerCase().includes(lowerSearch))
          )
        };
      });
    }

    // 2. Sorting
    const sortFn = (a: string, b: string) => {
      if (sortBy === 'alpha-asc') return a.localeCompare(b);
      if (sortBy === 'alpha-desc') return b.localeCompare(a);
      return 0;
    };

    result.sort((a, b) => sortFn(a.title, b.title));
    result.forEach(cat => {
      cat.subCategories.sort((a, b) => sortFn(a.title, b.title));
      cat.subCategories.forEach(sub => {
        if (sortBy === 'newest') {
          sub.links.sort((a, b) => b.id.localeCompare(a.id));
        } else {
          sub.links.sort((a, b) => sortFn(a.title, b.title));
        }
      });
    });

    return result;
  }, [searchTerm, knowledge, sortBy]);

  const handleLinkClick = (item: LinkItem) => {
    setActiveItem(item);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (item: LinkItem) => {
    if (!isOwner) return;
    setActiveItem(item);
    setView('editor');
  };

  const renderView = () => {
    switch (view) {
      case 'detail':
        return (
          <ContentView 
            item={activeItem} 
            onBack={() => setView('home')} 
            onEdit={handleEdit}
            onDelete={() => setView('home')}
            githubConfig={githubConfig}
            allKnowledge={knowledge}
          />
        );
      case 'creator':
      case 'editor':
        if (!isOwner) {
          setView('home');
          return null;
        }
        return (
          <EntryCreator 
            onBack={() => setView('home')} 
            existingCategories={knowledge}
            onSave={setKnowledge}
            githubConfig={githubConfig}
            editItem={view === 'editor' ? activeItem : null}
          />
        );
      case 'settings':
        return (
          <GitHubSettings 
            onBack={() => setView('home')}
            onSave={setGithubConfig}
          />
        );
      default:
        return (
          <main className="max-w-6xl mx-auto px-6 animate-in fade-in duration-500">
            {processedKnowledge.length > 0 ? (
              processedKnowledge.map((category, i) => (
                <Section 
                  key={category.title + i} 
                  category={category} 
                  highlight={searchTerm} 
                  onLinkClick={handleLinkClick}
                />
              ))
            ) : (
              <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-slate-200/50 text-slate-400">
                <ICONS.Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-bold">No results found.</p>
                <p className="text-sm">Try clearing your search or sort criteria.</p>
              </div>
            )}
          </main>
        );
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-[#fcfcfc]">
      {view === 'home' && (
        <Header 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          onOpenSettings={() => setView('settings')}
          onOpenCreator={() => setView('creator')}
          isSyncEnabled={isOwner}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      )}
      
      {renderView()}

      <AIExplorer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />

      <footer className="max-w-6xl mx-auto px-6 mt-32 pt-16 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
        <div className="text-[10px] uppercase tracking-widest font-black text-slate-400">
          InsightHub &bull; {isOwner ? 'Owner Dashboard' : 'Public Access'} &bull; {new Date().getFullYear()}
        </div>
        <div className="flex gap-8">
          <button onClick={() => setView('home')} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-blue-600 transition-colors">Index</button>
          <button onClick={() => setIsAIOpen(true)} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-blue-600 transition-colors">Explorer</button>
          {isOwner && (
            <button onClick={() => setView('creator')} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-blue-600 transition-colors">New Subject</button>
          )}
          <button onClick={() => setView('settings')} className="text-[10px] uppercase tracking-widest font-bold text-slate-400 hover:text-blue-600 transition-colors">
            {isOwner ? 'Dashboard' : 'Owner Login'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default App;
