import { create } from 'zustand';

interface LightboxState {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  caption: string;
  openLightbox: (images: string[], index?: number, caption?: string) => void;
  closeLightbox: () => void;
  nextImage: () => void;
  prevImage: () => void;
}

export const useImageLightbox = create<LightboxState>((set, get) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,
  caption: '',
  openLightbox: (images, index = 0, caption = '') =>
    set({ isOpen: true, images, currentIndex: index, caption }),
  closeLightbox: () => set({ isOpen: false }),
  nextImage: () => {
    const { currentIndex, images } = get();
    set({ currentIndex: (currentIndex + 1) % images.length });
  },
  prevImage: () => {
    const { currentIndex, images } = get();
    set({ currentIndex: (currentIndex - 1 + images.length) % images.length });
  },
}));

export function ImageLightbox() {
  const { isOpen, images, currentIndex, caption, closeLightbox, nextImage, prevImage } =
    useImageLightbox();

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  };

  return (
    <div
      className="lightbox-backdrop"
      onClick={closeLightbox}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={closeLightbox}
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10 p-2"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-4 text-white/70 text-sm z-10">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prevImage(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-10"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <img
        src={currentImage}
        alt={caption}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); nextImage(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-10"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Caption */}
      {caption && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-lg">
          {caption}
        </div>
      )}
    </div>
  );
}
