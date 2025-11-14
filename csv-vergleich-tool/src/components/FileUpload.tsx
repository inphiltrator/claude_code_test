import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parseMultipleCSVFiles } from '@/lib/csvParser';
import toast from 'react-hot-toast';

interface FileUploadProps {
  type: 'current' | 'old';
  title: string;
  description?: string;
}

export function FileUpload({ type, title, description }: FileUploadProps) {
  const addCurrentFiles = useAppStore((state) => state.addCurrentFiles);
  const addOldFiles = useAppStore((state) => state.addOldFiles);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const csvFiles = acceptedFiles.filter(
      (file) => file.name.endsWith('.csv') || file.type === 'text/csv'
    );

    if (csvFiles.length === 0) {
      toast.error('Bitte nur CSV-Dateien hochladen');
      return;
    }

    try {
      toast.loading(`${csvFiles.length} Datei(en) werden verarbeitet...`, {
        id: `parsing-${type}`,
      });

      const parsedFiles = await parseMultipleCSVFiles(csvFiles);

      if (type === 'current') {
        addCurrentFiles(parsedFiles);
      } else {
        addOldFiles(parsedFiles);
      }

      toast.success(`${parsedFiles.length} Datei(en) erfolgreich geladen`, {
        id: `parsing-${type}`,
      });
    } catch (error) {
      console.error('Fehler beim Parsen:', error);
      toast.error('Fehler beim Laden der CSV-Dateien', {
        id: `parsing-${type}`,
      });
    }
  }, [type, addCurrentFiles, addOldFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.csv'],
    },
    multiple: true,
  });

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
        <p className="text-base font-medium mb-1">
          {isDragActive
            ? 'Dateien hier ablegen...'
            : 'CSV-Dateien hierher ziehen'}
        </p>
        <p className="text-sm text-muted-foreground">
          oder klicken zum Auswählen
        </p>
      </div>
    </div>
  );
}
