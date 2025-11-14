import { FileText, X, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface FileListSectionProps {
  files: any[];
  onRemove: (id: string) => void;
  showBaseline?: boolean;
  baselineFileId?: string | null;
  onSetBaseline?: (id: string) => void;
  emptyMessage: string;
}

function FileListSection({
  files,
  onRemove,
  showBaseline,
  baselineFileId,
  onSetBaseline,
  emptyMessage,
}: FileListSectionProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {files.map((file) => (
        <Card
          key={file.id}
          className={`transition-all ${
            showBaseline && baselineFileId === file.id
              ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/50'
              : ''
          }`}
        >
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
              <div className="flex items-center gap-2">
                {showBaseline && onSetBaseline && (
                  <Button
                    variant={baselineFileId === file.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onSetBaseline(file.id)}
                  >
                    {baselineFileId === file.id ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Baseline
                      </>
                    ) : (
                      'Als Baseline'
                    )}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(file.id)}
                  className="text-destructive hover:text-destructive h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function FileLists() {
  const baselineFiles = useAppStore((state) => state.baselineFiles);
  const comparedFiles = useAppStore((state) => state.comparedFiles);
  const removeBaselineFile = useAppStore((state) => state.removeBaselineFile);
  const removeComparedFile = useAppStore((state) => state.removeComparedFile);
  const baselineFileId = useAppStore((state) => state.settings.baselineFileId);
  const setBaselineFile = useAppStore((state) => state.setBaselineFile);

  if (baselineFiles.length === 0 && comparedFiles.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Baseline-Dateien */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Baseline-Dateien ({baselineFiles.length})
          </h3>
        </div>
        <FileListSection
          files={baselineFiles}
          onRemove={removeBaselineFile}
          showBaseline={true}
          baselineFileId={baselineFileId}
          onSetBaseline={setBaselineFile}
          emptyMessage="Keine Baseline-Dateien hochgeladen"
        />
      </div>

      {/* Vergleichs-Dateien */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Zu vergleichende Dateien ({comparedFiles.length})
          </h3>
        </div>
        <FileListSection
          files={comparedFiles}
          onRemove={removeComparedFile}
          emptyMessage="Keine Dateien zum Vergleichen hochgeladen"
        />
      </div>
    </div>
  );
}
