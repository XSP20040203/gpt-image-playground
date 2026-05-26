'use client';

export type DownloadableImage = {
    path: string;
    filename: string;
};

export function getImageDownloadHref(image: DownloadableImage) {
    if (image.path.startsWith('/api/image/')) {
        const separator = image.path.includes('?') ? '&' : '?';
        return `${image.path}${separator}download=1`;
    }

    return image.path;
}

export function downloadImageFile(image: DownloadableImage) {
    const link = document.createElement('a');
    link.href = getImageDownloadHref(image);
    link.download = image.filename || 'generated-image.png';
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function downloadImageBatch(images: DownloadableImage[]) {
    images.forEach((image) => downloadImageFile(image));
}
