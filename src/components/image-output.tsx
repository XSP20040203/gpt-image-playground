'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { downloadImageBatch, downloadImageFile } from '@/lib/image-download';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Download, Expand, Grid, Loader2, Send } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

type ImageInfo = {
    path: string;
    filename: string;
};

type ImageOutputProps = {
    imageBatch: ImageInfo[] | null;
    viewMode: 'grid' | number;
    onViewChange: (view: 'grid' | number) => void;
    altText?: string;
    isLoading: boolean;
    onSendToEdit: (filename: string) => void;
    currentMode: 'generate' | 'edit';
    baseImagePreviewUrl: string | null;
    streamingPreviewImages?: Map<number, string>;
};

const getGridColsClass = (count: number): string => {
    if (count <= 1) return 'grid-cols-1';
    if (count <= 4) return 'grid-cols-2';
    if (count <= 9) return 'grid-cols-3';
    return 'grid-cols-3';
};

export function ImageOutput({
    imageBatch,
    viewMode,
    onViewChange,
    altText = 'Generated image output',
    isLoading,
    onSendToEdit,
    currentMode,
    baseImagePreviewUrl,
    streamingPreviewImages
}: ImageOutputProps) {
    const { language } = useI18n();
    const [progress, setProgress] = React.useState(0);
    const [previewIndex, setPreviewIndex] = React.useState<number | null>(null);

    React.useEffect(() => {
        if (!isLoading) {
            setProgress(0);
            return;
        }

        setProgress(8);
        const startedAt = Date.now();
        const timer = window.setInterval(() => {
            const elapsed = Date.now() - startedAt;
            const next = Math.min(94, 8 + Math.round((1 - Math.exp(-elapsed / 9000)) * 86));
            setProgress(next);
        }, 400);

        return () => window.clearInterval(timer);
    }, [isLoading]);

    const handleSendClick = () => {
        // Send to edit only works when a single image is selected
        if (typeof viewMode === 'number' && imageBatch && imageBatch[viewMode]) {
            onSendToEdit(imageBatch[viewMode].filename);
        }
    };

    const handleDownloadClick = () => {
        if (!imageBatch || imageBatch.length === 0) return;

        if (typeof viewMode === 'number' && imageBatch[viewMode]) {
            downloadImageFile(imageBatch[viewMode]);
            return;
        }

        downloadImageBatch(imageBatch);
    };

    const openPreview = (index: number) => {
        if (!imageBatch?.[index]) return;

        setPreviewIndex(index);
    };

    const closePreview = () => {
        setPreviewIndex(null);
    };

    const previewImage = previewIndex !== null ? imageBatch?.[previewIndex] : null;

    const showCarousel = imageBatch && imageBatch.length > 1;
    const isSingleImageView = typeof viewMode === 'number';
    const canSendToEdit = !isLoading && isSingleImageView && imageBatch && imageBatch[viewMode];
    const canDownload = !isLoading && imageBatch && imageBatch.length > 0;
    const downloadLabel =
        language === 'zh'
            ? showCarousel && viewMode === 'grid'
                ? '下载全部'
                : '下载图片'
            : showCarousel && viewMode === 'grid'
              ? 'Download All'
              : 'Download';
    const loadingText = currentMode === 'edit' ? 'Editing image...' : 'Generating image...';

    const progressBar = isLoading ? (
        <div className='absolute right-4 bottom-4 left-4 z-20 rounded-md border border-white/10 bg-black/70 p-3 backdrop-blur-sm'>
            <div className='mb-2 flex items-center justify-between text-xs text-white/70'>
                <span>{loadingText}</span>
                <span>{progress}%</span>
            </div>
            <div className='h-2 overflow-hidden rounded-full bg-white/10'>
                <div
                    className='h-full rounded-full bg-white transition-all duration-500 ease-out'
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    ) : null;

    return (
        <div className='flex h-full min-h-[300px] w-full flex-col items-center justify-between gap-4 overflow-hidden rounded-lg border border-white/20 bg-black p-4'>
            <div className='relative flex h-full w-full flex-grow items-center justify-center overflow-hidden'>
                {progressBar}
                {isLoading ? (
                    streamingPreviewImages && streamingPreviewImages.size > 0 ? (
                        // Show streaming preview images - single image centered like final view
                        <div className='relative flex h-full w-full items-center justify-center'>
                            {/* Show the latest preview image (highest index) */}
                            {(() => {
                                const entries = Array.from(streamingPreviewImages.entries());
                                const latestEntry = entries[entries.length - 1];
                                if (!latestEntry) return null;
                                const [, dataUrl] = latestEntry;
                                return (
                                    <Image
                                        src={dataUrl}
                                        alt='Streaming preview'
                                        width={512}
                                        height={512}
                                        className='max-h-full max-w-full object-contain'
                                        unoptimized
                                    />
                                );
                            })()}
                            {/* Overlay loader at bottom center */}
                            <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-white/80'>
                                <Loader2 className='h-4 w-4 animate-spin' />
                                <p className='text-sm'>Streaming...</p>
                            </div>
                        </div>
                    ) : currentMode === 'edit' && baseImagePreviewUrl ? (
                        <div className='relative flex h-full w-full items-center justify-center'>
                            <Image
                                src={baseImagePreviewUrl}
                                alt='Base image for editing'
                                fill
                                style={{ objectFit: 'contain' }}
                                className='blur-md filter'
                                unoptimized
                            />
                            <div className='absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white/80'>
                                <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                                <p>Editing image...</p>
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center justify-center text-white/60'>
                            <Loader2 className='mb-2 h-8 w-8 animate-spin' />
                            <p>Generating image...</p>
                        </div>
                    )
                ) : imageBatch && imageBatch.length > 0 ? (
                    viewMode === 'grid' ? (
                        <div
                            className={`grid ${getGridColsClass(imageBatch.length)} max-h-full w-full max-w-full gap-1 p-1`}>
                            {imageBatch.map((img, index) => (
                                <button
                                    type='button'
                                    key={img.filename}
                                    onClick={() => {
                                        onViewChange(index);
                                        openPreview(index);
                                    }}
                                    className='group relative aspect-square overflow-hidden rounded border border-white/10 bg-black focus:ring-2 focus:ring-white focus:outline-none'
                                    aria-label={`放大预览图片 ${index + 1}`}>
                                    <Image
                                        src={img.path}
                                        alt={`Generated image ${index + 1}`}
                                        fill
                                        style={{ objectFit: 'contain' }}
                                        sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                                        unoptimized
                                    />
                                    <span className='absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100'>
                                        <Expand className='h-3.5 w-3.5' />
                                        预览
                                    </span>
                                </button>
                            ))}
                        </div>
                    ) : imageBatch[viewMode] ? (
                        <button
                            type='button'
                            onClick={() => openPreview(viewMode)}
                            className='group relative flex h-full w-full items-center justify-center rounded-md focus:ring-2 focus:ring-white focus:outline-none'
                            aria-label='放大预览图片'>
                            <Image
                                src={imageBatch[viewMode].path}
                                alt={altText}
                                width={512}
                                height={512}
                                className='max-h-full max-w-full object-contain'
                                unoptimized
                            />
                            <span className='absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1.5 text-xs text-white/80 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100'>
                                <Expand className='h-3.5 w-3.5' />
                                点击放大
                            </span>
                        </button>
                    ) : (
                        <div className='text-center text-white/40'>
                            <p>Error displaying image.</p>
                        </div>
                    )
                ) : (
                    <div className='text-center text-white/40'>
                        <p>Your generated image will appear here.</p>
                    </div>
                )}
            </div>

            <div className='flex min-h-10 w-full shrink-0 flex-wrap items-center justify-center gap-2'>
                {showCarousel && (
                    <div className='flex max-w-full items-center gap-1.5 overflow-x-auto rounded-md border border-white/10 bg-neutral-800/50 p-1'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className={cn(
                                'h-8 w-8 rounded p-1',
                                viewMode === 'grid'
                                    ? 'bg-white/20 text-white'
                                    : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                            )}
                            onClick={() => onViewChange('grid')}
                            aria-label='Show grid view'>
                            <Grid className='h-4 w-4' />
                        </Button>
                        {imageBatch.map((img, index) => (
                            <Button
                                key={img.filename}
                                variant='ghost'
                                size='icon'
                                className={cn(
                                    'h-8 w-8 overflow-hidden rounded p-0.5',
                                    viewMode === index
                                        ? 'ring-2 ring-white ring-offset-1 ring-offset-black'
                                        : 'opacity-60 hover:opacity-100'
                                )}
                                onClick={() => onViewChange(index)}
                                aria-label={`Select image ${index + 1}`}>
                                <Image
                                    src={img.path}
                                    alt={`Thumbnail ${index + 1}`}
                                    width={28}
                                    height={28}
                                    className='h-full w-full object-cover'
                                    unoptimized
                                />
                            </Button>
                        ))}
                    </div>
                )}

                <Button
                    variant='outline'
                    size='sm'
                    onClick={handleDownloadClick}
                    disabled={!canDownload}
                    className='shrink-0 border-white/20 text-white/80 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50'>
                    <Download className='mr-2 h-4 w-4' />
                    {downloadLabel}
                </Button>

                <Button
                    variant='outline'
                    size='sm'
                    onClick={handleSendClick}
                    disabled={!canSendToEdit}
                    className={cn(
                        'shrink-0 border-white/20 text-white/80 hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-50',
                        // Hide button completely if grid view is active and there are multiple images
                        showCarousel && viewMode === 'grid' ? 'invisible' : 'visible'
                    )}>
                    <Send className='mr-2 h-4 w-4' />
                    Send to Edit
                </Button>
            </div>
            <Dialog open={Boolean(previewImage)} onOpenChange={(open) => !open && closePreview()}>
                <DialogContent className='max-h-[92vh] max-w-[92vw] gap-3 border-white/20 bg-black p-4 text-white sm:max-w-[92vw]'>
                    <DialogTitle className='pr-8 text-sm font-medium text-white'>
                        {previewImage?.filename || '图片预览'}
                    </DialogTitle>
                    {previewImage && (
                        <div className='flex min-h-[60vh] items-center justify-center overflow-hidden rounded-md bg-black'>
                            <Image
                                src={previewImage.path}
                                alt={previewImage.filename}
                                width={1600}
                                height={1600}
                                className='max-h-[76vh] max-w-full object-contain'
                                unoptimized
                            />
                        </div>
                    )}
                    <div className='flex flex-wrap justify-end gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => previewImage && downloadImageFile(previewImage)}
                            disabled={!previewImage}
                            className='border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                            <Download className='mr-2 h-4 w-4' />
                            下载图片
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => previewImage && onSendToEdit(previewImage.filename)}
                            disabled={!previewImage || isLoading}
                            className='border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                            <Send className='mr-2 h-4 w-4' />
                            发送到编辑
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
