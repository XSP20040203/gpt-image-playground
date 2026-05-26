'use client';

import { EditingForm, type EditingFormData } from '@/components/editing-form';
import {
    GenerationForm,
    type GenerationFormData,
    type PromptCameraAngle,
    type PromptColorTone,
    type PromptComposition,
    type PromptLighting,
    type PromptStylePreset
} from '@/components/generation-form';
import { HistoryPanel } from '@/components/history-panel';
import { ImageOutput } from '@/components/image-output';
import { LanguageToggle } from '@/components/language-toggle';
import { PasswordDialog } from '@/components/password-dialog';
import { ThemeToggle } from '@/components/theme-toggle';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calculateApiCost, type CostDetails, type GptImageModel } from '@/lib/cost-utils';
import { getPresetDimensions } from '@/lib/size-utils';
import { db, type ImageRecord } from '@/lib/db';
import { useI18n } from '@/lib/i18n';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bot, ClipboardCheck, ExternalLink, Loader2, Send, Trash2, WandSparkles } from 'lucide-react';
import Image from 'next/image';
import * as React from 'react';

type HistoryImage = {
    filename: string;
};

export type HistoryMetadata = {
    timestamp: number;
    images: HistoryImage[];
    storageModeUsed?: 'fs' | 'indexeddb';
    durationMs: number;
    quality: GenerationFormData['quality'];
    background: GenerationFormData['background'];
    moderation: GenerationFormData['moderation'];
    prompt: string;
    mode: 'generate' | 'edit';
    costDetails: CostDetails | null;
    output_format?: GenerationFormData['output_format'];
    model?: GptImageModel;
};

type DrawnPoint = {
    x: number;
    y: number;
    size: number;
};

const MAX_EDIT_IMAGES = 10;
const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_DEFAULT_API_BASE_URL || 'https://api.xsp2api.top/v1';

const explicitModeClient = process.env.NEXT_PUBLIC_IMAGE_STORAGE_MODE;

const vercelEnvClient = process.env.NEXT_PUBLIC_VERCEL_ENV;
const isOnVercelClient = vercelEnvClient === 'production' || vercelEnvClient === 'preview';

let effectiveStorageModeClient: 'fs' | 'indexeddb';

if (explicitModeClient === 'fs') {
    effectiveStorageModeClient = 'fs';
} else if (explicitModeClient === 'indexeddb') {
    effectiveStorageModeClient = 'indexeddb';
} else if (isOnVercelClient) {
    effectiveStorageModeClient = 'indexeddb';
} else {
    effectiveStorageModeClient = 'fs';
}
console.log(
    `Client Effective Storage Mode: ${effectiveStorageModeClient} (Explicit: ${explicitModeClient || 'unset'}, Vercel Env: ${vercelEnvClient || 'N/A'})`
);

type ApiImageResponseItem = {
    filename: string;
    b64_json?: string;
    output_format: string;
    path?: string;
};

type AssistantMessage = {
    role: 'user' | 'assistant';
    content: string;
};

type PromptAssistantResult = {
    requirementSummary: string;
    finalPrompt: string;
    assistantNote: string;
};

const promptStyleText: Record<PromptStylePreset, string> = {
    none: '',
    photorealistic: 'photorealistic, realistic textures, natural depth of field',
    cinematic: 'cinematic still, dramatic composition, filmic color grading',
    product: 'premium product photography, clean commercial lighting, crisp material detail',
    anime: 'high quality anime illustration, expressive shape language, clean linework',
    editorial: 'editorial magazine visual, refined styling, sophisticated layout',
    architectural: 'architectural visualization, spatial clarity, clean perspective',
    icon: 'modern app icon style, clear silhouette, polished graphic design',
    watercolor: 'watercolor illustration, soft pigment texture, gentle paper grain',
    cyberpunk: 'cyberpunk atmosphere, neon accents, futuristic urban detail'
};

const promptCompositionText: Record<PromptComposition, string> = {
    auto: '',
    close_up: 'close-up composition',
    medium_shot: 'medium shot composition',
    wide_shot: 'wide establishing shot',
    rule_of_thirds: 'rule-of-thirds composition',
    centered: 'centered main subject',
    symmetrical: 'symmetrical balanced composition',
    top_down: 'top-down composition'
};

const promptCameraText: Record<PromptCameraAngle, string> = {
    auto: '',
    eye_level: 'eye-level camera angle',
    low_angle: 'low-angle camera perspective',
    high_angle: 'high-angle camera perspective',
    macro: 'macro lens perspective',
    wide_angle: 'wide-angle lens perspective',
    telephoto: 'telephoto compression',
    isometric: 'isometric perspective'
};

const promptLightingText: Record<PromptLighting, string> = {
    auto: '',
    soft: 'soft diffused lighting',
    cinematic: 'cinematic lighting',
    studio: 'professional studio lighting',
    natural: 'natural light',
    neon: 'neon lighting',
    backlight: 'strong backlight and rim light',
    golden_hour: 'golden hour lighting',
    dramatic: 'dramatic high contrast lighting'
};

const promptColorText: Record<PromptColorTone, string> = {
    auto: '',
    neutral: 'neutral natural color palette',
    warm: 'warm color palette',
    cool: 'cool color palette',
    monochrome: 'monochrome color treatment',
    pastel: 'soft pastel color palette',
    vibrant: 'vibrant saturated color palette',
    moody: 'moody dark color palette',
    high_contrast: 'high contrast color grading'
};

function buildEnhancedPrompt(basePrompt: string, data: GenerationFormData) {
    if (!data.promptEnhancement) {
        return basePrompt;
    }

    const additions = [
        promptStyleText[data.stylePreset],
        promptCompositionText[data.composition],
        promptCameraText[data.cameraAngle],
        promptLightingText[data.lighting],
        promptColorText[data.colorTone],
        data.detailLevel > 0 ? `detail level ${data.detailLevel}/10, coherent fine details` : '',
        data.negativePrompt.trim() ? `Avoid: ${data.negativePrompt.trim()}` : ''
    ].filter(Boolean);

    if (!additions.length) {
        return basePrompt;
    }

    return `${basePrompt.trim()}\n\nProfessional controls: ${additions.join('; ')}.`;
}

