'use client';

import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useI18n } from '@/lib/i18n';
import { getPresetTooltip, validateGptImage2Size } from '@/lib/size-utils';
import {
    Square,
    RectangleHorizontal,
    RectangleVertical,
    Sparkles,
    Eraser,
    ShieldCheck,
    ShieldAlert,
    FileImage,
    Tally1,
    Tally2,
    Tally3,
    Loader2,
    BrickWall,
    Lock,
    LockOpen,
    HelpCircle,
    SquareDashed,
    Shuffle
} from 'lucide-react';
import * as React from 'react';

import type { GptImageModel } from '@/lib/cost-utils';
import type { SizePreset } from '@/lib/size-utils';

export type PromptStylePreset =
    | 'none'
    | 'photorealistic'
    | 'cinematic'
    | 'product'
    | 'anime'
    | 'editorial'
    | 'architectural'
    | 'icon'
    | 'watercolor'
    | 'cyberpunk';
export type PromptComposition =
    | 'auto'
    | 'close_up'
    | 'medium_shot'
    | 'wide_shot'
    | 'rule_of_thirds'
    | 'centered'
    | 'symmetrical'
    | 'top_down';
export type PromptCameraAngle =
    | 'auto'
    | 'eye_level'
    | 'low_angle'
    | 'high_angle'
    | 'macro'
    | 'wide_angle'
    | 'telephoto'
    | 'isometric';
export type PromptLighting =
    | 'auto'
    | 'soft'
    | 'cinematic'
    | 'studio'
    | 'natural'
    | 'neon'
    | 'backlight'
    | 'golden_hour'
    | 'dramatic';
export type PromptColorTone =
    | 'auto'
    | 'neutral'
    | 'warm'
    | 'cool'
    | 'monochrome'
    | 'pastel'
    | 'vibrant'
    | 'moody'
    | 'high_contrast';

export type GenerationFormData = {
    prompt: string;
    n: number;
    size: SizePreset;
    customWidth: number;
    customHeight: number;
    quality: 'low' | 'medium' | 'high' | 'auto';
    output_format: 'png' | 'jpeg' | 'webp';
    output_compression?: number;
    background: 'transparent' | 'opaque' | 'auto';
    moderation: 'low' | 'auto';
    model: GptImageModel;
    promptEnhancement: boolean;
    negativePrompt: string;
    stylePreset: PromptStylePreset;
    composition: PromptComposition;
    cameraAngle: PromptCameraAngle;
    lighting: PromptLighting;
    colorTone: PromptColorTone;
    detailLevel: number;
    enableCompatibilityParams: boolean;
    seed?: number;
    steps: number;
    guidanceScale: number;
    sampler: string;
    scheduler: string;
};

type GenerationFormProps = {
    onSubmit: (data: GenerationFormData) => void;
    isLoading: boolean;
    currentMode: 'generate' | 'edit';
    onModeChange: (mode: 'generate' | 'edit') => void;
    isPasswordRequiredByBackend: boolean | null;
    clientPasswordHash: string | null;
    onOpenPasswordDialog: () => void;
    model: GenerationFormData['model'];
    setModel: React.Dispatch<React.SetStateAction<GenerationFormData['model']>>;
    prompt: string;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    n: number[];
    setN: React.Dispatch<React.SetStateAction<number[]>>;
    size: GenerationFormData['size'];
    setSize: React.Dispatch<React.SetStateAction<GenerationFormData['size']>>;
    customWidth: number;
    setCustomWidth: React.Dispatch<React.SetStateAction<number>>;
    customHeight: number;
    setCustomHeight: React.Dispatch<React.SetStateAction<number>>;
    quality: GenerationFormData['quality'];
    setQuality: React.Dispatch<React.SetStateAction<GenerationFormData['quality']>>;
    outputFormat: GenerationFormData['output_format'];
    setOutputFormat: React.Dispatch<React.SetStateAction<GenerationFormData['output_format']>>;
    compression: number[];
    setCompression: React.Dispatch<React.SetStateAction<number[]>>;
    background: GenerationFormData['background'];
    setBackground: React.Dispatch<React.SetStateAction<GenerationFormData['background']>>;
    moderation: GenerationFormData['moderation'];
    setModeration: React.Dispatch<React.SetStateAction<GenerationFormData['moderation']>>;
    enableStreaming: boolean;
    setEnableStreaming: React.Dispatch<React.SetStateAction<boolean>>;
    partialImages: 1 | 2 | 3;
    setPartialImages: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;
    allowEmptyPrompt?: boolean;
    promptEnhancement: boolean;
    setPromptEnhancement: React.Dispatch<React.SetStateAction<boolean>>;
    negativePrompt: string;
    setNegativePrompt: React.Dispatch<React.SetStateAction<string>>;
    stylePreset: PromptStylePreset;
    setStylePreset: React.Dispatch<React.SetStateAction<PromptStylePreset>>;
    composition: PromptComposition;
    setComposition: React.Dispatch<React.SetStateAction<PromptComposition>>;
    cameraAngle: PromptCameraAngle;
    setCameraAngle: React.Dispatch<React.SetStateAction<PromptCameraAngle>>;
    lighting: PromptLighting;
    setLighting: React.Dispatch<React.SetStateAction<PromptLighting>>;
    colorTone: PromptColorTone;
    setColorTone: React.Dispatch<React.SetStateAction<PromptColorTone>>;
    detailLevel: number[];
    setDetailLevel: React.Dispatch<React.SetStateAction<number[]>>;
    enableCompatibilityParams: boolean;
    setEnableCompatibilityParams: React.Dispatch<React.SetStateAction<boolean>>;
    seed: string;
    setSeed: React.Dispatch<React.SetStateAction<string>>;
    steps: number[];
    setSteps: React.Dispatch<React.SetStateAction<number[]>>;
    guidanceScale: number[];
    setGuidanceScale: React.Dispatch<React.SetStateAction<number[]>>;
    sampler: string;
    setSampler: React.Dispatch<React.SetStateAction<string>>;
    scheduler: string;
    setScheduler: React.Dispatch<React.SetStateAction<string>>;
};

