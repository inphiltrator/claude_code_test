import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parseMultipleCSVFiles } from '@/lib/csvParser';
import toast from 'react-hot-toast';

export function FileUpload() {
  const addFiles = useAppStore((state) => state.addFiles);

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
        id: 'parsing',
      });

      const parsedFiles = await parseMultipleCSVFiles(csvFiles);
      addFiles(parsedFiles);

      toast.success(`${parsedFiles.length} Datei(en) erfolgreich geladen`, {
        id: 'parsing',
      });
    } catch (error) {
      console.error('Fehler beim Parsen:', error);
      toast.error('Fehler beim Laden der CSV-Dateien', {
        id: 'parsing',
      });
    }
  }, [addFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.csv'],
    },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
        transition-colors duration-200
        ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
        }
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <p className="text-lg font-medium mb-2">
        {isDragActive
          ? 'Dateien hier ablegen...'
          : 'CSV-Dateien hierher ziehen'}
      </p>
      <p className="text-sm text-muted-foreground">
        oder klicken zum Auswählen (mehrere Dateien möglich)
      </p>
    </div>
  );
}
