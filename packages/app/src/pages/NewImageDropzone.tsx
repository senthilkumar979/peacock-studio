import { useRef, useState } from 'react';
import { Button } from '@/components/ui';
import { STEP_IMAGE_ACCEPT } from '@/constants/stepImageUpload';
import { readStepImageDataUrl } from '@/utils/stepImageFile';

interface NewImageDropzoneProps {
  onLoaded: (dataUrl: string) => void;
}

export const NewImageDropzone = ({ onLoaded }: NewImageDropzoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setIsReading(true);
    void readStepImageDataUrl(file)
      .then(onLoaded)
      .catch((loadError: unknown) => {
        setError(loadError instanceof Error ? loadError.message : 'Could not read that image.');
      })
      .finally(() => setIsReading(false));
  };

  return (
    <div
      className={`mx-auto flex w-full max-w-xl flex-col items-center gap-4 rounded-2xl border border-dashed bg-white px-6 py-12 text-center shadow-sm ${
        isDragging ? 'border-peacock-400 bg-peacock-50/40' : 'border-slate-300'
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        handleFile(event.dataTransfer.files[0]);
      }}
    >
      <p className="text-base font-semibold text-slate-900">Upload an image to edit</p>
      <p className="text-sm text-slate-500">
        JPEG, PNG, or SVG. The file stays in this tab only — refresh to start over.
      </p>
      <Button onClick={() => inputRef.current?.click()} disabled={isReading}>
        {isReading ? 'Reading…' : 'Choose image'}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={STEP_IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
};
