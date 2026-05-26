'use client';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { ImagePlus, SlidersHorizontal } from 'lucide-react';

type ModeToggleProps = {
    currentMode: 'generate' | 'edit';
    onModeChange: (mode: 'generate' | 'edit') => void;
};

export function ModeToggle({ currentMode, onModeChange }: ModeToggleProps) {
    const { t } = useI18n();
    const isGenerate = currentMode === 'generate';

    return (
        <div
            className='relative grid h-11 w-[184px] grid-cols-2 overflow-hidden rounded-full border border-white/15 bg-white/5 p-1 shadow-inner'
            role='tablist'
            aria-label='Image mode'>
            <span
                className={`pointer-events-none absolute left-1 top-1 h-[34px] w-[87px] rounded-full bg-white shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isGenerate ? 'translate-x-0' : 'translate-x-[87px]'
                }`}
            />
            <Button
                type='button'
                variant='ghost'
                size='sm'
                role='tab'
                aria-selected={isGenerate}
                onClick={() => onModeChange('generate')}
                className={`relative z-10 h-full min-w-0 rounded-full px-1.5 text-sm transition-[color,transform,opacity] duration-300 hover:bg-transparent ${
                    isGenerate ? 'text-black' : 'text-white/65 hover:text-white'
                }`}>
                <ImagePlus className={`h-4 w-4 transition-transform duration-300 ${isGenerate ? 'scale-110' : 'scale-95'}`} />
                <span className='transition-opacity duration-300'>{t('mode.generate')}</span>
            </Button>
            <Button
                type='button'
                variant='ghost'
                size='sm'
                role='tab'
                aria-selected={!isGenerate}
                onClick={() => onModeChange('edit')}
                className={`relative z-10 h-full min-w-0 rounded-full px-1.5 text-sm transition-[color,transform,opacity] duration-300 hover:bg-transparent ${
                    !isGenerate ? 'text-black' : 'text-white/65 hover:text-white'
                }`}>
                <SlidersHorizontal className={`h-4 w-4 transition-transform duration-300 ${!isGenerate ? 'scale-110' : 'scale-95'}`} />
                <span className='transition-opacity duration-300'>{t('mode.edit')}</span>
            </Button>
        </div>
    );
}
