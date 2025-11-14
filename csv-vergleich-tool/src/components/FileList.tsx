import { FileText, X, Check } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

export function FileList() {
  const files = useAppStore((state) => state.files);
  const removeFile = useAppStore((state) => state.removeFile);
  const baselineFileId = useAppStore((state) => state.settings.baselineFileId);
  const setBaselineFile = useAppStore((state) => state.setBaselineFile);

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
      <h3 className="text-lg font-semibold mb-3">
        Hochgeladene Dateien ({files.length})
      </h3>
      <div className="grid gap-2">
        {files.map((file) => (
          <Card
            key={file.id}
            className={`transition-all ${
              baselineFileId === file.id
                ? 'ring-2 ring-primary bg-primary/5'
                : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {file.rowCount} Zeilen • {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={baselineFileId === file.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setBaselineFile(file.id)}
                  >
                    {baselineFileId === file.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Baseline
                      </>
                    ) : (
                      'Als Baseline wählen'
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
