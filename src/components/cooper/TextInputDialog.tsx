import { useState } from 'react';
import { Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TextInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (text: string) => void;
  currentQuestion: string;
}

export function TextInputDialog({
  open,
  onOpenChange,
  onSubmit,
  currentQuestion,
}: TextInputDialogProps) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim());
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-cooper-lg font-semibold">
            Type your response
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-cooper-base text-muted-foreground italic">
              "{currentQuestion}"
            </p>
          </div>
          
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer here..."
            className="min-h-[120px] text-cooper-base resize-none"
            autoFocus
          />
          
          <Button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="w-full h-14 text-cooper-lg"
          >
            <Send className="h-5 w-5 mr-2" />
            Send Response
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
