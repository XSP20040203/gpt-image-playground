'use client';

import * as React from 'react';

export type Language = 'en' | 'zh';

type TranslationKey =
    | 'app.title'
    | 'app.subtitle'
    | 'app.language'
    | 'app.english'
    | 'app.chinese'
    | 'api.title'
    | 'api.description'
    | 'api.baseUrl'
    | 'api.basePlaceholder'
    | 'api.key'
    | 'api.keyPlaceholder'
    | 'api.show'
    | 'api.hide'
    | 'api.savedLocal'
    | 'api.test'
    | 'api.testing'
    | 'api.untested'
    | 'api.ok'
    | 'api.bad'
    | 'api.missingKey'
    | 'api.modelsFound'
    | 'api.open'
    | 'mode.generate'
    | 'mode.edit'
    | 'form.generateTitle'
    | 'form.generateDescription'
    | 'form.editTitle'
    | 'form.editDescription'
    | 'form.model'
    | 'form.selectModel'
    | 'form.enableStreaming'
    | 'form.streamingDisabled'
    | 'form.streamingHelp'
    | 'form.previewImages'
    | 'form.previewCost'
    | 'form.prompt'
    | 'form.generatePromptPlaceholder'
    | 'form.editPromptPlaceholder'
    | 'form.numberOfImages'
    | 'form.size'
    | 'form.auto'
    | 'form.custom'
    | 'form.square'
    | 'form.landscape'
    | 'form.portrait'
    | 'form.width'
    | 'form.height'
    | 'form.pixels'
    | 'form.ofMax'
    | 'form.ratio'
    | 'form.constraints'
    | 'form.quality'
    | 'form.low'
    | 'form.medium'
    | 'form.high'
    | 'form.background'
    | 'form.opaque'
    | 'form.transparent'
    | 'form.outputFormat'
    | 'form.compression'
    | 'form.moderation'
    | 'form.generate'
    | 'form.generating'
    | 'form.edit'
    | 'form.editing'
    | 'form.configurePassword'
    | 'form.sourceImages'
    | 'form.browse'
    | 'form.noFile'
    | 'form.filesSelected'
    | 'form.mask'
    | 'form.closeMaskEditor'
    | 'form.editSavedMask'
    | 'form.createMask'
    | 'form.saved'
    | 'form.maskHelp'
    | 'form.brushSize'
    | 'form.uploadMask'
    | 'form.clear'
    | 'form.saveMask'
    | 'form.maskPreview'
    | 'form.maskPreviewGenerating'
    | 'form.maskSaved'
    | 'form.maskApplied'
    | 'form.image2Tooltip'
    | 'output.streaming'
    | 'output.editing'
    | 'output.generating'
    | 'output.displayError'
    | 'output.empty'
    | 'output.showGrid'
    | 'output.selectImage'
    | 'output.thumbnail'
    | 'output.sendToEdit'
    | 'output.generatedAlt'
    | 'history.title'
    | 'history.totalCost'
    | 'history.totalCostSummary'
    | 'history.totalCostDescription'
    | 'history.totalImages'
    | 'history.averageCost'
    | 'history.totalEstimatedCost'
    | 'history.clear'
    | 'history.empty'
    | 'history.viewBatch'
    | 'history.previewForBatch'
    | 'history.editBadge'
    | 'history.createBadge'
    | 'history.costBreakdown'
    | 'history.costBreakdownDescription'
    | 'history.pricingFor'
    | 'history.textInput'
    | 'history.imageInput'
    | 'history.imageOutput'
    | 'history.time'
    | 'history.model'
    | 'history.quality'
    | 'history.bg'
    | 'history.mod'
    | 'history.showPrompt'
    | 'history.prompt'
    | 'history.promptDescription'
    | 'history.noPrompt'
    | 'history.copy'
    | 'history.copied'
    | 'history.close'
    | 'history.deleteItem'
    | 'history.confirmDeletion'
    | 'history.deleteDescription'
    | 'history.dontAsk'
    | 'history.cancel'
    | 'history.delete'
    | 'dialog.passwordRequired'
    | 'dialog.configurePassword'
    | 'dialog.passwordRetryDescription'
    | 'dialog.passwordInitialDescription'
    | 'dialog.passwordPlaceholder'
    | 'dialog.save'
    | 'error.title'
    | 'error.emptyPassword'
    | 'error.hashFailed'
    | 'error.passwordRequired'
    | 'error.unauthorized'
    | 'error.apiFailed'
    | 'error.noImageData'
    | 'error.unexpected'
    | 'error.imageSaveFailed'
    | 'error.imageLoadFailed'
    | 'error.someImagesMissing'
    | 'error.clearHistoryFailed'
    | 'error.tooManyEditImages'
    | 'error.imageNotFound'
    | 'error.fetchImageFailed'
    | 'error.retrieveImageFailed'
    | 'error.sendToEditFailed'
    | 'error.deleteFailed'
    | 'confirm.clearHistory'
    | 'confirm.clearHistoryIndexedDb'
    | 'alert.pasteMax'
    | 'alert.selectUpTo'
    | 'alert.invalidMaskType'
    | 'alert.maskDimensionMismatch'
    | 'alert.maskLoadFailed'
    | 'alert.selectImageToEdit'
    | 'alert.saveMaskBeforeSubmit';

