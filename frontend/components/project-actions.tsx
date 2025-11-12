'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { ProjectLogsDialog } from './project-logs-dialog';
import {
  Play,
  Square,
  RotateCcw,
  Trash2,
  FileText,
  Loader2,
} from 'lucide-react';

interface ProjectActionsProps {
  projectName: string;
  isRunning: boolean;
  onStatusChange: () => void;
}

export function ProjectActions({
  projectName,
  isRunning,
  onStatusChange,
}: ProjectActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const { toast } = useToast();

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    try {
      const response = await fetch(`/api/projects/${projectName}/${action}`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${action} project`);
      }

      toast({
        title: 'Success',
        description: `Project ${action} completed successfully`,
      });

      onStatusChange();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : `Failed to ${action} project`,
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setLoadingAction('delete');
    try {
      const response = await fetch(`/api/projects/${projectName}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete project');
      }

      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });

      onStatusChange();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to delete project',
        variant: 'destructive',
      });
    } finally {
      setLoadingAction(null);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {!isRunning && (
          <Button
            size="sm"
            variant="default"
            onClick={() => handleAction('start')}
            disabled={loadingAction !== null}
          >
            {loadingAction === 'start' && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        )}

        {isRunning && (
          <>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleAction('stop')}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'stop' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Square className="mr-2 h-4 w-4" />
              Stop
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('restart')}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'restart' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowLogsDialog(true)}
          disabled={loadingAction !== null}
        >
          <FileText className="mr-2 h-4 w-4" />
          Logs
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDeleteDialog(true)}
          disabled={loadingAction !== null}
          className="text-destructive hover:text-destructive"
        >
          {loadingAction === 'delete' && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectName}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loadingAction === 'delete' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {showLogsDialog && (
        <ProjectLogsDialog
          projectName={projectName}
          open={showLogsDialog}
          onOpenChange={setShowLogsDialog}
        />
      )}
    </>
  );
}
