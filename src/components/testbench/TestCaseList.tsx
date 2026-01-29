import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TestCaseWithLatestRun, COUNTRY_FLAGS, DIFFICULTY_COLORS } from '@/types/testbench';
import { Play, Eye, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface TestCaseListProps {
  testCases: TestCaseWithLatestRun[];
  isLoading: boolean;
  onRun: (testCase: TestCaseWithLatestRun) => void;
  onViewDetails: (testCase: TestCaseWithLatestRun) => void;
}

export function TestCaseList({ testCases, isLoading, onRun, onViewDetails }: TestCaseListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  if (testCases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Inga testfall hittades. Skapa ett nytt eller använd Research för att hitta verkliga fall.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {testCases.map((tc) => (
        <TestCaseCard 
          key={tc.id} 
          testCase={tc} 
          onRun={onRun}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}

interface TestCaseCardProps {
  testCase: TestCaseWithLatestRun;
  onRun: (testCase: TestCaseWithLatestRun) => void;
  onViewDetails: (testCase: TestCaseWithLatestRun) => void;
}

function TestCaseCard({ testCase, onRun, onViewDetails }: TestCaseCardProps) {
  const flag = COUNTRY_FLAGS[testCase.country_code] || '🌍';
  const difficultyClass = DIFFICULTY_COLORS[testCase.difficulty] || '';
  const latestScore = testCase.latest_run?.score?.overall_score;
  const lastRunTime = testCase.latest_run?.completed_at;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{flag}</span>
            <h3 className="font-medium truncate">{testCase.title}</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs">
              {testCase.case_type}
            </Badge>
            <Badge className={`text-xs ${difficultyClass}`}>
              {testCase.difficulty === 'easy' ? 'Enkel' : 
               testCase.difficulty === 'medium' ? 'Medel' : 'Svår'}
            </Badge>
            
            {latestScore !== undefined && (
              <span className={`font-medium ${getScoreColor(latestScore)}`}>
                {latestScore}/100
              </span>
            )}
            
            {lastRunTime && (
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(lastRunTime), { 
                  addSuffix: true, 
                  locale: sv 
                })}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(testCase)}
          >
            <Eye className="h-4 w-4 mr-1" />
            Detaljer
          </Button>
          <Button 
            size="sm"
            onClick={() => onRun(testCase)}
          >
            <Play className="h-4 w-4 mr-1" />
            Kör
          </Button>
        </div>
      </div>
    </Card>
  );
}