const translations: Record<Language, Record<TranslationKey, string>> = {
    en: {
        'app.title': 'XSP Image Playground',
        'app.subtitle': 'Generate and edit images with OpenAI-compatible image APIs.',
        'app.language': 'Language',
        'app.english': 'English',
        'app.chinese': '中文',
        'api.title': 'API Connection',
        'api.description': 'The API base URL uses the default endpoint. Only an administrator can unlock and modify it.',
        'api.baseUrl': 'API Base URL',
        'api.basePlaceholder': 'https://api.xsp2api.top/v1',
        'api.key': 'API Key / SK',
        'api.keyPlaceholder': 'sk-...',
        'api.show': 'Show',
        'api.hide': 'Hide',
        'api.savedLocal': 'Saved locally in your browser',
        'api.test': 'Test',
        'api.testing': 'Testing...',
        'api.untested': 'Not tested',
        'api.ok': 'Connected',
        'api.bad': 'Failed',
        'api.missingKey': 'Fill API Key / SK first.',
        'api.modelsFound': '{count} models found, {imageCount} image-like models',
        'api.open': 'Open API',
        'mode.generate': 'Generate',
        'mode.edit': 'Edit',
        'form.generateTitle': 'Generate Image',
        'form.generateDescription': 'Create a new image from a text prompt.',
        'form.editTitle': 'Edit Image',
        'form.editDescription': 'Edit a source image with a prompt.',
        'form.model': 'Model',
        'form.selectModel': 'Select model',
        'form.enableStreaming': 'Enable Streaming',
        'form.streamingDisabled': 'Streaming is only supported when generating a single image (n=1).',
        'form.streamingHelp': 'Shows partial preview images as they are generated.',
        'form.previewImages': 'Preview Images',
        'form.previewCost': 'Each preview image adds ~$0.003 to the cost (100 additional output tokens).',
        'form.prompt': 'Prompt',
        'form.generatePromptPlaceholder': 'e.g., A photorealistic cat astronaut floating in space',
        'form.editPromptPlaceholder': 'e.g., Add a party hat to the main subject',
        'form.numberOfImages': 'Number of Images',
        'form.size': 'Size',
        'form.auto': 'Auto',
        'form.custom': 'Custom',
        'form.square': 'Square',
        'form.landscape': 'Landscape',
        'form.portrait': 'Portrait',
        'form.width': 'Width (px)',
        'form.height': 'Height (px)',
        'form.pixels': 'pixels',
        'form.ofMax': 'of max',
        'form.ratio': 'ratio',
        'form.constraints': 'Constraints: multiples of 16, max edge 3840px, aspect ratio <= 3:1, 655,360 to 8,294,400 total pixels.',
        'form.quality': 'Quality',
        'form.low': 'Low',
        'form.medium': 'Medium',
        'form.high': 'High',
        'form.background': 'Background',
        'form.opaque': 'Opaque',
        'form.transparent': 'Transparent',
        'form.outputFormat': 'Output Format',
        'form.compression': 'Compression',
        'form.moderation': 'Moderation Level',
        'form.generate': 'Generate',
        'form.generating': 'Generating...',
        'form.edit': 'Edit Image',
        'form.editing': 'Editing...',
        'form.configurePassword': 'Configure Password',
        'form.sourceImages': 'Source Image(s) [Max: 10]',
        'form.browse': 'Browse...',
        'form.noFile': 'No file selected.',
        'form.filesSelected': 'files selected',
        'form.mask': 'Mask',
        'form.closeMaskEditor': 'Close Mask Editor',
        'form.editSavedMask': 'Edit Saved Mask',
        'form.createMask': 'Create Mask',
        'form.saved': 'Saved',
        'form.maskHelp': 'Draw on the image below to mark areas for editing. Drawn areas become transparent in the mask.',
        'form.brushSize': 'Brush Size',
        'form.uploadMask': 'Upload Mask',
        'form.clear': 'Clear',
        'form.saveMask': 'Save Mask',
        'form.maskPreview': 'Generated Mask Preview:',
        'form.maskPreviewGenerating': 'Generating mask preview...',
        'form.maskSaved': 'Mask saved successfully!',
        'form.maskApplied': 'Mask applied',
        'form.image2Tooltip': 'gpt-image-2 always processes reference images at high fidelity. This improves edit quality but uses more input image tokens per request than gpt-image-1.5 default fidelity.',
        'output.streaming': 'Streaming...',
        'output.editing': 'Editing image...',
        'output.generating': 'Generating image...',
        'output.displayError': 'Error displaying image.',
        'output.empty': 'Your generated image will appear here.',
        'output.showGrid': 'Show grid view',
        'output.selectImage': 'Select image',
        'output.thumbnail': 'Thumbnail',
        'output.sendToEdit': 'Send to Edit',
        'output.generatedAlt': 'Generated image output',
        'history.title': 'History',
        'history.totalCost': 'Total Cost',
        'history.totalCostSummary': 'Total Cost Summary',
        'history.totalCostDescription': 'A summary of the total estimated cost for all generated images in the history.',
        'history.totalImages': 'Total Images Generated',
        'history.averageCost': 'Average Cost Per Image',
        'history.totalEstimatedCost': 'Total Estimated Cost',
        'history.clear': 'Clear',
        'history.empty': 'Generated images will appear here.',
        'history.viewBatch': 'View image batch from',
        'history.previewForBatch': 'Preview for batch generated at',
        'history.editBadge': 'Edit',
        'history.createBadge': 'Create',
        'history.costBreakdown': 'Cost Breakdown',
        'history.costBreakdownDescription': 'Estimated cost breakdown for this image generation.',
        'history.pricingFor': 'Pricing for',
        'history.textInput': 'Text Input',
        'history.imageInput': 'Image Input',
        'history.imageOutput': 'Image Output',
        'history.time': 'Time',
        'history.model': 'Model',
        'history.quality': 'Quality',
        'history.bg': 'BG',
        'history.mod': 'Mod',
        'history.showPrompt': 'Show Prompt',
        'history.prompt': 'Prompt',
        'history.promptDescription': 'The full prompt used to generate this image batch.',
        'history.noPrompt': 'No prompt recorded.',
        'history.copy': 'Copy',
        'history.copied': 'Copied!',
        'history.close': 'Close',
        'history.deleteItem': 'Delete history item',
        'history.confirmDeletion': 'Confirm Deletion',
        'history.deleteDescription': 'Are you sure you want to delete this history entry? This will remove {count} image(s). This action cannot be undone.',
        'history.dontAsk': "Don't ask me again",
        'history.cancel': 'Cancel',
        'history.delete': 'Delete',
        'dialog.passwordRequired': 'Password Required',
        'dialog.configurePassword': 'Configure Password',
        'dialog.passwordRetryDescription': 'The server requires a password, or the previous one was incorrect. Please enter it to continue.',
        'dialog.passwordInitialDescription': 'Set a password to use for API requests.',
        'dialog.passwordPlaceholder': 'Enter your password',
        'dialog.save': 'Save',
        'error.title': 'Error',
        'error.emptyPassword': 'Password cannot be empty.',
        'error.hashFailed': 'Failed to save password due to a hashing error.',
        'error.passwordRequired': 'Password is required. Please configure the password by clicking the lock icon.',
        'error.unauthorized': 'Unauthorized: Invalid or missing password. Please try again.',
        'error.apiFailed': 'API request failed with status',
        'error.noImageData': 'API response did not contain valid image data or filenames.',
        'error.unexpected': 'An unexpected error occurred.',
        'error.imageSaveFailed': 'Failed to save image {filename} to local database.',
        'error.imageLoadFailed': 'Image {filename} could not be loaded.',
        'error.someImagesMissing': 'Some images from this history entry could not be loaded. They might have been cleared or are missing.',
        'error.clearHistoryFailed': 'Failed to clear history',
        'error.tooManyEditImages': 'Cannot add more than {count} images to the edit form.',
        'error.imageNotFound': 'Image {filename} not found in local database.',
        'error.fetchImageFailed': 'Failed to fetch image',
        'error.retrieveImageFailed': 'Could not retrieve image data for {filename}.',
        'error.sendToEditFailed': 'Failed to send image to edit form.',
        'error.deleteFailed': 'An unexpected error occurred during deletion.',
        'confirm.clearHistory': 'Are you sure you want to clear the entire image history? This cannot be undone.',
        'confirm.clearHistoryIndexedDb': 'Are you sure you want to clear the entire image history? In IndexedDB mode, this will also permanently delete all stored images. This cannot be undone.',
        'alert.pasteMax': 'Cannot paste: Maximum of {count} images reached.',
        'alert.selectUpTo': 'You can only select up to {count} images.',
        'alert.invalidMaskType': 'Invalid file type. Please upload a PNG file for the mask.',
        'alert.maskDimensionMismatch': 'Mask dimensions ({mask}) must match the source image dimensions ({source}).',
        'alert.maskLoadFailed': 'Failed to load the uploaded mask image to check dimensions.',
        'alert.selectImageToEdit': 'Please select at least one image to edit.',
        'alert.saveMaskBeforeSubmit': 'Please save the mask you have drawn before submitting.'
    },
    zh: {
        'app.title': 'XSP Image Playground',
        'app.subtitle': '通过兼容 OpenAI 的图片接口生成和编辑图片。',
        'app.language': '语言',
        'app.english': 'English',
        'app.chinese': '中文',
        'api.title': 'API 连接',
        'api.description': 'API 地址默认使用内置地址，仅管理员解锁后可以修改。',
        'api.baseUrl': 'API 地址',
        'api.basePlaceholder': 'https://api.xsp2api.top/v1',
        'api.key': 'API Key / SK',
        'api.keyPlaceholder': 'sk-...',
        'api.show': '显示',
        'api.hide': '隐藏',
        'api.savedLocal': '已保存在当前浏览器本地',
        'api.test': '测试连接',
        'api.testing': '测试中...',
        'api.untested': '未测试',
        'api.ok': '可用',
        'api.bad': '不可用',
        'api.missingKey': '请先填写 API Key / SK。',
        'api.modelsFound': '发现 {count} 个模型，其中 {imageCount} 个像生图模型',
        'api.open': '打开 API',
        'mode.generate': '生成',
        'mode.edit': '编辑',
        'form.generateTitle': '生成图片',
        'form.generateDescription': '用文字提示词创建新图片。',
        'form.editTitle': '编辑图片',
        'form.editDescription': '用文字提示词编辑参考图。',
        'form.model': '模型',
        'form.selectModel': '选择模型',
        'form.enableStreaming': '开启流式预览',
        'form.streamingDisabled': '流式预览只支持一次生成 1 张图片。',
        'form.streamingHelp': '生成过程中显示阶段性预览图。',
        'form.previewImages': '预览图数量',
        'form.previewCost': '每张预览图约增加 $0.003 成本（额外 100 个输出 token）。',
        'form.prompt': '提示词',
        'form.generatePromptPlaceholder': '例如：一只写实风格的宇航员猫漂浮在太空中',
        'form.editPromptPlaceholder': '例如：给主体加上一顶派对帽',
        'form.numberOfImages': '图片数量',
        'form.size': '尺寸',
        'form.auto': '自动',
        'form.custom': '自定义',
        'form.square': '方图',
        'form.landscape': '横图',
        'form.portrait': '竖图',
        'form.width': '宽度（px）',
        'form.height': '高度（px）',
        'form.pixels': '像素',
        'form.ofMax': '上限',
        'form.ratio': '比例',
        'form.constraints': '限制：宽高需为 16 的倍数，单边最大 3840px，宽高比 <= 3:1，总像素 655,360 到 8,294,400。',
        'form.quality': '质量',
        'form.low': '低',
        'form.medium': '中',
        'form.high': '高',
        'form.background': '背景',
        'form.opaque': '不透明',
        'form.transparent': '透明',
        'form.outputFormat': '输出格式',
        'form.compression': '压缩',
        'form.moderation': '审核级别',
        'form.generate': '生成',
        'form.generating': '生成中...',
        'form.edit': '编辑图片',
        'form.editing': '编辑中...',
        'form.configurePassword': '配置访问密码',
        'form.sourceImages': '参考图片（最多 10 张）',
        'form.browse': '选择...',
        'form.noFile': '未选择文件。',
        'form.filesSelected': '个文件已选择',
        'form.mask': '蒙版',
        'form.closeMaskEditor': '关闭蒙版编辑器',
        'form.editSavedMask': '编辑已保存蒙版',
        'form.createMask': '创建蒙版',
        'form.saved': '已保存',
        'form.maskHelp': '在下方图片上涂抹需要编辑的区域，涂抹区域会在蒙版中变为透明。',
        'form.brushSize': '画笔大小',
        'form.uploadMask': '上传蒙版',
        'form.clear': '清除',
        'form.saveMask': '保存蒙版',
        'form.maskPreview': '生成的蒙版预览：',
        'form.maskPreviewGenerating': '正在生成蒙版预览...',
        'form.maskSaved': '蒙版已保存！',
        'form.maskApplied': '已应用蒙版',
        'form.image2Tooltip': 'gpt-image-2 会以高保真方式处理参考图，编辑质量更好，但每次请求会消耗更多图片输入 token。',
        'output.streaming': '流式生成中...',
        'output.editing': '正在编辑图片...',
        'output.generating': '正在生成图片...',
        'output.displayError': '图片显示出错。',
        'output.empty': '生成结果会显示在这里。',
        'output.showGrid': '显示网格视图',
        'output.selectImage': '选择图片',
        'output.thumbnail': '缩略图',
        'output.sendToEdit': '发送到编辑',
        'output.generatedAlt': '生成图片结果',
        'history.title': '历史记录',
        'history.totalCost': '总成本',
        'history.totalCostSummary': '总成本摘要',
        'history.totalCostDescription': '历史记录中所有生成图片的预估总成本摘要。',
        'history.totalImages': '已生成图片数',
        'history.averageCost': '平均每张成本',
        'history.totalEstimatedCost': '预估总成本',
        'history.clear': '清空',
        'history.empty': '生成的图片会显示在这里。',
        'history.viewBatch': '查看图片批次',
        'history.previewForBatch': '图片批次预览',
        'history.editBadge': '编辑',
        'history.createBadge': '创建',
        'history.costBreakdown': '成本明细',
        'history.costBreakdownDescription': '本次图片生成的预估成本明细。',
        'history.pricingFor': '计价模型',
        'history.textInput': '文本输入',
        'history.imageInput': '图片输入',
        'history.imageOutput': '图片输出',
        'history.time': '耗时',
        'history.model': '模型',
        'history.quality': '质量',
        'history.bg': '背景',
        'history.mod': '审核',
        'history.showPrompt': '查看提示词',
        'history.prompt': '提示词',
        'history.promptDescription': '生成这批图片时使用的完整提示词。',
        'history.noPrompt': '没有记录提示词。',
        'history.copy': '复制',
        'history.copied': '已复制！',
        'history.close': '关闭',
        'history.deleteItem': '删除历史项',
        'history.confirmDeletion': '确认删除',
        'history.deleteDescription': '确定要删除这条历史记录吗？这会删除 {count} 张图片，且无法撤销。',
        'history.dontAsk': '不再询问',
        'history.cancel': '取消',
        'history.delete': '删除',
        'dialog.passwordRequired': '需要访问密码',
        'dialog.configurePassword': '配置访问密码',
        'dialog.passwordRetryDescription': '服务端要求访问密码，或上一次密码不正确。请输入密码后继续。',
        'dialog.passwordInitialDescription': '设置用于 API 请求的访问密码。',
        'dialog.passwordPlaceholder': '输入访问密码',
        'dialog.save': '保存',
        'error.title': '错误',
        'error.emptyPassword': '密码不能为空。',
        'error.hashFailed': '保存密码失败，哈希计算出错。',
        'error.passwordRequired': '需要访问密码。请点击锁图标配置密码。',
        'error.unauthorized': '未授权：密码无效或缺失，请重试。',
        'error.apiFailed': 'API 请求失败，状态码',
        'error.noImageData': 'API 响应中没有可用图片数据或文件名。',
        'error.unexpected': '发生了未知错误。',
        'error.imageSaveFailed': '保存图片 {filename} 到本地数据库失败。',
        'error.imageLoadFailed': '图片 {filename} 无法加载。',
        'error.someImagesMissing': '这条历史记录中的部分图片无法加载，可能已被清理或丢失。',
        'error.clearHistoryFailed': '清空历史记录失败',
        'error.tooManyEditImages': '编辑表单最多只能添加 {count} 张图片。',
        'error.imageNotFound': '本地数据库中找不到图片 {filename}。',
        'error.fetchImageFailed': '拉取图片失败',
        'error.retrieveImageFailed': '无法读取图片 {filename} 的数据。',
        'error.sendToEditFailed': '发送图片到编辑表单失败。',
        'error.deleteFailed': '删除时发生未知错误。',
        'confirm.clearHistory': '确定要清空所有图片历史记录吗？此操作无法撤销。',
        'confirm.clearHistoryIndexedDb': '确定要清空所有图片历史记录吗？在 IndexedDB 模式下，这也会永久删除所有已存储图片。此操作无法撤销。',
        'alert.pasteMax': '无法粘贴：最多只能添加 {count} 张图片。',
        'alert.selectUpTo': '最多只能选择 {count} 张图片。',
        'alert.invalidMaskType': '文件类型无效。请上传 PNG 格式蒙版。',
        'alert.maskDimensionMismatch': '蒙版尺寸（{mask}）必须与源图尺寸（{source}）一致。',
        'alert.maskLoadFailed': '无法加载上传的蒙版图片来检查尺寸。',
        'alert.selectImageToEdit': '请至少选择一张要编辑的图片。',
        'alert.saveMaskBeforeSubmit': '请先保存你绘制的蒙版再提交。'
    }
};

