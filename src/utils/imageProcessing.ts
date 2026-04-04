interface ProcessImageOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  fileName: string;
}

interface ProcessedImageResult {
  file: File;
  width: number;
  height: number;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    image.src = objectUrl;
  });
}

function getScaledSize(width: number, height: number, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
}

export async function processImageFile(file: File, options: ProcessImageOptions): Promise<ProcessedImageResult> {
  const image = await loadImage(file);
  const { width, height } = getScaledSize(image.naturalWidth, image.naturalHeight, options.maxWidth, options.maxHeight);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas rendering is unavailable in this browser.');
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (nextBlob) => {
        if (!nextBlob) {
          reject(new Error(`Failed to encode image: ${file.name}`));
          return;
        }

        resolve(nextBlob);
      },
      'image/webp',
      options.quality
    );
  });

  return {
    file: new File([blob], options.fileName, {
      type: 'image/webp',
      lastModified: Date.now()
    }),
    width,
    height
  };
}

export async function createListingImageVariants(file: File) {
  const [display, thumb] = await Promise.all([
    processImageFile(file, {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.82,
      fileName: 'display.webp'
    }),
    processImageFile(file, {
      maxWidth: 480,
      maxHeight: 480,
      quality: 0.72,
      fileName: 'thumb.webp'
    })
  ]);

  return {
    displayFile: display.file,
    thumbFile: thumb.file
  };
}

export async function createChatAttachment(file: File) {
  const [display, thumb] = await Promise.all([
    processImageFile(file, {
      maxWidth: 1280,
      maxHeight: 1280,
      quality: 0.78,
      fileName: 'attachment.webp'
    }),
    processImageFile(file, {
      maxWidth: 360,
      maxHeight: 360,
      quality: 0.68,
      fileName: 'attachment-thumb.webp'
    })
  ]);

  return {
    displayFile: display.file,
    thumbFile: thumb.file
  };
}
