import { memo } from 'react';
import { Zap, Scale, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisDepth, CountryCode } from '@/types/helplix';
import { useTranslation } from '@/hooks/useTranslation';

interface AnalysisDepthSelectorProps {
  onSelect: (depth: AnalysisDepth) => void;
  country: CountryCode | null;
}

export const AnalysisDepthSelector = memo(function AnalysisDepthSelector({
  onSelect,
  country,
}: AnalysisDepthSelectorProps) {
  const t = useTranslation(country);

  const options: Array<{
    depth: AnalysisDepth;
    icon: typeof Zap;
    label: string;
    description: string;
  }> = [
    {
      depth: 'quick',
      icon: Zap,
      label: t.analysisDepth.quick.label,
      description: t.analysisDepth.quick.description,
    },
    {
      depth: 'standard',
      icon: Scale,
      label: t.analysisDepth.standard.label,
      description: t.analysisDepth.standard.description,
    },
    {
      depth: 'thorough',
      icon: Search,
      label: t.analysisDepth.thorough.label,
      description: t.analysisDepth.thorough.description,
    },
  ];

  return (
    <div className="w-full max-w-sm mx-auto px-4">
      <p className="text-center text-muted-foreground text-sm mb-4">
        {t.analysisDepth.selectPrompt}
      </p>
      
      <div className="flex flex-col gap-2">
        {options.map(({ depth, icon: Icon, label, description }) => (
          <button
            key={depth}
            type="button"
            onClick={() => onSelect(depth)}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              "bg-secondary/50 hover:bg-secondary",
              "border border-border/50 hover:border-primary/30",
              "transition-all duration-200",
              "text-left touch-manipulation",
              "active:scale-[0.98]"
            )}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full",
              "flex items-center justify-center",
              depth === 'quick' && "bg-green-500/20 text-green-600",
              depth === 'standard' && "bg-primary/20 text-primary",
              depth === 'thorough' && "bg-amber-500/20 text-amber-600"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{label}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
