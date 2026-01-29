import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { TestBenchScreen } from '@/components/testbench';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function TestBench() {
  const navigate = useNavigate();
  const { isAdmin, isLoading: adminLoading } = useAdminAuth();
  const { getFlag, isLoading: flagsLoading } = useFeatureFlags();

  // Check if testbench is enabled
  const testbenchEnabled = getFlag('testbench_enabled');

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error('Access denied. Administrators only.');
      navigate('/');
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading || flagsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (!testbenchEnabled) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <p className="text-muted-foreground">Test Bench is disabled.</p>
        <p className="text-sm text-muted-foreground">Enable "testbench_enabled" in Admin → Feature Flags.</p>
        <button 
          onClick={() => navigate('/admin')}
          className="text-primary underline"
        >
          Go to Admin
        </button>
      </div>
    );
  }

  return <TestBenchScreen />;
}
