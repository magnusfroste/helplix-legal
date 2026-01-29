import { useState, useEffect } from 'react';
import { useTestBench } from '@/hooks/useTestBench';
import { TestCaseList } from './TestCaseList';
import { TestBenchStats } from './TestBenchStats';
import { TestCaseFilters } from './TestCaseFilters';
import { TestRunDialog } from './TestRunDialog';
import { TestCaseEditor } from './TestCaseEditor';
import { ResearchDialog } from './ResearchDialog';
import { Button } from '@/components/ui/button';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { TestCase, TestCaseWithLatestRun } from '@/types/testbench';

export function TestBenchScreen() {
  const { 
    testCases, 
    isLoading, 
    error, 
    stats, 
    fetchTestCases,
    runTest,
    evaluateTest,
    researchCases,
    createTestCase
  } = useTestBench();

  const [filters, setFilters] = useState({
    countryCode: '',
    caseType: '',
    difficulty: ''
  });

  const [selectedCase, setSelectedCase] = useState<TestCaseWithLatestRun | null>(null);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isResearchOpen, setIsResearchOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<TestCase | null>(null);

  useEffect(() => {
    fetchTestCases({
      countryCode: filters.countryCode || undefined,
      caseType: filters.caseType || undefined,
      difficulty: filters.difficulty || undefined,
      isActive: true
    });
  }, [fetchTestCases, filters]);

  const handleRunTest = async (testCase: TestCaseWithLatestRun) => {
    setSelectedCase(testCase);
    setIsRunDialogOpen(true);
  };

  const handleViewDetails = (testCase: TestCaseWithLatestRun) => {
    setEditingCase(testCase);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setEditingCase(null);
    setIsEditorOpen(true);
  };

  const handleSaveTestCase = async (testCase: Partial<TestCase>) => {
    const created = await createTestCase(testCase);
    if (created) {
      setIsEditorOpen(false);
      fetchTestCases(filters);
    }
  };

  const handleResearchComplete = async (suggestedCases: TestCase[]) => {
    // Auto-create the suggested cases
    for (const tc of suggestedCases) {
      await createTestCase(tc);
    }
    setIsResearchOpen(false);
    fetchTestCases(filters);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Testbänk</h1>
            <p className="text-muted-foreground text-sm">
              Systematisk kvalitetskontroll av AI-agenten
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fetchTestCases(filters)}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Uppdatera
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsResearchOpen(true)}
            >
              <Search className="h-4 w-4 mr-1" />
              Research
            </Button>
            <Button 
              size="sm"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nytt testfall
            </Button>
          </div>
        </div>

        {/* Stats */}
        <TestBenchStats stats={stats} />

        {/* Filters */}
        <TestCaseFilters 
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Test Case List */}
        <TestCaseList 
          testCases={testCases}
          isLoading={isLoading}
          onRun={handleRunTest}
          onViewDetails={handleViewDetails}
        />

        {/* Dialogs */}
        <TestRunDialog
          isOpen={isRunDialogOpen}
          onClose={() => setIsRunDialogOpen(false)}
          testCase={selectedCase}
          onRun={runTest}
          onEvaluate={evaluateTest}
        />

        <TestCaseEditor
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          testCase={editingCase}
          onSave={handleSaveTestCase}
        />

        <ResearchDialog
          isOpen={isResearchOpen}
          onClose={() => setIsResearchOpen(false)}
          onResearch={researchCases}
          onComplete={handleResearchComplete}
        />
      </div>
    </div>
  );
}
