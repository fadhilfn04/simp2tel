import { useState, useRef } from 'react';
import { Upload, File, X, Loader2, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket: 'dana-kematian' | 'anggota';
  folder: string;
  label: string;
  disabled?: boolean;
}

export function FileUpload({ value, onChange, bucket, folder, label, disabled = false }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      // Upload file via API route
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', bucket);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to upload file');
      }

      // If there's an existing file, delete it
      if (value) {
        try {
          await fetch(`/api/upload?url=${encodeURIComponent(value)}&bucket=${bucket}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.warn('Failed to delete old file:', error);
        }
      }

      onChange(data.url);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      await fetch(`/api/upload?url=${encodeURIComponent(value)}&bucket=${bucket}`, {
        method: 'DELETE',
      });

      onChange('');
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to remove file');
    }
  };

  const getFileIcon = () => {
    if (!value) return <File className="h-4 w-4" />;

    const isPdf = value.toLowerCase().includes('.pdf');
    const isImage = value.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

    if (isPdf) return <FileText className="h-4 w-4 text-red-500" />;
    if (isImage) return <Image className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4" />;
  };

  const getFileName = () => {
    if (!value) return '';
    try {
      const url = new URL(value);
      const pathParts = url.pathname.split('/');
      return pathParts[pathParts.length - 1];
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>

      {value ? (
        // Show uploaded file
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border">
          <div className="flex-shrink-0">{getFileIcon()}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{getFileName()}</p>
            <p className="text-xs text-muted-foreground truncate">{value}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={disabled || uploading}
            className="flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Show upload input
        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id={`file-upload-${bucket}-${folder}`}
          />
          <label
            htmlFor={`file-upload-${bucket}-${folder}`}
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                <div className="text-sm text-center">
                  <p className="font-medium">Mengunggah...</p>
                  <p className="text-muted-foreground">{uploadProgress}%</p>
                </div>
                {uploadProgress > 0 && (
                  <div className="w-full max-w-xs bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-center">
                  <p className="font-medium">Klik untuk mengunggah</p>
                  <p className="text-muted-foreground text-xs">
                    PDF atau Gambar (Max 5MB)
                  </p>
                </div>
              </>
            )}
          </label>
        </div>
      )}

      {error && (
        <div className="text-sm text-destructive flex items-center gap-1">
          <span>⚠️ {error}</span>
        </div>
      )}

      {value && !uploading && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.open(value, '_blank')}
            className="flex-1"
          >
            <FileText className="h-4 w-4 mr-2" />
            View File
          </Button>
        </div>
      )}
    </div>
  );
}
