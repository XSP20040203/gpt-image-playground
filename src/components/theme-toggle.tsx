'use client';

import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

const themeOrder = ['system', 'light', 'dark'] as const;

type ThemeChoice = (typeof themeOrder)[number];

function getNextTheme(theme: string | undefined): ThemeChoice {
    const currentIndex = themeOrder.findIndex((item) => item === theme);
    return themeOrder[(currentIndex + 1) % themeOrder.length];
}

export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const activeTheme = mounted ? theme || 'system' : 'system';
    const iconTheme = activeTheme === 'system' ? resolvedTheme : activeTheme;
    const label = activeTheme === 'system' ? '跟随系统' : activeTheme === 'light' ? '浅色' : '深色';
    const Icon = activeTheme === 'system' ? Monitor : iconTheme === 'light' ? Sun : Moon;

    return (
        <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={() => setTheme(getNextTheme(activeTheme))}
            className='gap-2 border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'
            aria-label={`主题：${label}`}>
            <Icon className='h-4 w-4' />
            {label}
        </Button>
    );
}
