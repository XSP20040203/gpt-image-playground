export function normalizeOpenAICompatibleBaseUrl(value: unknown): string | undefined {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!raw) return undefined;

    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const trimmed = withProtocol.replace(/\/+$/, '');

    if (/\/v\d+$/i.test(trimmed)) {
        return trimmed;
    }

    return `${trimmed}/v1`;
}

