import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import type { CountryCode } from '@/types/helplix';
import { FileText, Shield, Brain, AlertTriangle, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingModalProps {
  country: CountryCode | null;
  userId: string | undefined;
  isOpen: boolean;
  onComplete: () => void;
}

const STORAGE_KEY = 'helplix_onboarding_completed';

export function OnboardingModal({ country, userId, isOpen, onComplete }: OnboardingModalProps) {
  const t = useTranslation(country);
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const contentRef = useRef<HTMLDivElement>(null);
  
  const steps = [
    {
      icon: FileText,
      title: t.welcome.howItWorks.title,
      content: t.welcome.howItWorks.description,
    },
    {
      icon: AlertTriangle,
      title: t.welcome.notLegalAdvice.title,
      content: t.welcome.notLegalAdvice.description,
    },
    {
      icon: Shield,
      title: t.welcome.dataStorage.title,
      content: t.welcome.dataStorage.description,
    },
    {
      icon: Brain,
      title: t.welcome.privacy.title,
      content: t.welcome.privacy.description,
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;
  const Icon = currentStep.icon;

  const animateStep = (newStep: number, dir: 'forward' | 'backward') => {
    setDirection(dir);
    setIsAnimating(true);
    
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (isLastStep) {
      // Mark onboarding as completed for this user
      if (userId) {
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, 'true');
      }
      onComplete();
    } else {
      animateStep(step + 1, 'forward');
    }
  };

  const handleBack = () => {
    if (step > 0) {
      animateStep(step - 1, 'backward');
    }
  };

  // Prevent closing the dialog by clicking outside or pressing escape
  const handleOpenChange = (open: boolean) => {
    // Only allow closing through the complete button
    if (!open) return;
  };

  // Reset animation state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setIsAnimating(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="max-w-sm mx-4 p-4 gap-3 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div 
          ref={contentRef}
          className={cn(
            "transition-all duration-150 ease-out",
            isAnimating && direction === 'forward' && "opacity-0 translate-x-4",
            isAnimating && direction === 'backward' && "opacity-0 -translate-x-4",
            !isAnimating && "opacity-100 translate-x-0"
          )}
        >
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-center">
              <div className="p-2 rounded-full bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center text-lg">
              {currentStep.title}
            </DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="max-h-48 mt-3">
            <DialogDescription className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {currentStep.content}
            </DialogDescription>
          </ScrollArea>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 py-1">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                index === step ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-row gap-2 sm:flex-row">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t.welcome.back}
            </Button>
          )}
          <Button
            onClick={handleNext}
            className={step === 0 ? 'w-full' : 'flex-1'}
          >
            {isLastStep ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                {t.welcome.understood}
              </>
            ) : (
              <>
                {t.welcome.next}
                <ChevronRight className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if onboarding should be shown
export function useOnboardingStatus(userId: string | undefined) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    const hasCompleted = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
    setShouldShowOnboarding(!hasCompleted);
    setIsChecking(false);
  }, [userId]);

  const completeOnboarding = () => {
    if (userId) {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, 'true');
    }
    setShouldShowOnboarding(false);
  };

  return { shouldShowOnboarding, isChecking, completeOnboarding };
}
