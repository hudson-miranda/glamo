import React, { useState, useRef } from 'react';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value?: string; // Current image path
  onChange: (path: string) => void;
  onFileSelect?: (file: File) => Promise<string>; // Returns uploaded file path
  disabled?: boolean;
  error?: string;
  required?: boolean;
  id?: string;
  tooltip?: React.ReactNode;
  accept?: string;
  maxSizeMB?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  value,
  onChange,
  onFileSelect,
  disabled = false,
  error,
  required = false,
  id,
  tooltip,
  accept = 'image/*',
  maxSizeMB = 5,
}) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      alert(`O arquivo deve ter no máximo ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file if handler provided
      if (onFileSelect) {
        const uploadedPath = await onFileSelect(file);
        onChange(uploadedPath);
      } else {
        // Fallback: use file name as path (for now)
        onChange(file.name);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          {label}
        </Label>
        {tooltip}
      </div>

      <div className="space-y-2">
        {/* Preview */}
        {preview ? (
          <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain bg-gray-50"
            />
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div
            onClick={!disabled ? handleClick : undefined}
            className={`w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 hover:bg-gray-50'
            } ${error ? 'border-red-500' : ''}`}
          >
            {uploading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Enviando...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Clique para selecionar</p>
                  <p className="text-xs text-gray-400">ou arraste a imagem aqui</p>
                  <p className="text-xs text-gray-400 mt-1">Máximo: {maxSizeMB}MB</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />

        {/* Manual input for image path (fallback) */}
        {!preview && (
          <div className="flex gap-2">
            <Input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder="ou cole o caminho da imagem"
              disabled={disabled}
              className={error ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleClick}
              disabled={disabled || uploading}
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {value && (
        <p className="text-xs text-gray-500 truncate">
          Caminho: {value}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
