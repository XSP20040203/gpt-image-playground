'use client';

import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
    const { language, setLanguage, t } = useI18n();

    const nextLanguage = language === 'zh' ? 'en' : 'zh';

    return (
        <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setLanguage(nextLanguage)}
            className='gap-2 border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'
            aria-label={t('app.language')}>
            <Languages className='h-4 w-4' />
            {language === 'zh' ? t('app.chinese') : t('app.english')}
        </Button>
    );
}