type I18nValueMap = Record<string, string | number>;

const uiPhraseMap = new Map<string, string>([
    ['Generate Image', '生成图片'],
    ['Create a new image from a text prompt.', '用文字提示词创建新图片。'],
    ['Edit Image', '编辑图片'],
    ['Edit a source image with a prompt.', '用文字提示词编辑参考图。'],
    ['Generate', '生成'],
    ['Edit', '编辑'],
    ['Model', '模型'],
    ['Enable Streaming', '开启流式预览'],
    ['Preview Images', '预览图数量'],
    ['Prompt', '提示词'],
    ['Size', '尺寸'],
    ['Auto', '自动'],
    ['Custom', '自定义'],
    ['Square', '方图'],
    ['Landscape', '横图'],
    ['Portrait', '竖图'],
    ['Width (px)', '宽度（px）'],
    ['Height (px)', '高度（px）'],
    ['Quality', '质量'],
    ['Low', '低'],
    ['Medium', '中'],
    ['High', '高'],
    ['Background', '背景'],
    ['Opaque', '不透明'],
    ['Transparent', '透明'],
    ['Output Format', '输出格式'],
    ['Moderation Level', '审核级别'],
    ['Generating...', '生成中...'],
    ['Editing...', '编辑中...'],
    ['Source Image(s) [Max: 10]', '参考图片（最多 10 张）'],
    ['No file selected.', '未选择文件。'],
    ['Browse...', '选择...'],
    ['Mask', '蒙版'],
    ['Close Mask Editor', '关闭蒙版编辑器'],
    ['Edit Saved Mask', '编辑已保存蒙版'],
    ['Create Mask', '创建蒙版'],
    ['(Saved)', '（已保存）'],
    ['Upload Mask', '上传蒙版'],
    ['Clear', '清除'],
    ['Save Mask', '保存蒙版'],
    ['Generated Mask Preview:', '生成的蒙版预览：'],
    ['Generating mask preview...', '正在生成蒙版预览...'],
    ['Mask saved successfully!', '蒙版已保存！'],
    ['Streaming...', '流式生成中...'],
    ['Editing image...', '正在编辑图片...'],
    ['Generating image...', '正在生成图片...'],
    ['Error displaying image.', '图片显示出错。'],
    ['Your generated image will appear here.', '生成结果会显示在这里。'],
    ['Send to Edit', '发送到编辑'],
    ['History', '历史记录'],
    ['Generated images will appear here.', '生成的图片会显示在这里。'],
    ['Clear', '清空'],
    ['Total Cost Summary', '总成本摘要'],
    ['Total Images Generated:', '已生成图片数：'],
    ['Average Cost Per Image:', '平均每张成本：'],
    ['Total Estimated Cost:', '预估总成本：'],
    ['Cost Breakdown', '成本明细'],
    ['Show Prompt', '查看提示词'],
    ['No prompt recorded.', '没有记录提示词。'],
    ['Copy', '复制'],
    ['Copied!', '已复制！'],
    ['Close', '关闭'],
    ['Confirm Deletion', '确认删除'],
    ["Don't ask me again", '不再询问'],
    ['Cancel', '取消'],
    ['Delete', '删除'],
    ['Error', '错误'],
    ['Configure Password', '配置访问密码'],
    ['Password Required', '需要访问密码'],
    ['Save', '保存']
]);

