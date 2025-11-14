import { FileText, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface FileListProps {
  type: 'current' | 'old';
  title: string;
}

export function FileList({ type, title }: FileListProps) {
  const currentFiles = useAppStore((state) => state.currentVersionFiles);
  const oldFiles = useAppStore((state) => state.oldVersionFiles);
  const removeCurrentFile = useAppStore((state) => state.removeCurrentFile);
  const removeOldFile = useAppStore((state) => state.removeOldFile);

  const files = type === 'current' ? currentFiles : oldFiles;
  const removeFile = type === 'current' ? removeCurrentFile : removeOldFile;

  if (files.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-2">
      <h3 className="text-base font-semibold">
        {title} ({files.length})
      </h3>
      <div className="grid gap-2">
        {files.map((file) => (
          <Card key={file.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.rowCount} Zeilen • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.id)}
                  className="text-destructive hover:text-destructive h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
