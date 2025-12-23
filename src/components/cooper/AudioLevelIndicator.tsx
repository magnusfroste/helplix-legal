import { memo } from 'react';
import { cn } from '@/lib/utils';

interface AudioLevelIndicatorProps {
  level: number; // 0-100
  isRecording: boolean;
}

export const AudioLevelIndicator = memo(function AudioLevelIndicator({ level, isRecording }: AudioLevelIndicatorProps) {
  if (!isRecording) return null;

  const bars = 12;
  const activeThreshold = level / 100;

  return (
    <div className="flex items-center justify-center gap-1 h-8 mb-4">
      {Array.from({ length: bars }).map((_, i) => {
        const barPosition = (i + 1) / bars;
        const isActive = barPosition <= activeThreshold;
        const intensity = Math.max(0, 1 - Math.abs(barPosition - activeThreshold) * 3);
        
        // Color gradient: green -> yellow -> red
        let barColor = 'bg-green-500';
        if (i >= bars * 0.6) barColor = 'bg-yellow-500';
        if (i >= bars * 0.85) barColor = 'bg-red-500';
        
        return (
          <div
            key={i}
            className={cn(
              'w-2 rounded-full transition-all duration-75',
              isActive ? barColor : 'bg-muted-foreground/20'
            )}
            style={{
              height: `${12 + (i * 1.5)}px`,
              opacity: isActive ? 0.9 + (intensity * 0.1) : 0.3,
              transform: isActive ? `scaleY(${0.8 + intensity * 0.4})` : 'scaleY(1)',
            }}
          />
        );
      })}
    </div>
  );
});