const RadioItemWithIcon = ({
    value,
    id,
    label,
    Icon
}: {
    value: string;
    id: string;
    label: string;
    Icon: React.ElementType;
}) => (
    <div className='flex items-center space-x-2'>
        <RadioGroupItem
            value={value}
            id={id}
            className='border-white/40 text-white data-[state=checked]:border-white data-[state=checked]:text-white'
        />
        <Label htmlFor={id} className='flex cursor-pointer items-center gap-2 text-base text-white/80'>
            <Icon className='h-5 w-5 text-white/60' />
            {label}
        </Label>
    </div>
);

const styleOptions: Array<{ value: PromptStylePreset; label: string }> = [
    { value: 'none', label: '不指定' },
    { value: 'photorealistic', label: '写实摄影' },
    { value: 'cinematic', label: '电影感' },
    { value: 'product', label: '产品摄影' },
    { value: 'anime', label: '动漫插画' },
    { value: 'editorial', label: '高级杂志' },
    { value: 'architectural', label: '建筑空间' },
    { value: 'icon', label: '图标 / App 视觉' },
    { value: 'watercolor', label: '水彩' },
    { value: 'cyberpunk', label: '赛博朋克' }
];

const compositionOptions: Array<{ value: PromptComposition; label: string }> = [
    { value: 'auto', label: '自动' },
    { value: 'close_up', label: '特写' },
    { value: 'medium_shot', label: '中景' },
    { value: 'wide_shot', label: '广角全景' },
    { value: 'rule_of_thirds', label: '三分法' },
    { value: 'centered', label: '居中主体' },
    { value: 'symmetrical', label: '对称构图' },
    { value: 'top_down', label: '俯视构图' }
];

const cameraOptions: Array<{ value: PromptCameraAngle; label: string }> = [
    { value: 'auto', label: '自动' },
    { value: 'eye_level', label: '平视' },
    { value: 'low_angle', label: '低机位' },
    { value: 'high_angle', label: '高机位' },
    { value: 'macro', label: '微距' },
    { value: 'wide_angle', label: '广角镜头' },
    { value: 'telephoto', label: '长焦压缩' },
    { value: 'isometric', label: '等距视角' }
];

const lightingOptions: Array<{ value: PromptLighting; label: string }> = [
    { value: 'auto', label: '自动' },
    { value: 'soft', label: '柔和光' },
    { value: 'cinematic', label: '电影布光' },
    { value: 'studio', label: '棚拍灯光' },
    { value: 'natural', label: '自然光' },
    { value: 'neon', label: '霓虹光' },
    { value: 'backlight', label: '逆光' },
    { value: 'golden_hour', label: '黄金时刻' },
    { value: 'dramatic', label: '强戏剧光' }
];

const colorToneOptions: Array<{ value: PromptColorTone; label: string }> = [
    { value: 'auto', label: '自动' },
    { value: 'neutral', label: '自然中性' },
    { value: 'warm', label: '暖色' },
    { value: 'cool', label: '冷色' },
    { value: 'monochrome', label: '单色' },
    { value: 'pastel', label: '粉彩' },
    { value: 'vibrant', label: '高饱和' },
    { value: 'moody', label: '暗调情绪' },
    { value: 'high_contrast', label: '高对比' }
];

const samplerOptions = ['auto', 'euler', 'euler_a', 'dpmpp_2m', 'dpmpp_sde', 'ddim', 'uni_pc'] as const;
const schedulerOptions = ['auto', 'normal', 'karras', 'exponential', 'sgm_uniform', 'simple'] as const;

