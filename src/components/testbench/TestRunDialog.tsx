import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TestCaseWithLatestRun, TestRun, TestScore, COUNTRY_FLAGS } from '@/types/testbench';
import { Play, CheckCircle, XCircle, Loader2, BarChart3 } from 'lucide-react';

interface TestRunDialogProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCaseWithLatestRun | null;
  onRun: (testCaseId: string) => Promise<TestRun | null>;
  onEvaluate: (testRunId: string, depth?: 'quick' | 'thorough') => Promise<TestScore | null>;
}

type RunPhase = 'idle' | 'running' | 'completed' | 'evaluating' | 'evaluated' | 'failed';

export function TestRunDialog({ 
  isOpen, 
  onClose, 
  testCase,
  onRun,
  onEvaluate
}: TestRunDialogProps) {
  const [phase, setPhase] = useState<RunPhase>('idle');
  const [runResult, setRunResult] = useState<TestRun | null>(null);
  const [scoreResult, setScoreResult] = useState<TestScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!testCase) return;
    
    setPhase('running');
    setError(null);
    
    const result = await onRun(testCase.id);
    
    if (result) {
      setRunResult(result);
      setPhase('completed');
    } else {
      setPhase('failed');
      setError('Test run failed');
    }
  };

  const handleEvaluate = async () => {
    if (!runResult?.id) return;
    
    setPhase('evaluating');
    setError(null);
    
    const score = await onEvaluate(runResult.id);
    
    if (score) {
      setScoreResult(score);
      setPhase('evaluated');
    } else {
      setPhase('failed');
      setError('Evaluation failed');
    }
  };

  const handleClose = () => {
    setPhase('idle');
    setRunResult(null);
    setScoreResult(null);
    setError(null);
    onClose();
  };

  if (!testCase) return null;

  const flag = COUNTRY_FLAGS[testCase.country_code] || '🌍';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{flag}</span>
            {testCase.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            {phase === 'idle' && (
              <Badge variant="outline">Redo att köra</Badge>
            )}
            {phase === 'running' && (
              <Badge className="bg-blue-500/20 text-blue-500">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Kör test...
              </Badge>
            )}
            {phase === 'completed' && (
              <Badge className="bg-green-500/20 text-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Test klart
              </Badge>
            )}
            {phase === 'evaluating' && (
              <Badge className="bg-purple-500/20 text-purple-500">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Utvärderar...
              </Badge>
            )}
            {phase === 'evaluated' && (
              <Badge className="bg-primary/20 text-primary">
                <BarChart3 className="h-3 w-3 mr-1" />
                Utvärdering klar
              </Badge>
            )}
            {phase === 'failed' && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Misslyckades
              </Badge>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Conversation Log */}
          {runResult?.conversation_log && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Konversation</h4>
              <ScrollArea className="h-48 border rounded-lg p-3">
                <div className="space-y-2 text-sm">
                  {runResult.conversation_log.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded ${
                        msg.role === 'assistant' 
                          ? 'bg-primary/10 ml-4' 
                          : msg.role === 'user'
                          ? 'bg-muted mr-4'
                          : 'bg-yellow-500/10 text-center text-xs'
                      }`}
                    >
                      <span className="font-medium text-xs text-muted-foreground">
                        {msg.role === 'assistant' ? 'AI' : msg.role === 'user' ? 'Användare' : 'System'}
                        {msg.phase && ` (${msg.phase})`}
                      </span>
                      <p className="mt-1">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Scores */}
          {scoreResult && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Resultat</h4>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-4xl font-bold text-primary">
                  {scoreResult.overall_score}
                </div>
                <div className="text-sm text-muted-foreground">Totalpoäng</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <ScoreBar label="Faktatäckning" value={scoreResult.fact_coverage} />
                <ScoreBar label="Juridisk precision" value={scoreResult.legal_accuracy} />
                <ScoreBar label="Tidslinje" value={scoreResult.timeline_accuracy} />
                <ScoreBar label="Frågeteknik" value={scoreResult.question_quality} />
                <ScoreBar label="Språkkvalitet" value={scoreResult.language_quality} />
                <ScoreBar label="Professionalism" value={scoreResult.professionalism} />
              </div>

              {scoreResult.evaluator_notes && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <strong>Anteckningar:</strong>
                  <p className="mt-1 text-muted-foreground">{scoreResult.evaluator_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Stäng
            </Button>
            
            {phase === 'idle' && (
              <Button onClick={handleRun}>
                <Play className="h-4 w-4 mr-1" />
                Starta test
              </Button>
            )}
            
            {phase === 'completed' && (
              <Button onClick={handleEvaluate}>
                <BarChart3 className="h-4 w-4 mr-1" />
                Utvärdera
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const getColor = (v: number) => {
    if (v >= 80) return 'bg-green-500';
    if (v >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} className={`h-2 ${getColor(value)}`} />
    </div>
  );
}
