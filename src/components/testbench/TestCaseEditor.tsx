import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TestCase } from '@/types/testbench';
import { Save, Plus, X } from 'lucide-react';

interface TestCaseEditorProps {
  isOpen: boolean;
  onClose: () => void;
  testCase: TestCase | null;
  onSave: (testCase: Partial<TestCase>) => Promise<void>;
}

const COUNTRIES = [
  { code: 'SE', label: 'Sweden' },
  { code: 'BR', label: 'Brazil' },
  { code: 'MX', label: 'Mexico' },
  { code: 'US', label: 'USA' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'DO', label: 'Dominican Rep.' }
];

const CASE_TYPES = [
  { code: 'travel_damage', label: 'Travel Damage' },
  { code: 'consumer', label: 'Consumer' },
  { code: 'housing', label: 'Housing' },
  { code: 'employment', label: 'Employment' },
  { code: 'contract', label: 'Contract' },
  { code: 'general', label: 'General' }
];

export function TestCaseEditor({ isOpen, onClose, testCase, onSave }: TestCaseEditorProps) {
  const [formData, setFormData] = useState<Partial<TestCase>>({
    title: '',
    country_code: 'SE',
    case_type: 'general',
    difficulty: 'medium',
    source: 'synthetic',
    scenario: { description: '', key_facts: [] },
    simulated_answers: [''],
    expected_facts: [{ fact: '', weight: 10 }],
    expected_legal_issues: [{ issue: '', weight: 15 }],
    expected_timeline: [],
    scoring_rubric: {
      fact_coverage: 0.25,
      legal_accuracy: 0.30,
      timeline_accuracy: 0.15,
      question_quality: 0.15,
      language_quality: 0.10,
      professionalism: 0.05
    },
    is_active: true
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (testCase) {
      setFormData(testCase);
    } else {
      setFormData({
        title: '',
        country_code: 'SE',
        case_type: 'general',
        difficulty: 'medium',
        source: 'synthetic',
        scenario: { description: '', key_facts: [] },
        simulated_answers: [''],
        expected_facts: [{ fact: '', weight: 10 }],
        expected_legal_issues: [{ issue: '', weight: 15 }],
        expected_timeline: [],
        scoring_rubric: {
          fact_coverage: 0.25,
          legal_accuracy: 0.30,
          timeline_accuracy: 0.15,
          question_quality: 0.15,
          language_quality: 0.10,
          professionalism: 0.05
        },
        is_active: true
      });
    }
  }, [testCase, isOpen]);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const addSimulatedAnswer = () => {
    setFormData(prev => ({
      ...prev,
      simulated_answers: [...(prev.simulated_answers || []), '']
    }));
  };

  const updateSimulatedAnswer = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      simulated_answers: prev.simulated_answers?.map((a, i) => i === index ? value : a)
    }));
  };

  const removeSimulatedAnswer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      simulated_answers: prev.simulated_answers?.filter((_, i) => i !== index)
    }));
  };

  const addExpectedFact = () => {
    setFormData(prev => ({
      ...prev,
      expected_facts: [...(prev.expected_facts || []), { fact: '', weight: 10 }]
    }));
  };

  const updateExpectedFact = (index: number, field: 'fact' | 'weight', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      expected_facts: prev.expected_facts?.map((f, i) => 
        i === index ? { ...f, [field]: value } : f
      )
    }));
  };

  const removeExpectedFact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expected_facts: prev.expected_facts?.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {testCase ? 'Edit Test Case' : 'Create New Test Case'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-4">
            {/* Basic Info */}
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="E.g. Delayed baggage on flight"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select 
                  value={formData.country_code} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, country_code: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Type</Label>
                <Select 
                  value={formData.case_type} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, case_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CASE_TYPES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select 
                  value={formData.difficulty} 
                  onValueChange={(v: 'easy' | 'medium' | 'hard') => setFormData(prev => ({ ...prev, difficulty: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Scenario */}
            <div className="space-y-2">
              <Label>Scenario Description</Label>
              <Textarea 
                value={formData.scenario?.description || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  scenario: { ...prev.scenario!, description: e.target.value }
                }))}
                placeholder="Describe the scenario to be tested..."
                rows={3}
              />
            </div>

            {/* Simulated Answers */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Simulated User Answers</Label>
                <Button size="sm" variant="outline" onClick={addSimulatedAnswer}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.simulated_answers?.map((answer, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={answer}
                      onChange={(e) => updateSimulatedAnswer(i, e.target.value)}
                      placeholder={`Answer ${i + 1}`}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeSimulatedAnswer(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Facts */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Expected Facts</Label>
                <Button size="sm" variant="outline" onClick={addExpectedFact}>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {formData.expected_facts?.map((fact, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={fact.fact}
                      onChange={(e) => updateExpectedFact(i, 'fact', e.target.value)}
                      placeholder="Fact that should be identified"
                      className="flex-1"
                    />
                    <Input 
                      type="number"
                      value={fact.weight}
                      onChange={(e) => updateExpectedFact(i, 'weight', parseInt(e.target.value) || 0)}
                      className="w-20"
                      min={1}
                      max={25}
                    />
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => removeExpectedFact(i)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.title}>
            <Save className="h-4 w-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