function getStylePreviewClass(value: PromptStylePreset) {
    const classes: Record<PromptStylePreset, string> = {
        none: 'bg-[linear-gradient(135deg,#1f2937,#0f172a)]',
        photorealistic: 'bg-[linear-gradient(135deg,#4b5563,#111827)]',
        cinematic: 'bg-[linear-gradient(135deg,#111827_0%,#78350f_45%,#020617_100%)]',
        product: 'bg-[radial-gradient(circle_at_50%_30%,#f8fafc_0%,#cbd5e1_30%,#0f172a_85%)]',
        anime: 'bg-[linear-gradient(135deg,#fb7185,#60a5fa)]',
        editorial: 'bg-[linear-gradient(135deg,#f5f5f4,#57534e_45%,#111827)]',
        architectural: 'bg-[linear-gradient(90deg,#0f172a_0_20%,#475569_20%_24%,#1e293b_24%_60%,#94a3b8_60%_64%,#0f172a_64%)]',
        icon: 'bg-[radial-gradient(circle,#22d3ee_0_28%,#0f172a_29%_100%)]',
        watercolor: 'bg-[radial-gradient(circle_at_35%_35%,#bae6fd,#fbcfe8_45%,#fef3c7_70%)]',
        cyberpunk: 'bg-[linear-gradient(135deg,#020617,#7c3aed_45%,#06b6d4)]'
    };
    return classes[value];
}

function getColorPreviewClass(value: PromptColorTone) {
    const classes: Record<PromptColorTone, string> = {
        auto: 'bg-[linear-gradient(135deg,#334155,#64748b,#0f172a)]',
        neutral: 'bg-[linear-gradient(135deg,#e5e7eb,#6b7280,#111827)]',
        warm: 'bg-[linear-gradient(135deg,#fde68a,#f97316,#7f1d1d)]',
        cool: 'bg-[linear-gradient(135deg,#bfdbfe,#2563eb,#0f172a)]',
        monochrome: 'bg-[linear-gradient(135deg,#ffffff,#71717a,#09090b)]',
        pastel: 'bg-[linear-gradient(135deg,#fecdd3,#ddd6fe,#bae6fd)]',
        vibrant: 'bg-[linear-gradient(135deg,#ef4444,#eab308,#22c55e,#3b82f6)]',
        moody: 'bg-[linear-gradient(135deg,#020617,#312e81,#18181b)]',
        high_contrast: 'bg-[linear-gradient(135deg,#ffffff_0_44%,#020617_45%_100%)]'
    };
    return classes[value];
}

function PreviewCard({
    label,
    value,
    children
}: {
    label: string;
    value: string;
    children: React.ReactNode;
}) {
    return (
        <div className='space-y-1'>
            <div className='relative h-20 overflow-hidden rounded-md border border-white/10 bg-black'>{children}</div>
            <div className='flex items-center justify-between gap-2 text-[11px] leading-4'>
                <span className='text-white/45'>{label}</span>
                <span className='truncate text-white/70'>{value}</span>
            </div>
        </div>
    );
}

function CompositionPreview({ value }: { value: PromptComposition }) {
    return (
        <div className='relative h-full w-full bg-[linear-gradient(135deg,#111827,#020617)]'>
            <div className='absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25'>
                {Array.from({ length: 9 }).map((_, index) => (
                    <div key={index} className='border border-white/30' />
                ))}
            </div>
            <div
                className={`absolute rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.7)] ${
                    value === 'close_up'
                        ? 'inset-4'
                        : value === 'wide_shot'
                          ? 'bottom-4 left-1/2 h-5 w-5 -translate-x-1/2'
                          : value === 'rule_of_thirds'
                            ? 'top-6 left-1/3 h-7 w-7'
                            : value === 'symmetrical'
                              ? 'top-1/2 left-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2'
                              : value === 'top_down'
                                ? 'top-2 left-1/2 h-10 w-10 -translate-x-1/2'
                                : 'top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2'
                }`}
            />
            {value === 'medium_shot' && <div className='absolute right-5 bottom-3 left-5 h-4 rounded-full bg-white/20' />}
        </div>
    );
}

function CameraPreview({ value }: { value: PromptCameraAngle }) {
    return (
        <div
            className={`relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#0f172a,#020617)] ${
                value === 'low_angle'
                    ? 'perspective-[180px]'
                    : value === 'high_angle'
                      ? 'perspective-[420px]'
                      : value === 'wide_angle'
                        ? 'scale-x-110'
                        : value === 'telephoto'
                          ? 'scale-105'
                          : ''
            }`}>
            <div
                className={`absolute bg-white/80 shadow-[0_0_22px_rgba(255,255,255,0.45)] ${
                    value === 'macro'
                        ? 'inset-3 rounded-full'
                        : value === 'isometric'
                          ? 'top-5 left-1/2 h-10 w-10 -translate-x-1/2 rotate-45 rounded-sm'
                          : value === 'low_angle'
                            ? 'right-8 bottom-0 left-8 h-14 origin-bottom scale-x-75 skew-x-6 rounded-t-lg'
                            : value === 'high_angle'
                              ? 'top-4 left-1/2 h-9 w-9 -translate-x-1/2 rounded-full'
                              : 'top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-lg'
                }`}
            />
            <div className='absolute right-4 bottom-3 left-4 h-px bg-white/20' />
        </div>
    );
}

