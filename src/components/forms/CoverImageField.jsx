import { useRef, useState } from 'react';
import { ImagePlus, Link2, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Input } from '../ui/input';
import { FilterGroup, FilterItem } from '../ui/filter-group';
import FormField from './FormField';

export default function CoverImageField({
  id = 'cover-upload',
  label = 'Foto de portada',
  hint = 'Se mostrará en el home y en el listado de pistas.',
  value = '',
  onChange,
  onFileSelect,
  isUploading = false,
  disabled = false,
  className,
}) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState('upload');

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    onChange?.('');
  };

  return (
    <FormField label={label} hint={hint} className={className}>
      <FilterGroup value={mode} onValueChange={handleModeChange} className="w-full flex">
        <FilterItem value="link" className="flex-1 min-w-0 text-[10px] sm:text-xs gap-1.5">
          <Link2 size={14} aria-hidden="true" />
          Link
        </FilterItem>
        <FilterItem value="upload" className="flex-1 min-w-0 text-[10px] sm:text-xs gap-1.5">
          <ImagePlus size={14} aria-hidden="true" />
          Subir foto
        </FilterItem>
      </FilterGroup>

      {mode === 'link' ? (
        <Input
          type="url"
          placeholder="https://ejemplo.com/imagen.jpg"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={disabled || isUploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileSelect?.(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex items-center justify-center gap-2 w-full min-h-12 px-4 py-3 rounded-sm',
              'bg-surface-container hover:bg-surface-container-high text-on-surface',
              'font-label text-xs uppercase tracking-wider transition-colors disabled:opacity-50'
            )}
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <ImagePlus size={18} aria-hidden="true" />
            )}
            {isUploading ? 'Subiendo...' : value ? 'Cambiar foto' : 'Seleccionar archivo'}
          </button>
          {value && !isUploading && (
            <p className="text-tertiary-fixed font-label text-xs uppercase tracking-wider">
              Foto cargada correctamente
            </p>
          )}
          <p className="text-on-surface-variant/60 font-body text-xs">
            JPG, PNG o WebP. Máx. 5 MB.
          </p>
        </div>
      )}
    </FormField>
  );
}