const reverseUiPhraseMap = new Map(Array.from(uiPhraseMap, ([en, zh]) => [zh, en]));

const placeholderMap = new Map<string, string>([
    ['e.g., A photorealistic cat astronaut floating in space', '例如：一只写实风格的宇航员猫漂浮在太空中'],
    ['e.g., Add a party hat to the main subject', '例如：给主体加上一顶派对帽'],
    ['Enter your password', '输入访问密码']
]);

const reversePlaceholderMap = new Map(Array.from(placeholderMap, ([en, zh]) => [zh, en]));

type I18nContextValue = {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey, values?: I18nValueMap) => string;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

function format(template: string, values?: I18nValueMap) {
    if (!values) return template;
    return Object.entries(values).reduce(
        (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
        template
    );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = React.useState<Language>('zh');

    React.useEffect(() => {
        const stored = localStorage.getItem('imagePlaygroundLanguage');
        if (stored === 'en' || stored === 'zh') {
            setLanguageState(stored);
        }
    }, []);

    React.useEffect(() => {
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
        localStorage.setItem('imagePlaygroundLanguage', language);
    }, [language]);

    React.useEffect(() => {
        const phraseMap = language === 'zh' ? uiPhraseMap : reverseUiPhraseMap;
        const placeholders = language === 'zh' ? placeholderMap : reversePlaceholderMap;

        const translateNode = (node: Node) => {
            node.childNodes.forEach((child) => {
                if (child.nodeType === Node.TEXT_NODE && child.textContent) {
                    const original = child.textContent;
                    const trimmed = original.trim();
                    const translated = phraseMap.get(trimmed);
                    if (translated) {
                        child.textContent = original.replace(trimmed, translated);
                    } else if (trimmed.startsWith('Number of Images:')) {
                        child.textContent = original.replace('Number of Images:', translations.zh['form.numberOfImages'] + ':');
                    } else if (trimmed.startsWith('图片数量:') && language === 'en') {
                        child.textContent = original.replace('图片数量:', translations.en['form.numberOfImages'] + ':');
                    } else if (trimmed.startsWith('Compression:')) {
                        child.textContent = original.replace('Compression:', translations.zh['form.compression'] + ':');
                    } else if (trimmed.startsWith('压缩:') && language === 'en') {
                        child.textContent = original.replace('压缩:', translations.en['form.compression'] + ':');
                    }
                    return;
                }

                if (child.nodeType === Node.ELEMENT_NODE) {
                    const element = child as HTMLElement;
                    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
                        const translatedPlaceholder = placeholders.get(element.placeholder);
                        if (translatedPlaceholder) {
                            element.placeholder = translatedPlaceholder;
                        }
                    }
                    translateNode(child);
                }
            });
        };

        const applyTranslations = () => translateNode(document.body);
        applyTranslations();
        const observer = new MutationObserver(applyTranslations);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [language]);

    const value = React.useMemo<I18nContextValue>(
        () => ({
            language,
            setLanguage: setLanguageState,
            t: (key, values) => format(translations[language][key] ?? translations.en[key] ?? key, values)
        }),
        [language]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    const context = React.useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within LanguageProvider');
    }
    return context;
}
