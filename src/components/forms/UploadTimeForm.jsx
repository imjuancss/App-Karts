import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '../ui/input';
import { SelectNative } from '../ui/select-native';
import FormSection from '../layout/FormSection';
import { uploadLapProof } from '../../services/api';
import { formatTimeInput, parseTimeToMs } from '../../lib/formatters';

export default function UploadTimeForm({
  tracks = [],
  selectedTrackId,
  onSelectTrack,
  onSubmit,
  isSubmitting = false,
  onCancel
}) {
  // State for time entry modes
  const [timeMode, setTimeMode] = useState('fields'); // 'fields' | 'text'
  const [minutes, setMinutes] = useState('0');
  const [seconds, setSeconds] = useState('');
  const [milliseconds, setMilliseconds] = useState('');
  const [freeText, setFreeText] = useState('');

  const [proofFile, setProofFile] = useState(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');
  const [proofImageUrl, setProofImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  // Calculate milliseconds live
  const calculateMs = () => {
    if (timeMode === 'fields') {
      const min = parseInt(minutes, 10) || 0;
      const sec = parseInt(seconds, 10) || 0;
      let ms = parseInt(milliseconds, 10) || 0;
      // Handle 1 or 2 digit milliseconds (e.g. '5' => 500, '52' => 520)
      if (milliseconds.length === 1) ms = ms * 100;
      else if (milliseconds.length === 2) ms = ms * 10;
      return (min * 60000) + (sec * 1000) + ms;
    } else {
      return parseTimeToMs(freeText);
    }
  };

  const currentMs = calculateMs();
  const formattedPreview = currentMs > 0 ? (
    `${Math.floor(currentMs / 60000).toString().padStart(2, '0')}:${Math.floor((currentMs % 60000) / 1000).toString().padStart(2, '0')}.${(currentMs % 1000).toString().padStart(3, '0')}`
  ) : '00:00.000';

  const handleFileChange = async (file) => {
    if (!file) return;
    setErrorMessage('');
    
    // Create immediate local preview URL
    const localUrl = URL.createObjectURL(file);
    setProofPreviewUrl(localUrl);
    setProofFile(file);

    // Upload file to Supabase Storage
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadLapProof(file);
      setProofImageUrl(publicUrl);
    } catch (err) {
      console.error('Error uploading proof:', err);
      setErrorMessage(err.message || 'Error al subir la imagen del ticket.');
      setProofImageUrl('');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setProofFile(null);
    setProofPreviewUrl('');
    setProofImageUrl('');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const ms = calculateMs();
    if (ms <= 0) {
      setErrorMessage('Ingresa un tiempo válido en segundos o minutos.');
      return;
    }
    if (!selectedTrackId) {
      setErrorMessage('Por favor selecciona un circuito.');
      return;
    }
    if (!proofImageUrl) {
      setErrorMessage('Es obligatorio adjuntar una foto legible del ticket de telemetría.');
      return;
    }

    onSubmit({
      trackId: selectedTrackId,
      lapTimeMs: ms,
      proofImageUrl: proofImageUrl
    });
  };

  const isFormValid = Boolean(
    selectedTrackId &&
    currentMs > 0 &&
    proofImageUrl &&
    !isUploadingImage &&
    !isSubmitting
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {errorMessage && (
        <div className="bg-error/10 border border-error/40 p-3 rounded-sm flex items-start gap-2.5">
          <AlertCircle className="text-error shrink-0 mt-0.5" size={18} />
          <p className="text-error font-label text-xs uppercase tracking-wider leading-relaxed">{errorMessage}</p>
        </div>
      )}

      <FormSection maxWidth="full">
        {/* Circuito */}
        <div className="flex flex-col gap-2">
          <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest flex items-center justify-between">
            <span>CIRCUITO</span>
            <span className="text-primary text-[10px]">* Requerido</span>
          </label>
          <SelectNative
            value={selectedTrackId}
            onChange={(e) => onSelectTrack(e.target.value)}
            required
            className="w-full"
          >
            <option value="" disabled>SELECCIONA UN CIRCUITO...</option>
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.location})
              </option>
            ))}
          </SelectNative>
        </div>

        {/* Tiempo con opción de modo */}
        <div className="flex flex-col gap-3 bg-surface-container-low p-3.5 sm:p-4 rounded-sm border border-outline-variant/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest flex items-center justify-between sm:justify-start gap-2">
              <span>TIEMPO DE VUELTA</span>
              <span className="text-primary text-[10px]">* Requerido</span>
            </label>

            {/* Alternador de Modo */}
            <div className="flex items-center gap-1 bg-surface-container-highest p-1 rounded-sm text-[10px] sm:text-[11px] font-bold uppercase tracking-wider overflow-x-auto scrollbar-hide shrink-0 max-w-full">
              <button
                type="button"
                onClick={() => setTimeMode('fields')}
                className={`px-2 sm:px-2.5 py-1 rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  timeMode === 'fields' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Casillas (Min : Seg . Ms)
              </button>
              <button
                type="button"
                onClick={() => setTimeMode('text')}
                className={`px-2 sm:px-2.5 py-1 rounded-sm transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  timeMode === 'text' ? 'bg-primary text-black font-bold' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                Texto Libre
              </button>
            </div>
          </div>

          {timeMode === 'fields' ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3 items-center">
                {/* Minutos */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider truncate">MINUTOS</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    max="10"
                    placeholder="0"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className="text-center font-mono font-bold text-base sm:text-xl text-white py-2 px-1"
                  />
                </div>

                {/* Segundos */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider truncate">SEGUNDOS (0-59)</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    max="59"
                    placeholder="44"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    autoFocus
                    required
                    className="text-center font-mono font-bold text-base sm:text-xl text-tertiary-fixed py-2 px-1"
                  />
                </div>

                {/* Milésimas */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider truncate">MILÉSIMAS (.SSS)</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    min="0"
                    max="999"
                    placeholder="520"
                    value={milliseconds}
                    onChange={(e) => setMilliseconds(e.target.value.slice(0, 3))}
                    className="text-center font-mono font-bold text-base sm:text-xl text-tertiary-fixed py-2 px-1"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Input
                type="text"
                placeholder="Ej. 44.520 o 0:44.52 o 44.5"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                required
                className="w-full text-tertiary-fixed font-mono font-bold tracking-widest text-base sm:text-xl placeholder:text-outline-variant/40 placeholder:font-sans placeholder:text-xs sm:placeholder:text-sm"
              />
            </div>
          )}

          {/* Previsualización en Tiempo Real */}
          <div className="flex items-center justify-between border-t border-outline-variant/15 pt-2.5 mt-1">
            <span className="text-[11px] sm:text-xs text-on-surface-variant font-label uppercase tracking-wider">
              TIEMPO A REGISTRAR:
            </span>
            <span className="font-mono font-bold text-base sm:text-lg text-tertiary-fixed tracking-widest">
              {formattedPreview}
            </span>
          </div>
        </div>

        {/* Subida de Comprobante / Ticket */}
        <div className="flex flex-col gap-2">
          <label className="text-on-surface-variant font-label text-xs uppercase tracking-widest flex items-center justify-between">
            <span>FOTO DEL TICKET DE TELEMETRÍA</span>
            <span className="text-primary text-[10px]">* Obligatorio para Peer Review</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />

          {!proofPreviewUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-outline-variant/40 hover:border-primary/60 bg-surface-container-low/60 hover:bg-surface-container-low p-6 rounded-sm text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-bold text-white uppercase tracking-wider">
                  Toma o sube la foto del ticket
                </p>
                <p className="text-xs text-on-surface-variant">
                  Haz clic para abrir cámara / buscar o arrastra la foto aquí (JPG, PNG, WebP)
                </p>
              </div>
            </div>
          ) : (
            <div className="relative border border-outline-variant/30 rounded-sm bg-surface-container-low p-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-32 h-32 rounded-sm overflow-hidden bg-black shrink-0 border border-outline-variant/20">
                <img
                  src={proofPreviewUrl}
                  alt="Vista previa del ticket"
                  className="w-full h-full object-cover"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
                    <Loader2 className="animate-spin text-primary" size={22} />
                    <span className="text-[10px] uppercase font-bold text-white tracking-widest text-center">Subiendo...</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1 w-full">
                <div className="flex items-center gap-2">
                  {proofImageUrl ? (
                    <>
                      <CheckCircle2 size={16} className="text-tertiary-fixed shrink-0" />
                      <span className="text-xs font-bold text-tertiary-fixed uppercase tracking-wider">
                        Comprobante listo para revisión
                      </span>
                    </>
                  ) : (
                    <>
                      <Loader2 size={16} className="animate-spin text-primary shrink-0" />
                      <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                        Subiendo imagen al servidor...
                      </span>
                    </>
                  )}
                </div>

                {proofFile && (
                  <p className="text-xs text-on-surface-variant truncate">
                    {proofFile.name} ({(proofFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}

                <div className="flex items-center gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage || isSubmitting}
                    className="text-xs font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                  >
                    <Upload size={13} />
                    Cambiar foto
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage || isSubmitting}
                    className="text-xs font-bold uppercase tracking-wider text-error hover:underline flex items-center gap-1 ml-auto"
                  >
                    <Trash2 size={13} />
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </FormSection>

      {/* Botones de acción */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 sm:gap-3 pt-2 w-full">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || isUploadingImage}
            className="w-full sm:w-auto px-5 py-3 sm:py-2.5 font-headline font-bold uppercase tracking-widest text-xs text-on-surface hover:bg-surface-variant transition-colors rounded-sm cursor-pointer disabled:opacity-50 whitespace-nowrap shrink-0 flex items-center justify-center"
          >
            CANCELAR
          </button>
        )}

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full sm:w-auto px-6 py-3 sm:py-2.5 font-headline font-bold uppercase tracking-widest text-xs rounded-sm transition-all duration-200 flex items-center justify-center gap-2 min-w-0 sm:min-w-[150px] whitespace-nowrap shrink-0 ${
            isFormValid
              ? 'bg-primary text-on-primary hover:opacity-90 active:scale-95 shadow-[0_0_15px_rgba(255,49,0,0.4)] cursor-pointer'
              : 'bg-surface-container-highest text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/20'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              <span>REGISTRANDO...</span>
            </>
          ) : (
            <span>SUBIR TIEMPO</span>
          )}
        </button>
      </div>
    </form>
  );
}
