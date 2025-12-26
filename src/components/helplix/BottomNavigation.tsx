import { Mic, FileText, ClipboardList, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import type { CountryCode } from '@/types/cooper';

export type NavigationTab = 'dictaphone' | 'log' | 'report' | 'settings';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  country: CountryCode | null;
}

const tabs: { id: NavigationTab; icon: React.ElementType }[] = [
  { id: 'dictaphone', icon: Mic },
  { id: 'log', icon: ClipboardList },
  { id: 'report', icon: FileText },
  { id: 'settings', icon: Settings },
];

export function BottomNavigation({ activeTab, onTabChange, country }: BottomNavigationProps) {
  const t = useTranslation(country);
  
  const getLabel = (tabId: NavigationTab): string => {
    switch (tabId) {
      case 'dictaphone': return t.nav.talk;
      case 'log': return t.nav.log;
      case 'report': return t.nav.report;
      case 'settings': return t.nav.settings;
    }
  };
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-inset-bottom z-50">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 min-w-[64px] transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={cn(
                  "h-5 w-5 mb-0.5 transition-transform",
                  isActive && "scale-110"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                "text-xs font-medium",
                isActive && "font-semibold"
              )}>
                {getLabel(tab.id)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
