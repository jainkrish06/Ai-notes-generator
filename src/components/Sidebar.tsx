import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  Settings,
  HardDrive,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

export type NavView = 'dashboard' | 'create' | 'notes' | 'flashcards' | 'quiz' | 'settings';

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  noteCount: number;
  flashcardCount: number;
  quizCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  noteCount,
  flashcardCount,
  quizCount,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'create' as NavView,
      label: 'Create Notes',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'notes' as NavView,
      label: 'My Notes',
      icon: BookOpen,
      badge: noteCount > 0 ? noteCount : undefined,
    },
    {
      id: 'flashcards' as NavView,
      label: 'Flashcards',
      icon: Layers,
      badge: flashcardCount > 0 ? flashcardCount : undefined,
    },
    {
      id: 'quiz' as NavView,
      label: 'Practice Quiz',
      icon: HelpCircle,
      badge: quizCount > 0 ? quizCount : undefined,
    },
    {
      id: 'settings' as NavView,
      label: 'Settings',
      icon: Settings,
    },
  ];

  const handleSelect = (view: NavView) => {
    onNavigate(view);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <div
              onClick={() => handleSelect('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-slate-900 tracking-tight text-base">NoteMind</span>
                <span className="text-xs font-bold text-indigo-600 ml-1">AI</span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 lg:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : item.highlight
                      ? 'bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/70'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / Storage Status Indicator */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
              <span>Local Storage Mode</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              All notes saved locally on this device. Fully private & offline ready.
            </p>
          </div>

          <div className="text-[11px] text-slate-400 text-center">
            Powered by Gemini 3.8 Flash
          </div>
        </div>
      </aside>
    </>
  );
};