function LightingPreview({ value }: { value: PromptLighting }) {
    const lightClass: Record<PromptLighting, string> = {
        auto: 'bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.75),transparent_34%)]',
        soft: 'bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.55),transparent_52%)] blur-sm',
        cinematic: 'bg-[linear-gradient(110deg,transparent_0_35%,rgba(251,191,36,0.7)_45%,transparent_62%)]',
        studio: 'bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.75),transparent_28%),radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.5),transparent_24%)]',
        natural: 'bg-[linear-gradient(135deg,rgba(186,230,253,0.75),transparent_45%)]',
        neon: 'bg-[radial-gradient(circle_at_30%_45%,rgba(236,72,153,0.75),transparent_30%),radial-gradient(circle_at_70%_45%,rgba(34,211,238,0.75),transparent_30%)]',
        backlight: 'bg-[radial-gradient(circle_at_50%_90%,rgba(255,255,255,0.8),transparent_35%)]',
        golden_hour: 'bg-[linear-gradient(135deg,rgba(251,191,36,0.85),rgba(124,45,18,0.2)_55%,transparent)]',
        dramatic: 'bg-[linear-gradient(105deg,rgba(255,255,255,0.8)_0_24%,transparent_25_100%)]'
    };

    return (
        <div className='relative h-full w-full bg-[#030712]'>
            <div className={`absolute inset-0 ${lightClass[value]}`} />
            <div className='absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/70 shadow-lg' />
        </div>
    );
}

function DetailPreview({ value }: { value: number }) {
    const dotCount = Math.max(4, value * 5);
    return (
        <div className='relative h-full w-full bg-[linear-gradient(135deg,#0f172a,#111827)]'>
            {Array.from({ length: dotCount }).map((_, index) => (
                <span
                    key={index}
                    className='absolute h-0.5 w-0.5 rounded-full bg-white/70'
                    style={{
                        left: `${(index * 23) % 96}%`,
                        top: `${(index * 41) % 92}%`,
                        opacity: 0.28 + Math.min(value, 10) * 0.055
                    }}
                />
            ))}
            <div className='absolute inset-5 rounded border border-white/20' />
        </div>
    );
}

