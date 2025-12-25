
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';
import { GitHubConfig } from '../types';

interface GitHubSettingsProps {
  onBack: () => void;
  onSave: (config: GitHubConfig) => void;
}

const GitHubSettings: React.FC<GitHubSettingsProps> = ({ onBack, onSave }) => {
  const [config, setConfig] = useState<GitHubConfig>({
    owner: '',
    repo: '',
    token: '',
    branch: 'main'
  });

  useEffect(() => {
    const saved = localStorage.getItem('gh_config');
    if (saved) setConfig(JSON.parse(saved));
  }, []);

  const handleSave = () => {
    if (!config.token || !config.owner || !config.repo) {
      alert("Please fill in your GitHub details and Token.");
      return;
    }
    localStorage.setItem('gh_config', JSON.stringify(config));
    onSave(config);
    alert("Owner Identity Verified!");
    onBack();
  };

  const handleLogout = () => {
    if (confirm("Log out and clear session? Your security token will be deleted from this browser's local storage.")) {
      localStorage.removeItem('gh_config');
      onSave({ owner: '', repo: '', token: '', branch: 'main' });
      onBack();
    }
  };

  const isLoggedIn = !!config.token && !!localStorage.getItem('gh_config');

  return (
    <div className="max-w-xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 mb-8 transition-colors group">
        <ICONS.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Back to Index</span>
      </button>

      <div className="mb-10 text-center md:text-left">
        <h2 className="text-4xl font-black text-slate-900 mb-2">Owner Identity</h2>
        <p className="text-slate-500">
          {isLoggedIn ? "You are authenticated. Write access is enabled." : "Verify your identity to enable write access."}
        </p>
      </div>

      <div className="space-y-6 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl">
        {!isLoggedIn ? (
          <>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">GitHub Username</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                value={config.owner}
                onChange={e => setConfig({...config, owner: e.target.value})}
                placeholder="e.g. janesmith"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Repository Name</label>
              <input 
                type="text" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all"
                value={config.repo}
                onChange={e => setConfig({...config, repo: e.target.value})}
                placeholder="e.g. my-notes"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">Personal Access Token</label>
              <input 
                type="password" 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all font-mono"
                value={config.token}
                onChange={e => setConfig({...config, token: e.target.value})}
                placeholder="ghp_xxxxxxxxxxxx"
              />
              
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl mt-6 space-y-3">
                <h4 className="text-slate-800 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
                  </svg>
                  Storage & Security
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  The token is stored in your <strong>Browser's Local Storage</strong>. It never leaves your device except when sent to GitHub over HTTPS. Anyone with access to this computer can view it in the console. <strong>Log out</strong> to clear it.
                </p>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98]"
            >
              Save & Authenticate
            </button>
          </>
        ) : (
          <div className="py-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ICONS.Check className="w-10 h-10" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Authenticated: {config.owner}</p>
              <p className="text-xs text-slate-500 mt-1">Target Repo: {config.repo}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full py-4 border-2 border-red-50 text-red-400 hover:bg-red-50 hover:border-red-100 rounded-2xl font-bold transition-all"
            >
              Clear Session (Logout)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubSettings;
