import { Card } from '@/components/ui/card';
import { TestBenchStats as Stats } from '@/types/testbench';
import { BarChart3, Scale, FileCheck, Hash } from 'lucide-react';

interface TestBenchStatsProps {
  stats: Stats;
}

export function TestBenchStats({ stats }: TestBenchStatsProps) {
  const statItems = [
    {
      label: 'Total',
      value: `${stats.avgOverallScore}%`,
      icon: BarChart3,
      color: 'text-primary'
    },
    {
      label: 'Legal',
      value: `${stats.avgLegalAccuracy}%`,
      icon: Scale,
      color: 'text-blue-500'
    },
    {
      label: 'Facts',
      value: `${stats.avgFactCoverage}%`,
      icon: FileCheck,
      color: 'text-green-500'
    },
    {
      label: 'Tests',
      value: stats.totalTests.toString(),
      icon: Hash,
      color: 'text-muted-foreground'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((item) => (
        <Card key={item.label} className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <item.icon className={`h-4 w-4 ${item.color}`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
          <div className={`text-2xl font-bold ${item.color}`}>
            {item.value}
          </div>
        </Card>
      ))}
    </div>
  );
}
