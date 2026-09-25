import { useRef } from 'react';

interface PhotoUploadProps {
  photo: string;
  onPhotoChange: (dataUrl: string) => void;
  showToast: (message: string) => void;
}

export function PhotoUpload({ photo, onPhotoChange, showToast }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return showToast('Please choose a JPG, PNG or WebP image.');
    if (file.size > 5 * 1024 * 1024) return showToast('Photo must be under 5 MB.');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const size = Math.min(240, side);
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas.getContext('2d')?.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      onPhotoChange(canvas.toDataURL('image/jpeg', 0.85));
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      showToast('Could not read that image.');
    };
    img.src = url;
  }

  return (
    <div className="photo-upload">
      <div className="photo-upload-preview" aria-hidden={!photo}>
        {photo ? <img src={photo} alt="Your photo" /> : <span className="photo-upload-placeholder">Photo</span>}
      </div>
      <div className="photo-upload-actions">
        <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()}>
          Upload photo
        </button>
        {photo && (
          <button type="button" className="btn-text-danger" onClick={() => onPhotoChange('')}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        id="photo"
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Upload photo"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