export function GenerationForm({
    onSubmit,
    isLoading,
    currentMode,
    onModeChange,
    isPasswordRequiredByBackend,
    clientPasswordHash,
    onOpenPasswordDialog,
    model,
    setModel,
    prompt,
    setPrompt,
    n,
    setN,
    size,
    setSize,
    customWidth,
    setCustomWidth,
    customHeight,
    setCustomHeight,
    quality,
    setQuality,
    outputFormat,
    setOutputFormat,
    compression,
    setCompression,
    background,
    setBackground,
    moderation,
    setModeration,
    enableStreaming,
    setEnableStreaming,
    partialImages,
    setPartialImages,
    allowEmptyPrompt = false,
    promptEnhancement,
    setPromptEnhancement,
    negativePrompt,
    setNegativePrompt,
    stylePreset,
    setStylePreset,
    composition,
    setComposition,
    cameraAngle,
    setCameraAngle,
    lighting,
    setLighting,
    colorTone,
    setColorTone,
    detailLevel,
    setDetailLevel,
    enableCompatibilityParams,
    setEnableCompatibilityParams,
    seed,
    setSeed,
    steps,
    setSteps,
    guidanceScale,
    setGuidanceScale,
    sampler,
    setSampler,
    scheduler,
    setScheduler
}: GenerationFormProps) {
    const { t } = useI18n();
    const showCompression = outputFormat === 'jpeg' || outputFormat === 'webp';
    const isGptImage2 = model === 'gpt-image-2';
    const customSizeValidation =
        size === 'custom' ? validateGptImage2Size(customWidth, customHeight) : { valid: true as const };
    const customSizeInvalid = size === 'custom' && !customSizeValidation.valid;

    // Disable streaming when n > 1 (OpenAI limitation)
    React.useEffect(() => {
        if (n[0] > 1 && enableStreaming) {
            setEnableStreaming(false);
        }
    }, [n, enableStreaming, setEnableStreaming]);

    // 'custom' is only valid on gpt-image-2; reset when switching to a legacy model
    React.useEffect(() => {
        if (!isGptImage2 && size === 'custom') {
            setSize('auto');
        }
    }, [isGptImage2, size, setSize]);

    // Reset transparent background when switching to gpt-image-2 (not supported)
    React.useEffect(() => {
        if (isGptImage2 && background === 'transparent') {
            setBackground('auto');
        }
    }, [isGptImage2, background, setBackground]);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (customSizeInvalid) {
            return;
        }
        const formData: GenerationFormData = {
            prompt,
            n: n[0],
            size,
            customWidth,
            customHeight,
            quality,
            output_format: outputFormat,
            background,
            moderation,
            model,
            promptEnhancement,
            negativePrompt,
            stylePreset,
            composition,
            cameraAngle,
            lighting,
            colorTone,
            detailLevel: detailLevel[0],
            enableCompatibilityParams,
            seed: seed.trim() ? Number(seed) : undefined,
            steps: steps[0],
            guidanceScale: guidanceScale[0],
            sampler,
            scheduler
        };
        if (showCompression) {
            formData.output_compression = compression[0];
        }
        onSubmit(formData);
    };

    return (
        <Card className='flex h-full w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-black'>
            <CardHeader className='flex items-start justify-between border-b border-white/10 pb-4'>
                <div>
                    <div className='flex items-center'>
                        <CardTitle className='py-1 text-lg font-medium text-white'>
                            {t('form.generateTitle')}
                        </CardTitle>
                        {isPasswordRequiredByBackend && (
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={onOpenPasswordDialog}
                                className='ml-2 text-white/60 hover:text-white'
                                aria-label={t('form.configurePassword')}>
                                {clientPasswordHash ? <Lock className='h-4 w-4' /> : <LockOpen className='h-4 w-4' />}
                            </Button>
                        )}
                    </div>
                    <CardDescription className='mt-1 text-white/60'>
                        {t('form.generateDescription')}
                    </CardDescription>
                </div>
                <ModeToggle currentMode={currentMode} onModeChange={onModeChange} />
            </CardHeader>
            <form onSubmit={handleSubmit} className='flex h-full flex-1 flex-col overflow-hidden'>
                <CardContent className='flex-1 space-y-5 overflow-y-auto p-4'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='model-select' className='text-white'>
                            {t('form.model')}
                        </Label>
                        <div className='flex items-center gap-4'>
                            <Select value={model} onValueChange={(value) => setModel(value as GenerationFormData['model'])} disabled={isLoading}>
                                <SelectTrigger
                                    id='model-select'
                                    className='w-[180px] rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                    <SelectValue placeholder={t('form.selectModel')} />
                                </SelectTrigger>
                                <SelectContent className='border-white/20 bg-black text-white'>
                                    <SelectItem value='gpt-image-2' className='focus:bg-white/10'>
                                        gpt-image-2
                                    </SelectItem>
                                    <SelectItem value='gpt-image-1.5' className='focus:bg-white/10'>
                                        gpt-image-1.5
                                    </SelectItem>
                                    <SelectItem value='gpt-image-1' className='focus:bg-white/10'>
                                        gpt-image-1
                                    </SelectItem>
                                    <SelectItem value='gpt-image-1-mini' className='focus:bg-white/10'>
                                        gpt-image-1-mini
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className='flex items-center gap-2'>
                                        <Checkbox
                                            id='enable-streaming'
                                            checked={enableStreaming}
                                            onCheckedChange={(checked) => setEnableStreaming(!!checked)}
                                            disabled={isLoading || n[0] > 1}
                                            className='border-white/40 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black disabled:cursor-not-allowed disabled:opacity-50'
                                        />
                                        <Label
                                            htmlFor='enable-streaming'
                                            className={`text-sm ${n[0] > 1 ? 'cursor-not-allowed text-white/40' : 'cursor-pointer text-white/80'}`}>
                                            {t('form.enableStreaming')}
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className='max-w-[250px]'>
                                    {n[0] > 1
                                        ? t('form.streamingDisabled')
                                        : t('form.streamingHelp')}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {enableStreaming && (
                        <div className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <Label className='text-white'>{t('form.previewImages')}</Label>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <HelpCircle className='h-4 w-4 cursor-help text-white/40 hover:text-white/60' />
                                    </TooltipTrigger>
                                    <TooltipContent className='max-w-[250px]'>
                                        {t('form.previewCost')}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <RadioGroup
                                value={String(partialImages)}
                                onValueChange={(value) => setPartialImages(Number(value) as 1 | 2 | 3)}
                                disabled={isLoading}
                                className='flex gap-x-5'>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem
                                        value='1'
                                        id='partial-1'
                                        className='border-white/40 text-white data-[state=checked]:border-white data-[state=checked]:text-white'
                                    />
                                    <Label htmlFor='partial-1' className='cursor-pointer text-white/80'>
                                        1
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem
                                        value='2'
                                        id='partial-2'
                                        className='border-white/40 text-white data-[state=checked]:border-white data-[state=checked]:text-white'
                                    />
                                    <Label htmlFor='partial-2' className='cursor-pointer text-white/80'>
                                        2
                                    </Label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <RadioGroupItem
                                        value='3'
                                        id='partial-3'
                                        className='border-white/40 text-white data-[state=checked]:border-white data-[state=checked]:text-white'
                                    />
                                    <Label htmlFor='partial-3' className='cursor-pointer text-white/80'>
                                        3
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>
                    )}

                    <div className='space-y-1.5'>
                        <Label htmlFor='prompt' className='text-white'>
                            {t('form.prompt')}
                        </Label>
                        <Textarea
                            id='prompt'
                            placeholder={t('form.generatePromptPlaceholder')}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required={!allowEmptyPrompt}
                            disabled={isLoading}
                            className='min-h-[80px] rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                        />
                    </div>

                    <div className='space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3'>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <Label className='text-white'>专业画面控制</Label>
                                <p className='mt-1 text-xs text-white/45'>
                                    参考 A1111 / ComfyUI / Fooocus 的常用参数，会整理进最终提示词。
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='prompt-enhancement'
                                    checked={promptEnhancement}
                                    onCheckedChange={(checked) => setPromptEnhancement(!!checked)}
                                    disabled={isLoading}
                                    className='border-white/40 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black'
                                />
                                <Label htmlFor='prompt-enhancement' className='cursor-pointer text-sm text-white/80'>
                                    加入提示词
                                </Label>
                            </div>
                        </div>

                        <div className='space-y-1.5'>
                            <Label htmlFor='negative-prompt' className='text-xs text-white/70'>
                                负面提示词
                            </Label>
                            <Textarea
                                id='negative-prompt'
                                value={negativePrompt}
                                onChange={(event) => setNegativePrompt(event.target.value)}
                                placeholder='例如：低清晰度、畸形手指、文字水印、多余肢体、过曝、模糊'
                                disabled={isLoading}
                                className='min-h-[64px] rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                            />
                        </div>

                        <div className='grid gap-2 sm:grid-cols-2 lg:grid-cols-3'>
                            <PreviewCard
                                label='风格'
                                value={styleOptions.find((option) => option.value === stylePreset)?.label || '自动'}>
                                <div className={`h-full w-full ${getStylePreviewClass(stylePreset)}`}>
                                    <div className='absolute inset-x-4 bottom-3 h-4 rounded-full bg-black/25 blur-sm' />
                                    <div className='absolute top-4 left-1/2 h-9 w-9 -translate-x-1/2 rounded-lg bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.45)]' />
                                </div>
                            </PreviewCard>
                            <PreviewCard
                                label='构图'
                                value={compositionOptions.find((option) => option.value === composition)?.label || '自动'}>
                                <CompositionPreview value={composition} />
                            </PreviewCard>
                            <PreviewCard
                                label='镜头'
                                value={cameraOptions.find((option) => option.value === cameraAngle)?.label || '自动'}>
                                <CameraPreview value={cameraAngle} />
                            </PreviewCard>
                            <PreviewCard
                                label='光线'
                                value={lightingOptions.find((option) => option.value === lighting)?.label || '自动'}>
                                <LightingPreview value={lighting} />
                            </PreviewCard>
                            <PreviewCard
                                label='色调'
                                value={colorToneOptions.find((option) => option.value === colorTone)?.label || '自动'}>
                                <div className={`h-full w-full ${getColorPreviewClass(colorTone)}`}>
                                    <div className='absolute top-1/2 left-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/60 mix-blend-screen' />
                                </div>
                            </PreviewCard>
                            <PreviewCard label='细节' value={`${detailLevel[0]}/10`}>
                                <DetailPreview value={detailLevel[0]} />
                            </PreviewCard>
                        </div>

                        <div className='grid gap-3 md:grid-cols-2'>
                            <div className='space-y-1.5'>
                                <Label className='text-xs text-white/70'>风格预设</Label>
                                <Select
                                    value={stylePreset}
                                    onValueChange={(value) => setStylePreset(value as PromptStylePreset)}
                                    disabled={isLoading}>
                                    <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='border-white/20 bg-black text-white'>
                                        {styleOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className='focus:bg-white/10'>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-1.5'>
                                <Label className='text-xs text-white/70'>构图</Label>
                                <Select
                                    value={composition}
                                    onValueChange={(value) => setComposition(value as PromptComposition)}
                                    disabled={isLoading}>
                                    <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='border-white/20 bg-black text-white'>
                                        {compositionOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className='focus:bg-white/10'>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-1.5'>
                                <Label className='text-xs text-white/70'>镜头 / 视角</Label>
                                <Select
                                    value={cameraAngle}
                                    onValueChange={(value) => setCameraAngle(value as PromptCameraAngle)}
                                    disabled={isLoading}>
                                    <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='border-white/20 bg-black text-white'>
                                        {cameraOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className='focus:bg-white/10'>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-1.5'>
                                <Label className='text-xs text-white/70'>光线</Label>
                                <Select
                                    value={lighting}
                                    onValueChange={(value) => setLighting(value as PromptLighting)}
                                    disabled={isLoading}>
                                    <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='border-white/20 bg-black text-white'>
                                        {lightingOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className='focus:bg-white/10'>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-1.5'>
                                <Label className='text-xs text-white/70'>色调</Label>
                                <Select
                                    value={colorTone}
                                    onValueChange={(value) => setColorTone(value as PromptColorTone)}
                                    disabled={isLoading}>
                                    <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className='border-white/20 bg-black text-white'>
                                        {colorToneOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value} className='focus:bg-white/10'>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-xs text-white/70'>细节强度：{detailLevel[0]}</Label>
                                <Slider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={detailLevel}
                                    onValueChange={setDetailLevel}
                                    disabled={isLoading}
                                    className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                                />
                            </div>
                        </div>
                    </div>

                    <div className='space-y-3 rounded-md border border-white/10 bg-white/[0.03] p-3'>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <div>
                                <Label className='text-white'>兼容扩展参数</Label>
                                <p className='mt-1 text-xs text-white/45'>
                                    仅部分代理 / SD 后端支持。关闭时不会发送这些额外字段。
                                </p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <Checkbox
                                    id='compat-params'
                                    checked={enableCompatibilityParams}
                                    onCheckedChange={(checked) => setEnableCompatibilityParams(!!checked)}
                                    disabled={isLoading}
                                    className='border-white/40 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black'
                                />
                                <Label htmlFor='compat-params' className='cursor-pointer text-sm text-white/80'>
                                    发送扩展参数
                                </Label>
                            </div>
                        </div>

                        <div className='grid gap-3 md:grid-cols-2'>
                            <div className='space-y-1.5'>
                                <Label htmlFor='seed' className='text-xs text-white/70'>
                                    Seed
                                </Label>
                                <div className='flex gap-2'>
                                    <Input
                                        id='seed'
                                        type='number'
                                        value={seed}
                                        onChange={(event) => setSeed(event.target.value)}
                                        placeholder='随机'
                                        disabled={isLoading || !enableCompatibilityParams}
                                        className='rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                                    />
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='icon'
                                        onClick={() => setSeed(String(Math.floor(Math.random() * 2147483647)))}
                                        disabled={isLoading || !enableCompatibilityParams}
                                        className='border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                                        <Shuffle className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-xs text-white/70'>Steps：{steps[0]}</Label>
                                <Slider
                                    min={1}
                                    max={80}
                                    step={1}
                                    value={steps}
                                    onValueChange={setSteps}
                                    disabled={isLoading || !enableCompatibilityParams}
                                    className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label className='text-xs text-white/70'>CFG / Guidance：{guidanceScale[0].toFixed(1)}</Label>
                                <Slider
                                    min={0}
                                    max={20}
                                    step={0.5}
                                    value={guidanceScale}
                                    onValueChange={setGuidanceScale}
                                    disabled={isLoading || !enableCompatibilityParams}
                                    className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                                />
                            </div>

                            <div className='grid grid-cols-2 gap-2'>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs text-white/70'>Sampler</Label>
                                    <Select value={sampler} onValueChange={setSampler} disabled={isLoading || !enableCompatibilityParams}>
                                        <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className='border-white/20 bg-black text-white'>
                                            {samplerOptions.map((option) => (
                                                <SelectItem key={option} value={option} className='focus:bg-white/10'>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-1.5'>
                                    <Label className='text-xs text-white/70'>Scheduler</Label>
                                    <Select value={scheduler} onValueChange={setScheduler} disabled={isLoading || !enableCompatibilityParams}>
                                        <SelectTrigger className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className='border-white/20 bg-black text-white'>
                                            {schedulerOptions.map((option) => (
                                                <SelectItem key={option} value={option} className='focus:bg-white/10'>
                                                    {option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='n-slider' className='text-white'>
                            {t('form.numberOfImages')}: {n[0]}
                        </Label>
                        <Slider
                            id='n-slider'
                            min={1}
                            max={10}
                            step={1}
                            value={n}
                            onValueChange={setN}
                            disabled={isLoading}
                            className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                        />
                    </div>

                    <div className='space-y-3'>
                        <Label className='block text-white'>{t('form.size')}</Label>
                        <RadioGroup
                            value={size}
                            onValueChange={(value) => setSize(value as GenerationFormData['size'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon value='auto' id='size-auto' label={t('form.auto')} Icon={Sparkles} />
                            {isGptImage2 && (
                                <RadioItemWithIcon
                                    value='custom'
                                    id='size-custom'
                                    label={t('form.custom')}
                                    Icon={SquareDashed}
                                />
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioItemWithIcon
                                            value='square'
                                            id='size-square'
                                            label={t('form.square')}
                                            Icon={Square}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{getPresetTooltip('square', model)}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioItemWithIcon
                                            value='landscape'
                                            id='size-landscape'
                                            label={t('form.landscape')}
                                            Icon={RectangleHorizontal}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{getPresetTooltip('landscape', model)}</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioItemWithIcon
                                            value='portrait'
                                            id='size-portrait'
                                            label={t('form.portrait')}
                                            Icon={RectangleVertical}
                                        />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>{getPresetTooltip('portrait', model)}</TooltipContent>
                            </Tooltip>
                        </RadioGroup>
                        {isGptImage2 && size === 'custom' && (
                            <div className='space-y-2 rounded-md border border-white/10 bg-white/5 p-3'>
                                <div className='flex items-center gap-3'>
                                    <div className='flex-1 space-y-1'>
                                        <Label htmlFor='custom-width' className='text-xs text-white/70'>
                                            Width (px)
                                        </Label>
                                        <Input
                                            id='custom-width'
                                            type='number'
                                            min={16}
                                            max={3840}
                                            step={16}
                                            value={customWidth}
                                            onChange={(e) => setCustomWidth(parseInt(e.target.value, 10) || 0)}
                                            disabled={isLoading}
                                            className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'
                                        />
                                    </div>
                                    <span className='pt-5 text-white/60'>×</span>
                                    <div className='flex-1 space-y-1'>
                                        <Label htmlFor='custom-height' className='text-xs text-white/70'>
                                            Height (px)
                                        </Label>
                                        <Input
                                            id='custom-height'
                                            type='number'
                                            min={16}
                                            max={3840}
                                            step={16}
                                            value={customHeight}
                                            onChange={(e) => setCustomHeight(parseInt(e.target.value, 10) || 0)}
                                            disabled={isLoading}
                                            className='rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50'
                                        />
                                    </div>
                                </div>
                                <p className='text-xs text-white/50'>
                                    {(customWidth * customHeight).toLocaleString()} pixels (
                                    {((customWidth * customHeight) / 8_294_400 * 100).toFixed(1)}% of max) ·{' '}
                                    {customWidth > 0 && customHeight > 0
                                        ? `${(Math.max(customWidth, customHeight) / Math.min(customWidth, customHeight)).toFixed(2)}:1 ratio`
                                        : '—'}
                                </p>
                                {!customSizeValidation.valid && (
                                    <p className='text-xs text-red-400'>{customSizeValidation.reason}</p>
                                )}
                                <p className='text-xs text-white/40'>
                                    Constraints: multiples of 16, max edge 3840px, aspect ratio ≤ 3:1, 655,360 to
                                    8,294,400 total pixels.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className='space-y-3'>
                        <Label className='block text-white'>Quality</Label>
                        <RadioGroup
                            value={quality}
                            onValueChange={(value) => setQuality(value as GenerationFormData['quality'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon value='auto' id='quality-auto' label='Auto' Icon={Sparkles} />
                            <RadioItemWithIcon value='low' id='quality-low' label='Low' Icon={Tally1} />
                            <RadioItemWithIcon value='medium' id='quality-medium' label='Medium' Icon={Tally2} />
                            <RadioItemWithIcon value='high' id='quality-high' label='High' Icon={Tally3} />
                        </RadioGroup>
                    </div>

                    {!isGptImage2 && (
                        <div className='space-y-3'>
                            <Label className='block text-white'>Background</Label>
                            <RadioGroup
                                value={background}
                                onValueChange={(value) => setBackground(value as GenerationFormData['background'])}
                                disabled={isLoading}
                                className='flex flex-wrap gap-x-5 gap-y-3'>
                                <RadioItemWithIcon value='auto' id='bg-auto' label='Auto' Icon={Sparkles} />
                                <RadioItemWithIcon value='opaque' id='bg-opaque' label='Opaque' Icon={BrickWall} />
                                <RadioItemWithIcon
                                    value='transparent'
                                    id='bg-transparent'
                                    label='Transparent'
                                    Icon={Eraser}
                                />
                            </RadioGroup>
                        </div>
                    )}

                    <div className='space-y-3'>
                        <Label className='block text-white'>Output Format</Label>
                        <RadioGroup
                            value={outputFormat}
                            onValueChange={(value) => setOutputFormat(value as GenerationFormData['output_format'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon value='png' id='format-png' label='PNG' Icon={FileImage} />
                            <RadioItemWithIcon value='jpeg' id='format-jpeg' label='JPEG' Icon={FileImage} />
                            <RadioItemWithIcon value='webp' id='format-webp' label='WebP' Icon={FileImage} />
                        </RadioGroup>
                    </div>

                    {showCompression && (
                        <div className='space-y-2 pt-2 transition-opacity duration-300'>
                            <Label htmlFor='compression-slider' className='text-white'>
                                Compression: {compression[0]}%
                            </Label>
                            <Slider
                                id='compression-slider'
                                min={0}
                                max={100}
                                step={1}
                                value={compression}
                                onValueChange={setCompression}
                                disabled={isLoading}
                                className='mt-3 [&>button]:border-black [&>button]:bg-white [&>button]:ring-offset-black [&>span:first-child]:h-1 [&>span:first-child>span]:bg-white'
                            />
                        </div>
                    )}

                    <div className='space-y-3'>
                        <Label className='block text-white'>Moderation Level</Label>
                        <RadioGroup
                            value={moderation}
                            onValueChange={(value) => setModeration(value as GenerationFormData['moderation'])}
                            disabled={isLoading}
                            className='flex flex-wrap gap-x-5 gap-y-3'>
                            <RadioItemWithIcon value='auto' id='mod-auto' label='Auto' Icon={ShieldCheck} />
                            <RadioItemWithIcon value='low' id='mod-low' label='Low' Icon={ShieldAlert} />
                        </RadioGroup>
                    </div>
                </CardContent>
                <CardFooter className='border-t border-white/10 p-4'>
                    <Button
                        type='submit'
                        disabled={isLoading || (!prompt && !allowEmptyPrompt) || customSizeInvalid}
                        className='flex w-full items-center justify-center gap-2 rounded-md bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40'>
                        {isLoading && <Loader2 className='h-4 w-4 animate-spin' />}
                        {isLoading ? 'Generating...' : 'Generate'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
