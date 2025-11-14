import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, History, FileDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { parseMultipleCSVFiles } from '@/lib/csvParser';
import toast from 'react-hot-toast';

interface FileUploadProps {
  type: 'baseline' | 'compared';
  title: string;
  description: string;
}

export function FileUpload({ type, title, description }: FileUploadProps) {
  const addBaselineFiles = useAppStore((state) => state.addBaselineFiles);
  const addComparedFiles = useAppStore((state) => state.addComparedFiles);

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

      if (type === 'baseline') {
        addBaselineFiles(parsedFiles);
      } else {
        addComparedFiles(parsedFiles);
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
  }, [type, addBaselineFiles, addComparedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.csv'],
    },
    multiple: true,
  });

  const Icon = type === 'baseline' ? History : FileDown;
  const borderColor = type === 'baseline' ? 'border-blue-500' : 'border-green-500';
  const bgColor = type === 'baseline' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-green-50 dark:bg-green-950';
  const activeColor = type === 'baseline' ? 'border-blue-600 bg-blue-100 dark:bg-blue-900' : 'border-green-600 bg-green-100 dark:bg-green-900';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${type === 'baseline' ? 'text-blue-600' : 'text-green-600'}`} />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">{description}</p>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive
            ? activeColor
            : `${bgColor} border-border hover:${borderColor} hover:border-opacity-50`
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
        <p className="text-xs text-muted-foreground">
          oder klicken zum Auswählen (mehrere Dateien möglich)
        </p>
      </div>
    </div>
  );
}