export default function HomePage() {
    const { t } = useI18n();
    const [mode, setMode] = React.useState<'generate' | 'edit'>('generate');
    const [isPasswordRequiredByBackend, setIsPasswordRequiredByBackend] = React.useState<boolean | null>(null);
    const [clientPasswordHash, setClientPasswordHash] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSendingToEdit, setIsSendingToEdit] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [latestImageBatch, setLatestImageBatch] = React.useState<{ path: string; filename: string }[] | null>(null);
    const [imageOutputView, setImageOutputView] = React.useState<'grid' | number>('grid');
    const [history, setHistory] = React.useState<HistoryMetadata[]>([]);
    const [isInitialLoad, setIsInitialLoad] = React.useState(true);
    const blobUrlCacheRef = React.useRef<Map<string, string>>(new Map());
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = React.useState(false);
    const [passwordDialogContext, setPasswordDialogContext] = React.useState<'initial' | 'retry'>('initial');
    const [lastApiCallArgs, setLastApiCallArgs] = React.useState<[GenerationFormData | EditingFormData] | null>(null);
    const [skipDeleteConfirmation, setSkipDeleteConfirmation] = React.useState<boolean>(false);
    const [itemToDeleteConfirm, setItemToDeleteConfirm] = React.useState<HistoryMetadata | null>(null);
    const [dialogCheckboxStateSkipConfirm, setDialogCheckboxStateSkipConfirm] = React.useState<boolean>(false);
    const [apiBaseUrl, setApiBaseUrl] = React.useState('');
    const [apiKey, setApiKey] = React.useState('');
    const [showApiKey, setShowApiKey] = React.useState(false);
    const [isApiBaseUnlocked, setIsApiBaseUnlocked] = React.useState(false);
    const [adminUnlockToken, setAdminUnlockToken] = React.useState('');
    const [adminPassword, setAdminPassword] = React.useState('');
    const [isAdminUnlocking, setIsAdminUnlocking] = React.useState(false);
    const [adminUnlockError, setAdminUnlockError] = React.useState('');
    const [isAdminDialogOpen, setIsAdminDialogOpen] = React.useState(false);
    const [apiConnectionStatus, setApiConnectionStatus] = React.useState<'idle' | 'testing' | 'ok' | 'bad'>('idle');
    const [apiConnectionMessage, setApiConnectionMessage] = React.useState('');
    const [assistantModel, setAssistantModel] = React.useState('gpt-4o-mini');
    const [assistantInput, setAssistantInput] = React.useState('');
    const [assistantMessages, setAssistantMessages] = React.useState<AssistantMessage[]>([]);
    const [assistantResult, setAssistantResult] = React.useState<PromptAssistantResult | null>(null);
    const [assistantError, setAssistantError] = React.useState('');
    const [isAssistantLoading, setIsAssistantLoading] = React.useState(false);
    const [useAssistantForGeneration, setUseAssistantForGeneration] = React.useState(true);
    const [assistantModels, setAssistantModels] = React.useState<string[]>([]);
    const [isAssistantModelsLoading, setIsAssistantModelsLoading] = React.useState(false);
    const [assistantModelsError, setAssistantModelsError] = React.useState('');
    const assistantMessagesEndRef = React.useRef<HTMLDivElement | null>(null);

    const allDbImages = useLiveQuery<ImageRecord[] | undefined>(() => db.images.toArray(), []);

    const [editImageFiles, setEditImageFiles] = React.useState<File[]>([]);
    const [editSourceImagePreviewUrls, setEditSourceImagePreviewUrls] = React.useState<string[]>([]);
    const [editPrompt, setEditPrompt] = React.useState('');
    const [editN, setEditN] = React.useState([1]);
    const [editSize, setEditSize] = React.useState<EditingFormData['size']>('auto');
    const [editCustomWidth, setEditCustomWidth] = React.useState<number>(1024);
    const [editCustomHeight, setEditCustomHeight] = React.useState<number>(1024);
    const [editQuality, setEditQuality] = React.useState<EditingFormData['quality']>('auto');
    const [editBrushSize, setEditBrushSize] = React.useState([20]);
    const [editShowMaskEditor, setEditShowMaskEditor] = React.useState(false);
    const [editGeneratedMaskFile, setEditGeneratedMaskFile] = React.useState<File | null>(null);
    const [editIsMaskSaved, setEditIsMaskSaved] = React.useState(false);
    const [editOriginalImageSize, setEditOriginalImageSize] = React.useState<{ width: number; height: number } | null>(
        null
    );
    const [editDrawnPoints, setEditDrawnPoints] = React.useState<DrawnPoint[]>([]);
    const [editMaskPreviewUrl, setEditMaskPreviewUrl] = React.useState<string | null>(null);

    const [genModel, setGenModel] = React.useState<GenerationFormData['model']>('gpt-image-2');
    const [genPrompt, setGenPrompt] = React.useState('');
    const [genN, setGenN] = React.useState([1]);
    const [genSize, setGenSize] = React.useState<GenerationFormData['size']>('auto');
    const [genCustomWidth, setGenCustomWidth] = React.useState<number>(1024);
    const [genCustomHeight, setGenCustomHeight] = React.useState<number>(1024);
    const [genQuality, setGenQuality] = React.useState<GenerationFormData['quality']>('auto');
    const [genOutputFormat, setGenOutputFormat] = React.useState<GenerationFormData['output_format']>('png');
    const [genCompression, setGenCompression] = React.useState([100]);
    const [genBackground, setGenBackground] = React.useState<GenerationFormData['background']>('auto');
    const [genModeration, setGenModeration] = React.useState<GenerationFormData['moderation']>('auto');
    const [genPromptEnhancement, setGenPromptEnhancement] = React.useState(true);
    const [genNegativePrompt, setGenNegativePrompt] = React.useState('');
    const [genStylePreset, setGenStylePreset] = React.useState<PromptStylePreset>('none');
    const [genComposition, setGenComposition] = React.useState<PromptComposition>('auto');
    const [genCameraAngle, setGenCameraAngle] = React.useState<PromptCameraAngle>('auto');
    const [genLighting, setGenLighting] = React.useState<PromptLighting>('auto');
    const [genColorTone, setGenColorTone] = React.useState<PromptColorTone>('auto');
    const [genDetailLevel, setGenDetailLevel] = React.useState([5]);
    const [genEnableCompatibilityParams, setGenEnableCompatibilityParams] = React.useState(false);
    const [genSeed, setGenSeed] = React.useState('');
    const [genSteps, setGenSteps] = React.useState([28]);
    const [genGuidanceScale, setGenGuidanceScale] = React.useState([7]);
    const [genSampler, setGenSampler] = React.useState('auto');
    const [genScheduler, setGenScheduler] = React.useState('auto');

    const [editModel, setEditModel] = React.useState<EditingFormData['model']>('gpt-image-2');

    // Streaming state (shared between generate and edit modes)
    const [enableStreaming, setEnableStreaming] = React.useState(false);
    const [partialImages, setPartialImages] = React.useState<1 | 2 | 3>(2);
    // Streaming preview images (base64 data URLs for partial images during streaming)
    const [streamingPreviewImages, setStreamingPreviewImages] = React.useState<Map<number, string>>(new Map());

    const getImageSrc = React.useCallback(
        (filename: string): string | undefined => {
            const cached = blobUrlCacheRef.current.get(filename);
            if (cached) return cached;

            const record = allDbImages?.find((img) => img.filename === filename);
            if (record?.blob) {
                const url = URL.createObjectURL(record.blob);
                blobUrlCacheRef.current.set(filename, url);
                return url;
            }

            return undefined;
        },
        [allDbImages]
    );

    React.useEffect(() => {
        const cache = blobUrlCacheRef.current;
        return () => {
            cache.forEach((url) => URL.revokeObjectURL(url));
            cache.clear();
        };
    }, []);

    React.useEffect(() => {
        return () => {
            editSourceImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [editSourceImagePreviewUrls]);

    React.useEffect(() => {
        try {
            const storedHistory = localStorage.getItem('openaiImageHistory');
            if (storedHistory) {
                const parsedHistory: HistoryMetadata[] = JSON.parse(storedHistory);
                if (Array.isArray(parsedHistory)) {
                    setHistory(parsedHistory);
                } else {
                    console.warn('Invalid history data found in localStorage.');
                    localStorage.removeItem('openaiImageHistory');
                }
            }
        } catch (e) {
            console.error('Failed to load or parse history from localStorage:', e);
            localStorage.removeItem('openaiImageHistory');
        }
        setIsInitialLoad(false);
    }, []);

    React.useEffect(() => {
        const fetchAuthStatus = async () => {
            try {
                const response = await fetch('/api/auth-status');
                if (!response.ok) {
                    throw new Error('Failed to fetch auth status');
                }
                const data = await response.json();
                setIsPasswordRequiredByBackend(data.passwordRequired);
            } catch (error) {
                console.error('Error fetching auth status:', error);
                setIsPasswordRequiredByBackend(false);
            }
        };

        fetchAuthStatus();
        const storedHash = localStorage.getItem('clientPasswordHash');
        if (storedHash) {
            setClientPasswordHash(storedHash);
        }
        setApiBaseUrl(DEFAULT_API_BASE_URL);
        setApiKey(localStorage.getItem('imagePlaygroundApiKey') || '');
    }, []);

    React.useEffect(() => {
        if (isApiBaseUnlocked) {
            localStorage.setItem('imagePlaygroundApiBaseUrl', apiBaseUrl);
        }
    }, [apiBaseUrl, isApiBaseUnlocked]);

    React.useEffect(() => {
        localStorage.setItem('imagePlaygroundApiKey', apiKey);
    }, [apiKey]);

    React.useEffect(() => {
        setApiConnectionStatus('idle');
        setApiConnectionMessage('');
        setAssistantModels([]);
        setAssistantModelsError('');
    }, [apiBaseUrl, apiKey]);

    const apiBaseLink = React.useMemo(() => {
        const rawUrl = apiBaseUrl.trim() || DEFAULT_API_BASE_URL;
        const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
        return withProtocol.replace(/\/v\d+\/?$/i, '');
    }, [apiBaseUrl]);

    React.useEffect(() => {
        assistantMessagesEndRef.current?.scrollIntoView({ block: 'end' });
    }, [assistantMessages, isAssistantLoading]);

    React.useEffect(() => {
        if (!apiKey.trim()) {
            setAssistantModels([]);
            setAssistantModelsError('');
            return;
        }

        let isCancelled = false;

        const fetchAssistantModels = async () => {
            setIsAssistantModelsLoading(true);
            setAssistantModelsError('');

            try {
                const response = await fetch('/api/models', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        apiBaseUrl: apiBaseUrl.trim(),
                        apiKey: apiKey.trim(),
                        adminUnlockToken
                    })
                });
                const result = await response.json();

                if (!response.ok || !result.ok) {
                    throw new Error(result.error || '模型列表获取失败。');
                }

                const models: string[] = Array.isArray(result.chatModels)
                    ? result.chatModels.filter((model: unknown): model is string => typeof model === 'string' && Boolean(model.trim()))
                    : [];

                if (!isCancelled) {
                    setAssistantModels(models);
                    if (models.length && !models.includes(assistantModel)) {
                        const preferred =
                            models.find((model) => /gpt-4o-mini/i.test(model)) ||
                            models.find((model) => /gpt-4|gpt-4o|gpt-4\.1|deepseek|qwen/i.test(model)) ||
                            models[0];
                        setAssistantModel(preferred);
                    }
                }
            } catch (error: unknown) {
                if (!isCancelled) {
                    setAssistantModels([]);
                    setAssistantModelsError(error instanceof Error ? error.message : '模型列表获取失败。');
                }
            } finally {
                if (!isCancelled) {
                    setIsAssistantModelsLoading(false);
                }
            }
        };

        const timer = window.setTimeout(fetchAssistantModels, 450);

        return () => {
            isCancelled = true;
            window.clearTimeout(timer);
        };
    }, [adminUnlockToken, apiBaseUrl, apiKey, assistantModel]);

    React.useEffect(() => {
        if (!isInitialLoad) {
            try {
                localStorage.setItem('openaiImageHistory', JSON.stringify(history));
            } catch (e) {
                console.error('Failed to save history to localStorage:', e);
            }
        }
    }, [history, isInitialLoad]);

    React.useEffect(() => {
        return () => {
            editSourceImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [editSourceImagePreviewUrls]);

    React.useEffect(() => {
        const storedPref = localStorage.getItem('imageGenSkipDeleteConfirm');
        if (storedPref === 'true') {
            setSkipDeleteConfirmation(true);
        } else if (storedPref === 'false') {
            setSkipDeleteConfirmation(false);
        }
    }, []);

    React.useEffect(() => {
        localStorage.setItem('imageGenSkipDeleteConfirm', String(skipDeleteConfirmation));
    }, [skipDeleteConfirmation]);

    React.useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            if (mode !== 'edit' || !event.clipboardData) {
                return;
            }

            if (editImageFiles.length >= MAX_EDIT_IMAGES) {
                alert(`Cannot paste: Maximum of ${MAX_EDIT_IMAGES} images reached.`);
                return;
            }

            const items = event.clipboardData.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        event.preventDefault();

                        const previewUrl = URL.createObjectURL(file);

                        setEditImageFiles((prevFiles) => [...prevFiles, file]);
                        setEditSourceImagePreviewUrls((prevUrls) => [...prevUrls, previewUrl]);

                        break;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);

        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [mode, editImageFiles.length]);

    async function sha256Client(text: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    const handleSavePassword = async (password: string) => {
        if (!password.trim()) {
            setError(t('error.emptyPassword'));
            return;
        }
        try {
            const hash = await sha256Client(password);
            localStorage.setItem('clientPasswordHash', hash);
            setClientPasswordHash(hash);
            setError(null);
            setIsPasswordDialogOpen(false);
            if (passwordDialogContext === 'retry' && lastApiCallArgs) {
                await handleApiCall(...lastApiCallArgs);
            }
        } catch (e) {
            console.error('Error hashing password:', e);
            setError(t('error.hashFailed'));
        }
    };

    const handleOpenPasswordDialog = () => {
        setPasswordDialogContext('initial');
        setIsPasswordDialogOpen(true);
    };

    const handleOpenAdminDialog = () => {
        setAdminPassword('');
        setAdminUnlockError('');
        setIsAdminDialogOpen(true);
    };

    const handleAdminUnlock = async () => {
        if (!adminPassword.trim()) {
            setAdminUnlockError('请输入管理员密码。');
            return;
        }

        setIsAdminUnlocking(true);
        setAdminUnlockError('');

        try {
            const response = await fetch('/api/admin-unlock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: adminPassword })
            });
            const result = await response.json();

            if (!response.ok || !result.ok || !result.token) {
                throw new Error(result.error || '管理员密码不正确。');
            }

            setAdminUnlockToken(result.token);
            setIsApiBaseUnlocked(true);
            setIsAdminDialogOpen(false);
            setAdminPassword('');
            setApiConnectionStatus('idle');
            setApiConnectionMessage('API 地址已解锁，可以修改。');
        } catch (error: unknown) {
            setAdminUnlockError(error instanceof Error ? error.message : '解锁失败。');
        } finally {
            setIsAdminUnlocking(false);
        }
    };

    const handleAdminLock = () => {
        setIsApiBaseUnlocked(false);
        setAdminUnlockToken('');
        setApiBaseUrl(DEFAULT_API_BASE_URL);
        localStorage.removeItem('imagePlaygroundApiBaseUrl');
        setApiConnectionStatus('idle');
        setApiConnectionMessage('API 地址已锁定，使用默认地址。');
    };

    const handleTestApiConnection = async () => {
        if (!apiKey.trim()) {
            setApiConnectionStatus('bad');
            setApiConnectionMessage(t('api.missingKey'));
            return;
        }

        setApiConnectionStatus('testing');
        setApiConnectionMessage('');

        try {
            const response = await fetch('/api/connection-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    apiBaseUrl: apiBaseUrl.trim(),
                    apiKey: apiKey.trim(),
                    adminUnlockToken
                })
            });
            const result = await response.json();

            if (!response.ok || !result.ok) {
                throw new Error(result.error || `${t('error.apiFailed')} ${response.status}`);
            }

            setApiConnectionStatus('ok');
            setApiConnectionMessage(
                t('api.modelsFound', {
                    count: result.modelCount || 0,
                    imageCount: result.imageModelCount || 0
                })
            );
        } catch (error: unknown) {
            setApiConnectionStatus('bad');
            setApiConnectionMessage(error instanceof Error ? error.message : t('api.bad'));
        }
    };

    const getGenerationSizeForAssistant = React.useCallback(() => {
        if (genSize === 'custom') {
            return `${genCustomWidth}x${genCustomHeight}`;
        }

        return getPresetDimensions(genSize, genModel) ?? genSize;
    }, [genCustomHeight, genCustomWidth, genModel, genSize]);

    const requestPromptAssistant = React.useCallback(
        async (action: 'chat' | 'summarize', messages: AssistantMessage[]) => {
            const controller = new AbortController();
            const timeout = window.setTimeout(() => controller.abort(), action === 'summarize' ? 90000 : 60000);
            let response: Response;

            try {
                response = await fetch('/api/prompt-assistant', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    signal: controller.signal,
                    body: JSON.stringify({
                        action,
                        apiBaseUrl: apiBaseUrl.trim(),
                        apiKey: apiKey.trim(),
                        adminUnlockToken,
                        model: assistantModel.trim() || 'gpt-4o-mini',
                        messages,
                        currentPrompt: genPrompt,
                        imageModel: genModel,
                        size: getGenerationSizeForAssistant(),
                        quality: genQuality,
                        background: genBackground,
                        outputFormat: genOutputFormat
                    })
                });
            } catch (error: unknown) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    throw new Error('需求分析请求超时，请换一个语言模型或减少对话内容后重试。');
                }

                throw new Error('需求分析连接失败，请确认本地服务正在运行、域名隧道正常，并检查当前 API 地址和 SK。');
            } finally {
                window.clearTimeout(timeout);
            }

            const rawText = await response.text();
            let result: {
                ok?: boolean;
                error?: string;
                assistantMessage?: string;
                requirementSummary?: string;
                finalPrompt?: string;
                assistantNote?: string;
            } = {};

            try {
                result = rawText ? JSON.parse(rawText) : {};
            } catch {
                throw new Error(rawText || `需求分析助手返回了无法解析的响应，状态码 ${response.status}。`);
            }

            if (!response.ok || !result.ok) {
                throw new Error(result.error || '需求分析助手请求失败。');
            }

            return result as {
                ok: true;
                assistantMessage?: string;
                requirementSummary?: string;
                finalPrompt?: string;
                assistantNote?: string;
            };
        },
        [
            adminUnlockToken,
            apiBaseUrl,
            apiKey,
            assistantModel,
            genBackground,
            genModel,
            genOutputFormat,
            genPrompt,
            genQuality,
            getGenerationSizeForAssistant
        ]
    );

    const summarizeAssistantRequirements = React.useCallback(
        async (messages = assistantMessages): Promise<PromptAssistantResult | null> => {
            const hasConversation = messages.length > 0;
            if (!hasConversation && !genPrompt.trim()) {
                throw new Error('请先输入提示词，或在需求分析助手里描述你想生成的图片。');
            }

            const result = await requestPromptAssistant('summarize', messages);
            const finalPrompt = (result.finalPrompt || '').trim();
            if (!finalPrompt) {
                throw new Error('需求分析助手没有返回可用的最终提示词。');
            }

            const nextResult: PromptAssistantResult = {
                requirementSummary: (result.requirementSummary || '').trim(),
                finalPrompt,
                assistantNote: (result.assistantNote || '').trim()
            };

            setAssistantResult(nextResult);
            setAssistantError('');
            return nextResult;
        },
        [assistantMessages, genPrompt, requestPromptAssistant]
    );

    const handleSendAssistantMessage = async () => {
        const content = assistantInput.trim();
        if (!content || isAssistantLoading) return;

        const nextMessages: AssistantMessage[] = [...assistantMessages, { role: 'user', content }];
        setAssistantMessages(nextMessages);
        setAssistantInput('');
        setAssistantError('');
        setIsAssistantLoading(true);

        try {
            const result = await requestPromptAssistant('chat', nextMessages);
            const assistantMessage = (result.assistantMessage || '').trim();
            if (!assistantMessage) {
                throw new Error('需求分析助手没有返回内容。');
            }

            setAssistantMessages([...nextMessages, { role: 'assistant', content: assistantMessage }]);
        } catch (error: unknown) {
            setAssistantError(error instanceof Error ? error.message : '需求分析助手请求失败。');
        } finally {
            setIsAssistantLoading(false);
        }
    };

    const handleSummarizeAssistant = async () => {
        if (isAssistantLoading) return;

        setAssistantError('');
        setIsAssistantLoading(true);
        try {
            await summarizeAssistantRequirements();
        } catch (error: unknown) {
            setAssistantError(error instanceof Error ? error.message : '需求总结失败。');
        } finally {
            setIsAssistantLoading(false);
        }
    };

    const handleApplyAssistantPrompt = () => {
        if (!assistantResult?.finalPrompt) return;

        setGenPrompt(assistantResult.finalPrompt);
    };

    const handleClearAssistant = () => {
        setAssistantMessages([]);
        setAssistantInput('');
        setAssistantResult(null);
        setAssistantError('');
    };

    const getMimeTypeFromFormat = (format: string): string => {
        if (format === 'jpeg') return 'image/jpeg';
        if (format === 'webp') return 'image/webp';

        return 'image/png';
    };

    const handleApiCall = async (formData: GenerationFormData | EditingFormData) => {
        const startTime = Date.now();
        let durationMs = 0;

        setIsLoading(true);
        setError(null);
        setLatestImageBatch(null);
        setImageOutputView('grid');
        setStreamingPreviewImages(new Map());

        let effectiveGeneratePrompt = genPrompt;
        if (mode === 'generate' && useAssistantForGeneration && assistantMessages.length > 0) {
            setIsAssistantLoading(true);
            try {
                const assistantSummary = await summarizeAssistantRequirements();
                if (assistantSummary?.finalPrompt) {
                    effectiveGeneratePrompt = assistantSummary.finalPrompt;
                }
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : '需求分析助手总结失败。';
                setAssistantError(errorMessage);
                setError(errorMessage);
                setIsLoading(false);
                setIsAssistantLoading(false);
                return;
            } finally {
                setIsAssistantLoading(false);
            }
        }

        const apiFormData = new FormData();
        if (isPasswordRequiredByBackend && clientPasswordHash) {
            apiFormData.append('passwordHash', clientPasswordHash);
        } else if (isPasswordRequiredByBackend && !clientPasswordHash) {
            setError(t('error.passwordRequired'));
            setPasswordDialogContext('initial');
            setIsPasswordDialogOpen(true);
            setIsLoading(false);
            return;
        }
        apiFormData.append('apiBaseUrl', apiBaseUrl.trim());
        apiFormData.append('apiKey', apiKey.trim());
        apiFormData.append('adminUnlockToken', adminUnlockToken);
        apiFormData.append('mode', mode);

        // Add streaming parameters if enabled
        if (enableStreaming) {
            apiFormData.append('stream', 'true');
            apiFormData.append('partial_images', partialImages.toString());
        }

        if (mode === 'generate') {
            const genData = formData as GenerationFormData;
            effectiveGeneratePrompt = buildEnhancedPrompt(effectiveGeneratePrompt, genData);
            apiFormData.append('model', genModel);
            apiFormData.append('prompt', effectiveGeneratePrompt);
            apiFormData.append('n', genN[0].toString());
            const genSizeToSend =
                genSize === 'custom'
                    ? `${genCustomWidth}x${genCustomHeight}`
                    : (getPresetDimensions(genSize, genModel) ?? genSize);
            apiFormData.append('size', genSizeToSend);
            apiFormData.append('quality', genQuality);
            apiFormData.append('output_format', genOutputFormat);
            if (
                (genOutputFormat === 'jpeg' || genOutputFormat === 'webp') &&
                genData.output_compression !== undefined
            ) {
                apiFormData.append('output_compression', genData.output_compression.toString());
            }
            apiFormData.append('background', genBackground);
            apiFormData.append('moderation', genModeration);
            if (genData.enableCompatibilityParams) {
                if (typeof genData.seed === 'number' && Number.isFinite(genData.seed)) {
                    apiFormData.append('seed', String(Math.trunc(genData.seed)));
                }
                apiFormData.append('steps', String(genData.steps));
                apiFormData.append('guidance_scale', String(genData.guidanceScale));
                if (genData.sampler !== 'auto') {
                    apiFormData.append('sampler', genData.sampler);
                }
                if (genData.scheduler !== 'auto') {
                    apiFormData.append('scheduler', genData.scheduler);
                }
                if (genData.negativePrompt.trim()) {
                    apiFormData.append('negative_prompt', genData.negativePrompt.trim());
                }
            }
        } else {
            apiFormData.append('model', editModel);
            apiFormData.append('prompt', editPrompt);
            apiFormData.append('n', editN[0].toString());
            const editSizeToSend =
                editSize === 'custom'
                    ? `${editCustomWidth}x${editCustomHeight}`
                    : (getPresetDimensions(editSize, editModel) ?? editSize);
            apiFormData.append('size', editSizeToSend);
            apiFormData.append('quality', editQuality);

            editImageFiles.forEach((file, index) => {
                apiFormData.append(`image_${index}`, file, file.name);
            });
            if (editGeneratedMaskFile) {
                apiFormData.append('mask', editGeneratedMaskFile, editGeneratedMaskFile.name);
            }
        }

        try {
            const response = await fetch('/api/images', {
                method: 'POST',
                body: apiFormData
            });

            // Check if response is SSE (streaming)
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('text/event-stream')) {
                if (!response.body) {
                    throw new Error('Response body is null');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    // Process complete SSE events
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || ''; // Keep incomplete event in buffer

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonStr = line.slice(6);
                            try {
                                const event = JSON.parse(jsonStr);

                                if (event.type === 'partial_image') {
                                    // Update streaming preview with partial image
                                    const imageIndex = event.index ?? 0;
                                    const dataUrl = `data:image/png;base64,${event.b64_json}`;
                                    setStreamingPreviewImages((prev) => {
                                        const newMap = new Map(prev);
                                        newMap.set(imageIndex, dataUrl);
                                        return newMap;
                                    });
                                } else if (event.type === 'error') {
                                    throw new Error(event.error || 'Streaming error occurred');
                                } else if (event.type === 'done') {
                                    // Finalize with all completed images
                                    durationMs = Date.now() - startTime;

                                    if (event.images && event.images.length > 0) {
                                        let historyQuality: GenerationFormData['quality'] = 'auto';
                                        let historyBackground: GenerationFormData['background'] = 'auto';
                                        let historyModeration: GenerationFormData['moderation'] = 'auto';
                                        let historyOutputFormat: GenerationFormData['output_format'] = 'png';
                                        let historyPrompt: string = '';

                                        if (mode === 'generate') {
                                            historyQuality = genQuality;
                                            historyBackground = genBackground;
                                            historyModeration = genModeration;
                                            historyOutputFormat = genOutputFormat;
                                            historyPrompt = effectiveGeneratePrompt;
                                        } else {
                                            historyQuality = editQuality;
                                            historyBackground = 'auto';
                                            historyModeration = 'auto';
                                            historyOutputFormat = 'png';
                                            historyPrompt = editPrompt;
                                        }

                                        const currentModel = mode === 'generate' ? genModel : editModel;
                                        const costDetails = calculateApiCost(event.usage, currentModel);

                                        const batchTimestamp = Date.now();
                                        const newHistoryEntry: HistoryMetadata = {
                                            timestamp: batchTimestamp,
                                            images: event.images.map((img: { filename: string }) => ({
                                                filename: img.filename
                                            })),
                                            storageModeUsed: effectiveStorageModeClient,
                                            durationMs: durationMs,
                                            quality: historyQuality,
                                            background: historyBackground,
                                            moderation: historyModeration,
                                            output_format: historyOutputFormat,
                                            prompt: historyPrompt,
                                            mode: mode,
                                            costDetails: costDetails,
                                            model: currentModel
                                        };

                                        let newImageBatchPromises: Promise<{ path: string; filename: string } | null>[] =
                                            [];
                                        if (effectiveStorageModeClient === 'indexeddb') {
                                            newImageBatchPromises = event.images.map(async (img: ApiImageResponseItem) => {
                                                if (img.b64_json) {
                                                    try {
                                                        const byteCharacters = atob(img.b64_json);
                                                        const byteNumbers = new Array(byteCharacters.length);
                                                        for (let i = 0; i < byteCharacters.length; i++) {
                                                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                                                        }
                                                        const byteArray = new Uint8Array(byteNumbers);

                                                        const actualMimeType = getMimeTypeFromFormat(img.output_format);
                                                        const blob = new Blob([byteArray], { type: actualMimeType });

                                                        await db.images.put({ filename: img.filename, blob });

                                                        const blobUrl = URL.createObjectURL(blob);
                                                        blobUrlCacheRef.current.set(img.filename, blobUrl);

                                                        return { filename: img.filename, path: blobUrl };
                                                    } catch (dbError) {
                                                        console.error(
                                                            `Error saving blob ${img.filename} to IndexedDB:`,
                                                            dbError
                                                        );
                                                        setError(
                                                            `Failed to save image ${img.filename} to local database.`
                                                        );
                                                        return null;
                                                    }
                                                } else {
                                                    console.warn(
                                                        `Image ${img.filename} missing b64_json in indexeddb mode.`
                                                    );
                                                    return null;
                                                }
                                            });
                                        } else {
                                            newImageBatchPromises = event.images
                                                .filter((img: ApiImageResponseItem) => !!img.path)
                                                .map((img: ApiImageResponseItem) =>
                                                    Promise.resolve({
                                                        path: img.path!,
                                                        filename: img.filename
                                                    })
                                                );
                                        }

                                        const processedImages = (await Promise.all(newImageBatchPromises)).filter(
                                            Boolean
                                        ) as {
                                            path: string;
                                            filename: string;
                                        }[];

                                        setLatestImageBatch(processedImages);
                                        setImageOutputView(processedImages.length > 1 ? 'grid' : 0);
                                        setStreamingPreviewImages(new Map()); // Clear streaming previews

                                        setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
                                    }
                                }
                            } catch (parseError) {
                                console.error('Error parsing SSE event:', parseError);
                            }
                        }
                    }
                }

                return; // Exit early for streaming
            }

            // Non-streaming response handling (original code)
            const result = await response.json();

            if (!response.ok) {
                if (response.status === 401 && isPasswordRequiredByBackend) {
                    setError(t('error.unauthorized'));
                    setPasswordDialogContext('retry');
                    setLastApiCallArgs([formData]);
                    setIsPasswordDialogOpen(true);

                    return;
                }
                throw new Error(result.error || `${t('error.apiFailed')} ${response.status}`);
            }

            if (result.images && result.images.length > 0) {
                durationMs = Date.now() - startTime;

                let historyQuality: GenerationFormData['quality'] = 'auto';
                let historyBackground: GenerationFormData['background'] = 'auto';
                let historyModeration: GenerationFormData['moderation'] = 'auto';
                let historyOutputFormat: GenerationFormData['output_format'] = 'png';
                let historyPrompt: string = '';

                if (mode === 'generate') {
                    historyQuality = genQuality;
                    historyBackground = genBackground;
                    historyModeration = genModeration;
                    historyOutputFormat = genOutputFormat;
                    historyPrompt = effectiveGeneratePrompt;
                } else {
                    historyQuality = editQuality;
                    historyBackground = 'auto';
                    historyModeration = 'auto';
                    historyOutputFormat = 'png';
                    historyPrompt = editPrompt;
                }

                const currentModel = mode === 'generate' ? genModel : editModel;
                const costDetails = calculateApiCost(result.usage, currentModel);

                const batchTimestamp = Date.now();
                const newHistoryEntry: HistoryMetadata = {
                    timestamp: batchTimestamp,
                    images: result.images.map((img: { filename: string }) => ({ filename: img.filename })),
                    storageModeUsed: effectiveStorageModeClient,
                    durationMs: durationMs,
                    quality: historyQuality,
                    background: historyBackground,
                    moderation: historyModeration,
                    output_format: historyOutputFormat,
                    prompt: historyPrompt,
                    mode: mode,
                    costDetails: costDetails,
                    model: currentModel
                };

                let newImageBatchPromises: Promise<{ path: string; filename: string } | null>[] = [];
                if (effectiveStorageModeClient === 'indexeddb') {
                    newImageBatchPromises = result.images.map(async (img: ApiImageResponseItem) => {
                        if (img.b64_json) {
                            try {
                                const byteCharacters = atob(img.b64_json);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);

                                const actualMimeType = getMimeTypeFromFormat(img.output_format);
                                const blob = new Blob([byteArray], { type: actualMimeType });

                                await db.images.put({ filename: img.filename, blob });

                                const blobUrl = URL.createObjectURL(blob);
                                blobUrlCacheRef.current.set(img.filename, blobUrl);

                                return { filename: img.filename, path: blobUrl };
                            } catch (dbError) {
                                console.error(`Error saving blob ${img.filename} to IndexedDB:`, dbError);
                                setError(`Failed to save image ${img.filename} to local database.`);
                                return null;
                            }
                        } else {
                            console.warn(`Image ${img.filename} missing b64_json in indexeddb mode.`);
                            return null;
                        }
                    });
                } else {
                    newImageBatchPromises = result.images
                        .filter((img: ApiImageResponseItem) => !!img.path)
                        .map((img: ApiImageResponseItem) =>
                            Promise.resolve({
                                path: img.path!,
                                filename: img.filename
                            })
                        );
                }

                const processedImages = (await Promise.all(newImageBatchPromises)).filter(Boolean) as {
                    path: string;
                    filename: string;
                }[];

                setLatestImageBatch(processedImages);
                setImageOutputView(processedImages.length > 1 ? 'grid' : 0);

                setHistory((prevHistory) => [newHistoryEntry, ...prevHistory]);
            } else {
                setLatestImageBatch(null);
                throw new Error(t('error.noImageData'));
            }
        } catch (err: unknown) {
            durationMs = Date.now() - startTime;
            console.error(`API Call Error after ${durationMs}ms:`, err);
            const errorMessage = err instanceof Error ? err.message : t('error.unexpected');
            setError(errorMessage);
            setLatestImageBatch(null);
            setStreamingPreviewImages(new Map());
        } finally {
            if (durationMs === 0) durationMs = Date.now() - startTime;
            setIsLoading(false);
        }
    };

    const handleHistorySelect = React.useCallback(
        (item: HistoryMetadata) => {
            const originalStorageMode = item.storageModeUsed || 'fs';

            const selectedBatchPromises = item.images.map(async (imgInfo) => {
                let path: string | undefined;
                if (originalStorageMode === 'indexeddb') {
                    path = getImageSrc(imgInfo.filename);
                } else {
                    path = `/api/image/${imgInfo.filename}`;
                }

                if (path) {
                    return { path, filename: imgInfo.filename };
                } else {
                    console.warn(
                        `Could not get image source for history item: ${imgInfo.filename} (mode: ${originalStorageMode})`
                    );
                    setError(t('error.imageLoadFailed', { filename: imgInfo.filename }));
                    return null;
                }
            });

            Promise.all(selectedBatchPromises).then((resolvedBatch) => {
                const validImages = resolvedBatch.filter(Boolean) as { path: string; filename: string }[];

                if (validImages.length !== item.images.length) {
                    setError(t('error.someImagesMissing'));
                } else {
                    setError(null);
                }

                setLatestImageBatch(validImages.length > 0 ? validImages : null);
                setImageOutputView(validImages.length > 1 ? 'grid' : 0);
            });
        },
        [getImageSrc, t]
    );

    const handleClearHistory = React.useCallback(async () => {
        const confirmationMessage =
            effectiveStorageModeClient === 'indexeddb'
                ? t('confirm.clearHistoryIndexedDb')
                : t('confirm.clearHistory');

        if (window.confirm(confirmationMessage)) {
            setHistory([]);
            setLatestImageBatch(null);
            setImageOutputView('grid');
            setError(null);

            try {
                localStorage.removeItem('openaiImageHistory');

                if (effectiveStorageModeClient === 'indexeddb') {
                    await db.images.clear();
                    blobUrlCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
                    blobUrlCacheRef.current.clear();
                }
            } catch (e) {
                console.error('Failed during history clearing:', e);
                setError(`${t('error.clearHistoryFailed')}: ${e instanceof Error ? e.message : String(e)}`);
            }
        }
    }, [t]);

    const handleSendToEdit = async (filename: string) => {
        if (isSendingToEdit) return;
        setIsSendingToEdit(true);
        setError(null);

        const alreadyExists = editImageFiles.some((file) => file.name === filename);
        if (mode === 'edit' && alreadyExists) {
            setIsSendingToEdit(false);
            return;
        }

        if (mode === 'edit' && editImageFiles.length >= MAX_EDIT_IMAGES) {
            setError(t('error.tooManyEditImages', { count: MAX_EDIT_IMAGES }));
            setIsSendingToEdit(false);
            return;
        }

        try {
            let blob: Blob | undefined;
            let mimeType: string = 'image/png';

            if (effectiveStorageModeClient === 'indexeddb') {
                const record = allDbImages?.find((img) => img.filename === filename);
                if (record?.blob) {
                    blob = record.blob;
                    mimeType = blob.type || mimeType;
                } else {
                    throw new Error(t('error.imageNotFound', { filename }));
                }
            } else {
                const response = await fetch(`/api/image/${filename}`);
                if (!response.ok) {
                    throw new Error(`${t('error.fetchImageFailed')}: ${response.statusText}`);
                }
                blob = await response.blob();
                mimeType = response.headers.get('Content-Type') || mimeType;
            }

            if (!blob) {
                throw new Error(t('error.retrieveImageFailed', { filename }));
            }

            const newFile = new File([blob], filename, { type: mimeType });
            const newPreviewUrl = URL.createObjectURL(blob);

            editSourceImagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));

            setEditImageFiles([newFile]);
            setEditSourceImagePreviewUrls([newPreviewUrl]);

            if (mode === 'generate') {
                setMode('edit');
            }
        } catch (err: unknown) {
            console.error('Error sending image to edit:', err);
            const errorMessage = err instanceof Error ? err.message : t('error.sendToEditFailed');
            setError(errorMessage);
        } finally {
            setIsSendingToEdit(false);
        }
    };

    const executeDeleteItem = React.useCallback(
        async (item: HistoryMetadata) => {
            if (!item) return;
            setError(null);

            const { images: imagesInEntry, storageModeUsed, timestamp } = item;
            const filenamesToDelete = imagesInEntry.map((img) => img.filename);

            try {
                if (storageModeUsed === 'indexeddb') {
                    await db.images.where('filename').anyOf(filenamesToDelete).delete();
                    filenamesToDelete.forEach((fn) => {
                        const url = blobUrlCacheRef.current.get(fn);
                        if (url) URL.revokeObjectURL(url);
                        blobUrlCacheRef.current.delete(fn);
                    });
                } else if (storageModeUsed === 'fs') {
                    const apiPayload: { filenames: string[]; passwordHash?: string } = {
                        filenames: filenamesToDelete
                    };
                    if (isPasswordRequiredByBackend && clientPasswordHash) {
                        apiPayload.passwordHash = clientPasswordHash;
                    }

                    const response = await fetch('/api/image-delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(apiPayload)
                    });

                    const result = await response.json();
                    if (!response.ok) {
                        throw new Error(result.error || `API deletion failed with status ${response.status}`);
                    }
                }

                setHistory((prevHistory) => prevHistory.filter((h) => h.timestamp !== timestamp));
                setLatestImageBatch((prev) =>
                    prev && prev.some((img) => filenamesToDelete.includes(img.filename)) ? null : prev
                );
            } catch (e: unknown) {
                console.error('Error during item deletion:', e);
                setError(e instanceof Error ? e.message : t('error.deleteFailed'));
            } finally {
                setItemToDeleteConfirm(null);
            }
        },
        [isPasswordRequiredByBackend, clientPasswordHash, t]
    );

    const handleRequestDeleteItem = React.useCallback(
        (item: HistoryMetadata) => {
            if (!skipDeleteConfirmation) {
                setDialogCheckboxStateSkipConfirm(skipDeleteConfirmation);
                setItemToDeleteConfirm(item);
            } else {
                executeDeleteItem(item);
            }
        },
        [skipDeleteConfirmation, executeDeleteItem]
    );

    const handleConfirmDeletion = React.useCallback(() => {
        if (itemToDeleteConfirm) {
            executeDeleteItem(itemToDeleteConfirm);
            setSkipDeleteConfirmation(dialogCheckboxStateSkipConfirm);
        }
    }, [itemToDeleteConfirm, executeDeleteItem, dialogCheckboxStateSkipConfirm]);

    const handleCancelDeletion = React.useCallback(() => {
        setItemToDeleteConfirm(null);
    }, []);

    return (
        <main className='flex min-h-screen flex-col items-center bg-black p-4 text-white md:p-8 lg:p-12'>
            <PasswordDialog
                isOpen={isPasswordDialogOpen}
                onOpenChange={setIsPasswordDialogOpen}
                onSave={handleSavePassword}
                title={passwordDialogContext === 'retry' ? t('dialog.passwordRequired') : t('dialog.configurePassword')}
                description={
                    passwordDialogContext === 'retry'
                        ? t('dialog.passwordRetryDescription')
                        : t('dialog.passwordInitialDescription')
                }
            />
            {isAdminDialogOpen && (
                <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
                    <div className='w-full max-w-sm rounded-lg border border-white/10 bg-neutral-950 p-5 shadow-xl'>
                        <div className='mb-4'>
                            <h2 className='text-base font-medium text-white'>管理员解锁</h2>
                            <p className='mt-1 text-sm text-white/50'>输入管理员密码后，可以修改 API 地址。</p>
                        </div>
                        <div className='space-y-2'>
                            <Label htmlFor='admin-password' className='text-white'>
                                管理员密码
                            </Label>
                            <Input
                                id='admin-password'
                                type='password'
                                value={adminPassword}
                                onChange={(event) => setAdminPassword(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleAdminUnlock();
                                    }
                                }}
                                autoFocus
                                className='rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                            />
                            {adminUnlockError && <p className='text-sm text-red-300'>{adminUnlockError}</p>}
                        </div>
                        <div className='mt-5 flex justify-end gap-2'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => setIsAdminDialogOpen(false)}
                                className='border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                                取消
                            </Button>
                            <Button
                                type='button'
                                onClick={handleAdminUnlock}
                                disabled={isAdminUnlocking}
                                className='bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40'>
                                {isAdminUnlocking ? '解锁中...' : '解锁'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            <div className='w-full max-w-screen-2xl space-y-6'>
                <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
                    <div className='flex items-center gap-3'>
                        <div className='h-12 w-12 overflow-hidden rounded-xl border border-white/15 bg-white/5 p-1 shadow-sm'>
                            <Image
                                src='/xsp-logo.png'
                                alt='XSP Image Playground logo'
                                width={40}
                                height={40}
                                className='h-full w-full rounded-lg object-cover'
                                priority
                            />
                        </div>
                        <div>
                            <h1 className='text-xl font-semibold tracking-tight text-white'>XSP Image Playground</h1>
                            <p className='mt-1 text-sm text-white/50'>{t('app.subtitle')}</p>
                        </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-2'>
                        <ThemeToggle />
                        <LanguageToggle />
                    </div>
                </div>
                <section className='rounded-lg border border-white/10 bg-black p-4'>
                    <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                        <div className='space-y-1'>
                            <h2 className='text-base font-medium text-white'>{t('api.title')}</h2>
                            <p className='text-sm text-white/50'>{t('api.description')}</p>
                        </div>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            asChild
                            className='w-fit shrink-0 border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                            <a href={apiBaseLink} target='_blank' rel='noreferrer' title={apiBaseLink}>
                                <ExternalLink className='h-4 w-4' />
                                {t('api.open')}
                            </a>
                        </Button>
                    </div>
                    <div className='grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(220px,1fr)_auto]'>
                        <div className='space-y-1.5'>
                            <Label htmlFor='api-base-url' className='text-white'>
                                {t('api.baseUrl')}
                            </Label>
                            <Input
                                id='api-base-url'
                                value={apiBaseUrl}
                                onChange={(event) => setApiBaseUrl(event.target.value)}
                                placeholder={t('api.basePlaceholder')}
                                disabled={!isApiBaseUnlocked}
                                className='rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50 disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/5 disabled:text-white/50'
                            />
                            <div className='flex items-center justify-between gap-2'>
                                <p className='text-xs text-white/40'>
                                    {isApiBaseUnlocked ? '已解锁，可修改 API 地址。' : '默认 API 地址已锁定，仅管理员可修改。'}
                                </p>
                                <Button
                                    type='button'
                                    variant='outline'
                                    size='sm'
                                    onClick={isApiBaseUnlocked ? handleAdminLock : handleOpenAdminDialog}
                                    className='h-7 shrink-0 border-white/20 bg-black px-2 text-xs text-white/80 hover:bg-white/10 hover:text-white'>
                                    {isApiBaseUnlocked ? '锁定' : '解锁修改'}
                                </Button>
                            </div>
                        </div>
                        <div className='space-y-1.5'>
                            <Label htmlFor='api-key' className='text-white'>
                                {t('api.key')}
                            </Label>
                            <div className='flex gap-2'>
                                <Input
                                    id='api-key'
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(event) => setApiKey(event.target.value)}
                                    placeholder={t('api.keyPlaceholder')}
                                    className='rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                                />
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={() => setShowApiKey((value) => !value)}
                                    className='shrink-0 border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                                    {showApiKey ? t('api.hide') : t('api.show')}
                                </Button>
                            </div>
                        </div>
                        <div className='flex flex-col justify-end gap-2'>
                            <Button
                                type='button'
                                onClick={handleTestApiConnection}
                                disabled={apiConnectionStatus === 'testing'}
                                className='bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40'>
                                {apiConnectionStatus === 'testing' ? t('api.testing') : t('api.test')}
                            </Button>
                            <div
                                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm ${
                                    apiConnectionStatus === 'ok'
                                        ? 'border-green-500/40 bg-green-500/10 text-green-300'
                                        : apiConnectionStatus === 'bad'
                                          ? 'border-red-500/40 bg-red-500/10 text-red-300'
                                          : 'border-white/10 bg-white/5 text-white/50'
                                }`}>
                                <span
                                    className={`h-2.5 w-2.5 rounded-full ${
                                        apiConnectionStatus === 'ok'
                                            ? 'bg-green-400'
                                            : apiConnectionStatus === 'bad'
                                              ? 'bg-red-400'
                                              : apiConnectionStatus === 'testing'
                                                ? 'bg-yellow-300'
                                                : 'bg-white/30'
                                    }`}
                                />
                                <span>
                                    {apiConnectionStatus === 'ok'
                                        ? t('api.ok')
                                        : apiConnectionStatus === 'bad'
                                          ? t('api.bad')
                                          : apiConnectionStatus === 'testing'
                                            ? t('api.testing')
                                            : t('api.untested')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <p
                        className={`mt-3 text-xs ${
                            apiConnectionStatus === 'ok'
                                ? 'text-green-300'
                                : apiConnectionStatus === 'bad'
                                  ? 'text-red-300'
                                  : 'text-white/40'
                        }`}>
                        {apiConnectionMessage || t('api.savedLocal')}
                    </p>
                </section>
                <section className='rounded-lg border border-white/10 bg-black p-4'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                        <div className='flex items-start gap-3'>
                            <div className='mt-0.5 rounded-md border border-white/10 bg-white/5 p-2 text-white/80'>
                                <Bot className='h-5 w-5' />
                            </div>
                            <div>
                                <h2 className='text-base font-medium text-white'>需求分析助手</h2>
                                <p className='mt-1 text-sm text-white/50'>
                                    和语言模型聊清楚画面需求，点击生图时会自动总结对话并用于最终提示词。
                                </p>
                            </div>
                        </div>
                        <div className='flex flex-col gap-2 sm:flex-row sm:items-end'>
                            <div className='space-y-1.5'>
                                <Label htmlFor='assistant-model' className='text-xs text-white/60'>
                                    语言模型
                                </Label>
                                <Select
                                    value={assistantModel}
                                    onValueChange={setAssistantModel}
                                    disabled={isAssistantModelsLoading || assistantModels.length === 0}>
                                    <SelectTrigger
                                        id='assistant-model'
                                        className='h-9 w-full rounded-md border border-white/20 bg-black text-white focus:border-white/50 focus:ring-white/50 sm:w-56'>
                                        <SelectValue
                                            placeholder={isAssistantModelsLoading ? '正在获取模型...' : '选择语言模型'}
                                        />
                                    </SelectTrigger>
                                    <SelectContent className='max-h-72 border-white/20 bg-black text-white'>
                                        {assistantModels.map((model) => (
                                            <SelectItem key={model} value={model} className='focus:bg-white/10'>
                                                {model}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className={`text-xs ${assistantModelsError ? 'text-red-300' : 'text-white/40'}`}>
                                    {assistantModelsError ||
                                        (apiKey.trim()
                                            ? isAssistantModelsLoading
                                                ? '正在从当前 API 获取模型列表...'
                                                : `已获取 ${assistantModels.length} 个可选语言模型`
                                            : '填写 SK 后自动获取模型')}
                                </p>
                            </div>
                            <div className='flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2'>
                                <Checkbox
                                    id='assistant-auto-generate'
                                    checked={useAssistantForGeneration}
                                    onCheckedChange={(checked) => setUseAssistantForGeneration(!!checked)}
                                    className='border-white/40 data-[state=checked]:border-white data-[state=checked]:bg-white data-[state=checked]:text-black'
                                />
                                <Label htmlFor='assistant-auto-generate' className='cursor-pointer text-sm text-white/80'>
                                    生图时使用需求分析总结
                                </Label>
                            </div>
                        </div>
                    </div>

                    <div className='mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]'>
                        <div className='flex h-[460px] min-h-0 flex-col overflow-hidden rounded-md border border-white/10 bg-neutral-950 sm:h-[500px] lg:h-[540px]'>
                            <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
                                <div>
                                    <h3 className='text-sm font-medium text-white'>需求对话</h3>
                                    <p className='mt-0.5 text-xs text-white/40'>你一句，AI 一句，逐步把画面需求问清楚。</p>
                                </div>
                                <div className='rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50'>
                                    {assistantMessages.length} 条消息
                                </div>
                            </div>
                            <div className='min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.05),transparent_32%)] p-4'>
                                {assistantMessages.length === 0 ? (
                                    <div className='flex h-full min-h-[220px] items-center justify-center text-center'>
                                        <div className='max-w-md rounded-md border border-dashed border-white/15 bg-black/30 p-5'>
                                            <Bot className='mx-auto h-6 w-6 text-white/45' />
                                            <p className='mt-3 text-sm text-white/55'>
                                                先描述你想要的画面、用途、风格或参考方向，助手会像聊天一样继续追问。
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    assistantMessages.map((message, index) => (
                                        <div
                                            key={`${message.role}-${index}`}
                                            className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {message.role === 'assistant' && (
                                                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70'>
                                                    <Bot className='h-4 w-4' />
                                                </div>
                                            )}
                                            <div className={`max-w-[78%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                <div
                                                    className={`mb-1 text-xs ${
                                                        message.role === 'user' ? 'text-right text-white/45' : 'text-left text-white/45'
                                                    }`}>
                                                    {message.role === 'user' ? '我' : 'AI'}
                                                </div>
                                                <div
                                                    className={`whitespace-pre-wrap rounded-2xl border px-4 py-2.5 text-sm leading-6 shadow-sm ${
                                                        message.role === 'user'
                                                            ? 'rounded-br-md border-white/25 bg-white text-black'
                                                            : 'rounded-bl-md border-white/10 bg-black text-white/85'
                                                    }`}>
                                                    {message.content}
                                                </div>
                                            </div>
                                            {message.role === 'user' && (
                                                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium text-black'>
                                                    我
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                                {isAssistantLoading && (
                                    <div className='flex items-end gap-2'>
                                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70'>
                                            <Bot className='h-4 w-4' />
                                        </div>
                                        <div className='rounded-2xl rounded-bl-md border border-white/10 bg-black px-4 py-2.5 text-sm text-white/55'>
                                            <span className='inline-flex items-center gap-2'>
                                                <Loader2 className='h-4 w-4 animate-spin' />
                                                AI 正在回复...
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div ref={assistantMessagesEndRef} />
                            </div>
                            <div className='border-t border-white/10 p-3'>
                                <div className='flex flex-col gap-2 sm:flex-row'>
                                    <Textarea
                                        value={assistantInput}
                                        onChange={(event) => setAssistantInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                                                event.preventDefault();
                                                handleSendAssistantMessage();
                                            }
                                        }}
                                        placeholder='例如：我想做一张适合官网首屏的未来感生图，主体是 API 中转站，风格要高级但不要太花。'
                                        disabled={isAssistantLoading}
                                        className='min-h-[76px] rounded-md border border-white/20 bg-black text-white placeholder:text-white/40 focus:border-white/50 focus:ring-white/50'
                                    />
                                    <div className='flex gap-2 sm:w-28 sm:flex-col'>
                                        <Button
                                            type='button'
                                            onClick={handleSendAssistantMessage}
                                            disabled={isAssistantLoading || !assistantInput.trim()}
                                            className='flex-1 bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40'>
                                            <Send className='h-4 w-4' />
                                            发送
                                        </Button>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={handleClearAssistant}
                                            disabled={isAssistantLoading}
                                            className='flex-1 border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                                            <Trash2 className='h-4 w-4' />
                                            清空
                                        </Button>
                                    </div>
                                </div>
                                <p className='mt-2 text-xs text-white/40'>提示：Ctrl / Cmd + Enter 可快速发送。</p>
                                {assistantError && <p className='mt-2 text-sm text-red-300'>{assistantError}</p>}
                            </div>
                        </div>

                        <div className='rounded-md border border-white/10 bg-white/[0.03] p-4'>
                            <div className='flex items-center justify-between gap-3'>
                                <div>
                                    <h3 className='text-sm font-medium text-white'>创作摘要与最终提示词</h3>
                                    <p className='mt-1 text-xs text-white/45'>这里展示的是可读总结，不显示隐藏思维链。</p>
                                </div>
                                <Button
                                    type='button'
                                    variant='outline'
                                    onClick={handleSummarizeAssistant}
                                    disabled={isAssistantLoading || (!assistantMessages.length && !genPrompt.trim())}
                                    className='border-white/20 bg-black text-white/80 hover:bg-white/10 hover:text-white'>
                                    {isAssistantLoading ? (
                                        <Loader2 className='h-4 w-4 animate-spin' />
                                    ) : (
                                        <WandSparkles className='h-4 w-4' />
                                    )}
                                    总结需求
                                </Button>
                            </div>

                            <div className='mt-4 space-y-4'>
                                <div>
                                    <Label className='text-xs text-white/60'>摘要</Label>
                                    <div className='mt-1 h-[104px] overflow-y-auto overscroll-contain whitespace-pre-wrap rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-white/75'>
                                        {assistantResult?.requirementSummary || '总结后会显示主体、风格、构图、光线、限制和未确认信息。'}
                                    </div>
                                </div>
                                <div>
                                    <Label className='text-xs text-white/60'>生图提示词</Label>
                                    <div className='mt-1 h-[160px] overflow-y-auto overscroll-contain whitespace-pre-wrap rounded-md border border-white/10 bg-black p-3 text-sm leading-6 text-white/80'>
                                        {assistantResult?.finalPrompt || '这里会生成一段可以直接发送给图片 API 的最终提示词。'}
                                    </div>
                                </div>
                                {assistantResult?.assistantNote && (
                                    <div className='rounded-md border border-yellow-400/20 bg-yellow-400/10 p-3 text-sm text-yellow-100'>
                                        {assistantResult.assistantNote}
                                    </div>
                                )}
                                <Button
                                    type='button'
                                    onClick={handleApplyAssistantPrompt}
                                    disabled={!assistantResult?.finalPrompt}
                                    className='w-full bg-white text-black hover:bg-white/90 disabled:bg-white/10 disabled:text-white/40'>
                                    <ClipboardCheck className='h-4 w-4' />
                                    应用到左侧提示词
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
                    <div className='relative flex h-[70vh] min-h-[600px] flex-col lg:col-span-1'>
                        <div className={mode === 'generate' ? 'block h-full w-full' : 'hidden'}>
                            <GenerationForm
                                onSubmit={handleApiCall}
                                isLoading={isLoading}
                                currentMode={mode}
                                onModeChange={setMode}
                                isPasswordRequiredByBackend={isPasswordRequiredByBackend}
                                clientPasswordHash={clientPasswordHash}
                                onOpenPasswordDialog={handleOpenPasswordDialog}
                                model={genModel}
                                setModel={setGenModel}
                                prompt={genPrompt}
                                setPrompt={setGenPrompt}
                                n={genN}
                                setN={setGenN}
                                size={genSize}
                                setSize={setGenSize}
                                customWidth={genCustomWidth}
                                setCustomWidth={setGenCustomWidth}
                                customHeight={genCustomHeight}
                                setCustomHeight={setGenCustomHeight}
                                quality={genQuality}
                                setQuality={setGenQuality}
                                outputFormat={genOutputFormat}
                                setOutputFormat={setGenOutputFormat}
                                compression={genCompression}
                                setCompression={setGenCompression}
                                background={genBackground}
                                setBackground={setGenBackground}
                                moderation={genModeration}
                                setModeration={setGenModeration}
                                enableStreaming={enableStreaming}
                                setEnableStreaming={setEnableStreaming}
                                partialImages={partialImages}
                                setPartialImages={setPartialImages}
                                allowEmptyPrompt={useAssistantForGeneration && assistantMessages.length > 0}
                                promptEnhancement={genPromptEnhancement}
                                setPromptEnhancement={setGenPromptEnhancement}
                                negativePrompt={genNegativePrompt}
                                setNegativePrompt={setGenNegativePrompt}
                                stylePreset={genStylePreset}
                                setStylePreset={setGenStylePreset}
                                composition={genComposition}
                                setComposition={setGenComposition}
                                cameraAngle={genCameraAngle}
                                setCameraAngle={setGenCameraAngle}
                                lighting={genLighting}
                                setLighting={setGenLighting}
                                colorTone={genColorTone}
                                setColorTone={setGenColorTone}
                                detailLevel={genDetailLevel}
                                setDetailLevel={setGenDetailLevel}
                                enableCompatibilityParams={genEnableCompatibilityParams}
                                setEnableCompatibilityParams={setGenEnableCompatibilityParams}
                                seed={genSeed}
                                setSeed={setGenSeed}
                                steps={genSteps}
                                setSteps={setGenSteps}
                                guidanceScale={genGuidanceScale}
                                setGuidanceScale={setGenGuidanceScale}
                                sampler={genSampler}
                                setSampler={setGenSampler}
                                scheduler={genScheduler}
                                setScheduler={setGenScheduler}
                            />
                        </div>
                        <div className={mode === 'edit' ? 'block h-full w-full' : 'hidden'}>
                            <EditingForm
                                onSubmit={handleApiCall}
                                isLoading={isLoading || isSendingToEdit}
                                currentMode={mode}
                                onModeChange={setMode}
                                isPasswordRequiredByBackend={isPasswordRequiredByBackend}
                                clientPasswordHash={clientPasswordHash}
                                onOpenPasswordDialog={handleOpenPasswordDialog}
                                editModel={editModel}
                                setEditModel={setEditModel}
                                imageFiles={editImageFiles}
                                sourceImagePreviewUrls={editSourceImagePreviewUrls}
                                setImageFiles={setEditImageFiles}
                                setSourceImagePreviewUrls={setEditSourceImagePreviewUrls}
                                maxImages={MAX_EDIT_IMAGES}
                                editPrompt={editPrompt}
                                setEditPrompt={setEditPrompt}
                                editN={editN}
                                setEditN={setEditN}
                                editSize={editSize}
                                setEditSize={setEditSize}
                                editCustomWidth={editCustomWidth}
                                setEditCustomWidth={setEditCustomWidth}
                                editCustomHeight={editCustomHeight}
                                setEditCustomHeight={setEditCustomHeight}
                                editQuality={editQuality}
                                setEditQuality={setEditQuality}
                                editBrushSize={editBrushSize}
                                setEditBrushSize={setEditBrushSize}
                                editShowMaskEditor={editShowMaskEditor}
                                setEditShowMaskEditor={setEditShowMaskEditor}
                                editGeneratedMaskFile={editGeneratedMaskFile}
                                setEditGeneratedMaskFile={setEditGeneratedMaskFile}
                                editIsMaskSaved={editIsMaskSaved}
                                setEditIsMaskSaved={setEditIsMaskSaved}
                                editOriginalImageSize={editOriginalImageSize}
                                setEditOriginalImageSize={setEditOriginalImageSize}
                                editDrawnPoints={editDrawnPoints}
                                setEditDrawnPoints={setEditDrawnPoints}
                                editMaskPreviewUrl={editMaskPreviewUrl}
                                setEditMaskPreviewUrl={setEditMaskPreviewUrl}
                                enableStreaming={enableStreaming}
                                setEnableStreaming={setEnableStreaming}
                                partialImages={partialImages}
                                setPartialImages={setPartialImages}
                            />
                        </div>
                    </div>
                    <div className='flex h-[70vh] min-h-[600px] flex-col lg:col-span-1'>
                        {error && (
                            <Alert variant='destructive' className='mb-4 border-red-500/50 bg-red-900/20 text-red-300'>
                                <AlertTitle className='text-red-200'>{t('error.title')}</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <ImageOutput
                            imageBatch={latestImageBatch}
                            viewMode={imageOutputView}
                            onViewChange={setImageOutputView}
                            altText={t('output.generatedAlt')}
                            isLoading={isLoading || isSendingToEdit}
                            onSendToEdit={handleSendToEdit}
                            currentMode={mode}
                            baseImagePreviewUrl={editSourceImagePreviewUrls[0] || null}
                            streamingPreviewImages={streamingPreviewImages}
                        />
                    </div>
                </div>

                <div className='min-h-[450px]'>
                    <HistoryPanel
                        history={history}
                        onSelectImage={handleHistorySelect}
                        onClearHistory={handleClearHistory}
                        getImageSrc={getImageSrc}
                        onDeleteItemRequest={handleRequestDeleteItem}
                        itemPendingDeleteConfirmation={itemToDeleteConfirm}
                        onConfirmDeletion={handleConfirmDeletion}
                        onCancelDeletion={handleCancelDeletion}
                        deletePreferenceDialogValue={dialogCheckboxStateSkipConfirm}
                        onDeletePreferenceDialogChange={setDialogCheckboxStateSkipConfirm}
                    />
                </div>
            </div>
        </main>
    );
}
