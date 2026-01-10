import { useState } from 'react';
import { 
  FileText, Plane, ShoppingBag, Shield, Home, Briefcase, Heart,
  MoreVertical, Trash2, Archive, Play, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { sv, enUS, pt, nl, es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CountryCode } from '@/types/helplix';
import type { SessionWithMetadata, CaseType, SessionStatus } from '@/types/session';

interface SessionHistoryScreenProps {
  sessions: SessionWithMetadata[];
  currentSessionId: string | null;
  country: CountryCode | null;
  onResumeSession: (sessionId: string) => void;
  onArchiveSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  isLoading: boolean;
}

const CaseTypeIcon = ({ type }: { type: CaseType }) => {
  const iconProps = { className: "h-5 w-5", strokeWidth: 1.5 };
  
  switch (type) {
    case 'travel_damage': return <Plane {...iconProps} />;
    case 'consumer': return <ShoppingBag {...iconProps} />;
    case 'insurance': return <Shield {...iconProps} />;
    case 'housing': return <Home {...iconProps} />;
    case 'employment': return <Briefcase {...iconProps} />;
    case 'personal_injury': return <Heart {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const getDateLocale = (country: CountryCode | null) => {
  switch (country) {
    case 'SE': return sv;
    case 'BR': return pt;
    case 'NL': return nl;
    case 'MX': return es;
    default: return enUS;
  }
};

export function SessionHistoryScreen({
  sessions,
  currentSessionId,
  country,
  onResumeSession,
  onArchiveSession,
  onDeleteSession,
  isLoading,
}: SessionHistoryScreenProps) {
  const t = useTranslation(country);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  const dateLocale = getDateLocale(country);

  const getStatusColor = (status: SessionStatus): string => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary border-primary/20';
      case 'completed': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'archived': return 'bg-muted text-muted-foreground border-muted';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: SessionStatus): string => {
    return t.history?.status?.[status] || status;
  };

  const getCaseTypeLabel = (type: CaseType): string => {
    return t.history?.caseTypes?.[type] || type;
  };

  const handleDeleteClick = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (sessionToDelete) {
      onDeleteSession(sessionToDelete);
      setSessionToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const formatSessionDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'd MMM yyyy', { locale: dateLocale });
  };

  const formatSessionTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'HH:mm', { locale: dateLocale });
  };

  // Sort sessions: active first, then by updated_at
  const sortedSessions = [...sessions].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4">
        <h1 className="text-lg font-semibold mb-4">{t.history?.title || 'My Cases'}</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-semibold">{t.history?.title || 'My Cases'}</h1>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        {sortedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">
              {t.history?.noSessions || 'No previous cases'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {sortedSessions.map((session) => {
              const isCurrent = session.id === currentSessionId;
              
              return (
                <div
                  key={session.id}
                  className={cn(
                    "bg-card border rounded-lg p-3 transition-colors",
                    isCurrent 
                      ? "border-primary/50 bg-primary/5" 
                      : "border-border hover:border-border/80"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Case Type Icon */}
                    <div className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                      "bg-muted text-muted-foreground"
                    )}>
                      <CaseTypeIcon type={session.case_type as CaseType} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-sm truncate">
                            {session.title || getCaseTypeLabel(session.case_type as CaseType)}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {formatSessionDate(session.updated_at)}
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatSessionTime(session.updated_at)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Status Badge + Menu */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge 
                            variant="outline" 
                            className={cn("text-[10px] px-1.5 py-0", getStatusColor(session.status as SessionStatus))}
                          >
                            {getStatusLabel(session.status as SessionStatus)}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!isCurrent && (
                                <DropdownMenuItem onClick={() => onResumeSession(session.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  {t.history?.resume || 'Resume'}
                                </DropdownMenuItem>
                              )}
                              {session.status !== 'archived' && (
                                <DropdownMenuItem onClick={() => onArchiveSession(session.id)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  {t.history?.archive || 'Archive'}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDeleteClick(session.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                {t.history?.delete || 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Summary */}
                      {session.summary && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.history?.deleteConfirmTitle || 'Delete case?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.history?.deleteConfirmDescription || 'This action cannot be undone. All data for this case will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common?.cancel || 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t.history?.delete || 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
