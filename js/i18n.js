// i18n.js - Internationalization system for TransCraft
// Supported languages: zh-TW (Traditional Chinese), en (English), ja (Japanese)

const messages = {
  // English - Default language
  'en': {
    // General
    'extension_name': 'TransCraft',
    'loading': 'Loading...',
    'saving': 'Saving...',
    'saved': 'Saved',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'close': 'Close',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'test': 'Test',
    'auto_adjust': 'Auto Adjust',

    // Options page
    'settings_title': 'TransCraft Settings',
    'select_translation_service': 'Select Translation Service',
    'translation_service': 'Translation Service',
    'please_select_service': 'Please select a service',
    'api_key_settings': 'API Key Settings',
    'please_select_service_first': 'Please select a translation service first, then configure the corresponding API Key',
    'get_from': 'Get from',
    'supports': 'Supports',
    'important_setup_steps': '⚠️ Important Setup Steps',
    'get_api_key': '1. Get API Key:',
    'configure_privacy': '2. Configure Privacy Settings:',
    'enable_model_training': '3. Enable Model Training:',
    'save_settings': '4. Save Settings:',
    'wait_for_effect': '5. Wait for Effect:',
    'setup_note': '💡 Note: If you don\'t enable prompt training, some free models won\'t work',
    'no_api_key_required': 'No API Key required (runs locally)',
    'please_ensure_ollama_running': 'Please ensure Ollama is installed and running on localhost:11434',
    'local_ai_private': 'Local AI model, completely private, no internet required',
    'quick_setup_guide': '📋 Quick Setup Guide',
    'download_install_ollama': 'Download and install Ollama',
    'run_ollama_serve': 'Open terminal and run: ollama serve',
    'download_model': 'Download model: ollama pull llama3.1:8b',
    'test_connection': 'Test connection: ollama list',
    'please_select_service': 'Please select a translation service',

    // Default settings
    'default_settings': 'Default Settings',
    'target_language': 'Target Language',
    'ai_model': 'AI Model',
    'please_select_service_for_models': 'Please select a translation service to view available AI models',

    // Languages
    'lang_zh_tw': 'Traditional Chinese',
    'lang_zh_cn': 'Simplified Chinese',
    'lang_en': 'English',
    'lang_ja': 'Japanese',
    'lang_ko': 'Korean',
    'lang_es': 'Spanish',
    'lang_fr': 'French',
    'lang_de': 'German',

    // Batch settings
    'translation_batch_settings': 'Translation Batch Settings',
    'batch_settings_desc': 'Adjust translation processing batch size, affects translation speed and API usage efficiency',
    'batch_max_chars': 'Batch Maximum Characters',
    'batch_max_chars_help': 'Maximum characters per translation request, range: 1000-60000. Click "Auto Adjust" to optimize batch size based on selected model',
    'batch_max_elements': 'Batch Maximum Elements',
    'batch_max_elements_help': 'Maximum number of elements per translation request, no upper limit, automatically controlled by character count',
    'request_timeout': 'Translation Request Timeout (seconds)',
    'request_timeout_help': 'Maximum wait time for a single translation request, recommended range: 30-60 seconds',
    'smaller_batches': 'Smaller Batches: Slower translation speed, but more stable, suitable for complex content',
    'larger_batches': 'Larger Batches: Faster translation speed, but may affect quality, suitable for simple content',

    // Expert mode
    'expert_mode_management': 'Expert Mode Management',
    'expert_mode_desc': 'Customize translation prompts for different types of content',
    'add_expert_mode': '+ Add Expert Mode',
    'edit_expert_mode': 'Edit Expert Mode',
    'add_expert_mode_title': 'Add Expert Mode',
    'mode_id': 'Mode ID',
    'mode_id_placeholder': 'e.g.: novel, technical, academic',
    'mode_id_help': 'Unique identifier, can only contain English letters, numbers and underscores',
    'mode_name': 'Mode Name',
    'mode_name_placeholder': 'e.g.: Novel Mode',
    'mode_description': 'Mode Description',
    'mode_description_placeholder': 'e.g.: Suitable for literary works translation, maintains literary style and emotional expression',
    'system_prompt': 'System Prompt',
    'system_prompt_placeholder': 'e.g.: You are a literary translator specializing in novels and creative works. Translate the following text to {targetLanguage}...',
    'system_prompt_help': 'Use {targetLanguage} as a placeholder for the target language',

    // Debug mode
    'debug_mode': '🐛 Debug Mode',
    'debug_mode_desc': 'Developer option - When enabled, detailed debug information will be displayed in the console',
    'enable_debug_mode': 'Enable Debug Mode',
    'debug_mode_help': 'When enabled, API requests/responses, translation process and other detailed information will be logged to browser console',
    'common_instructions_label': 'Common Translation Instructions',
    'common_instructions_help': 'These instructions will be automatically appended to all expert mode prompts. Changes take effect immediately.',
    'common_instructions_placeholder': 'Enter common translation instructions that will be appended to all expert modes...',
    'reset_to_default': 'Reset to Default',
    'apply_changes': 'Apply Changes',

    // Language settings
    'language_settings': 'Language Settings',
    'language_settings_desc': 'Select the interface language for the extension',
    'interface_language': 'Interface Language',

    // Buttons
    'save_settings_btn': 'Save Settings',
    'test_connection_btn': 'Test Connection',

    // Messages
    'settings_saved': 'Settings saved successfully',
    'connection_test_success': 'Connection test successful',
    'connection_test_failed': 'Connection test failed',
    'please_set_api_key': 'Please set API Key',
    'connected_to': 'Connected to',

    // Translation UI
    'translate_page': 'Translate Page',
    'translating': 'Translating...',
    'restore_original': 'Restore Original',
    'translation_failed': 'Translation failed',
    'auto_translate': 'Auto-translate',
    'auto_translate_enabled': 'Left click: Translate page | Right click: Turn off auto-translate',
    'auto_translate_disabled': 'Left click: Translate page | Right click: Turn on auto-translate',
    'cannot_translate_on_page': 'Cannot translate on this page',
    'translation_mode': 'Translation Mode',
    'checking': 'Checking...',
    'settings': 'Settings',

    // Error messages
    'api_key_error': 'API Key error',
    'quota_exceeded': 'API quota exceeded',
    'network_error': 'Network error',
    'extension_context_invalid': 'Extension context invalid, please reload',
    'translation_error': 'Translation Error',
    'gemini_max_tokens': 'Gemini response exceeds token limit, please reduce translation content or adjust batch size',
    'gemini_safety_block': 'Gemini refused to translate this content for safety reasons',
    'gemini_no_translation': 'Gemini response contains no translation text',
    
    // Language detection
    'enable_language_detection': 'Enable Language Detection',
    'language_detection': 'Language Detection',
    'language_detection_desc': 'Automatically detect source language and skip translation if it matches the target language',
    'translation_skipped': 'Translation Skipped',
    'content_already_in_target_language': 'Content is already in target language',
    'detected_language': 'Detected language',
    'language_detection_help': 'When enabled, the extension will detect the source language and skip translation if it\'s already in the target language',
    
    // Placeholder messages for dynamic content
    'translation_partial_error': 'Successfully translated $1 elements, $2 elements failed to translate.<br>This may be due to network issues or API limitations.'
  },

  // Traditional Chinese
  'zh-TW': {
    // General
    'extension_name': 'TransCraft',
    'loading': '載入中...',
    'saving': '儲存中...',
    'saved': '已儲存',
    'error': '錯誤',
    'success': '成功',
    'cancel': '取消',
    'save': '儲存',
    'close': '關閉',
    'delete': '刪除',
    'edit': '編輯',
    'add': '新增',
    'test': '測試',
    'auto_adjust': '自動調整',

    // Options page
    'settings_title': 'TransCraft 設定',
    'select_translation_service': '選擇翻譯服務',
    'translation_service': '翻譯服務',
    'please_select_service': '請選擇服務',
    'api_key_settings': 'API Key 設定',
    'please_select_service_first': '請先選擇翻譯服務，然後設定對應的 API Key',
    'get_from': '從',
    'supports': '支援',
    'important_setup_steps': '⚠️ 重要設定步驟',
    'get_api_key': '1. 獲取 API Key：',
    'configure_privacy': '2. 配置隱私設定：',
    'enable_model_training': '3. 啟用模型訓練：',
    'save_settings': '4. 保存設定：',
    'wait_for_effect': '5. 等待生效：',
    'setup_note': '💡 注意：如果不啟用 prompt training，某些免費模型將無法使用',
    'no_api_key_required': '無需 API Key（本地運行）',
    'please_ensure_ollama_running': '請確認 Ollama 已安裝並運行在 localhost:11434',
    'local_ai_private': '本地 AI 模型，完全私密，無需網路連線',
    'quick_setup_guide': '📋 快速設定指南',
    'download_install_ollama': '下載並安裝 Ollama',
    'run_ollama_serve': '開啟終端機執行：ollama serve',
    'download_model': '下載模型：ollama pull llama3.1:8b',
    'test_connection': '測試連接：ollama list',
    'please_select_service': '請先選擇翻譯服務',

    // Default settings
    'default_settings': '預設設定',
    'target_language': '目標語言',
    'ai_model': 'AI 模型',
    'please_select_service_for_models': '請先選擇翻譯服務以查看可用的 AI 模型',

    // Languages
    'lang_zh_tw': '繁體中文',
    'lang_zh_cn': '簡體中文',
    'lang_en': '英文',
    'lang_ja': '日文',
    'lang_ko': '韓文',
    'lang_es': '西班牙文',
    'lang_fr': '法文',
    'lang_de': '德文',

    // Batch settings
    'translation_batch_settings': '翻譯批次設定',
    'batch_settings_desc': '調整翻譯處理的批次大小，影響翻譯速度和 API 使用效率',
    'batch_max_chars': '批次最大字元數',
    'batch_max_chars_help': '單次翻譯請求的最大字元數，範圍：1000-60000。點擊「自動調整」根據所選模型優化批次大小',
    'batch_max_elements': '批次最大元素數',
    'batch_max_elements_help': '單次翻譯請求的最大元素數量，無上限限制，由字元數自動控制',
    'request_timeout': '翻譯請求超時時間（秒）',
    'request_timeout_help': '單次翻譯請求的最長等待時間，建議範圍：30-60 秒',
    'smaller_batches': '較小批次：翻譯速度較慢，但更穩定，適合複雜內容',
    'larger_batches': '較大批次：翻譯速度較快，但可能影響品質，適合簡單內容',

    // Expert mode
    'expert_mode_management': '專家模式管理',
    'expert_mode_desc': '自定義不同類型內容的翻譯提示詞',
    'add_expert_mode': '+ 新增專家模式',
    'edit_expert_mode': '編輯專家模式',
    'add_expert_mode_title': '新增專家模式',
    'mode_id': '模式 ID',
    'mode_id_placeholder': '例如: novel, technical, academic',
    'mode_id_help': '唯一識別碼，只能包含英文字母、數字和底線',
    'mode_name': '模式名稱',
    'mode_name_placeholder': '例如: 小說模式',
    'mode_description': '模式描述',
    'mode_description_placeholder': '例如: 適合文學作品翻譯，保持文學性和情感表達',
    'system_prompt': '系統提示詞',
    'system_prompt_placeholder': '例如: You are a literary translator specializing in novels and creative works. Translate the following text to {targetLanguage}...',
    'system_prompt_help': '使用 {targetLanguage} 作為目標語言的佔位符',

    // Debug mode
    'debug_mode': '🐛 除錯模式',
    'debug_mode_desc': '開發者選項 - 開啟後會在控制台顯示詳細的除錯資訊',
    'enable_debug_mode': '啟用除錯模式',
    'debug_mode_help': '開啟後會記錄 API 請求/回應、翻譯過程等詳細資訊到瀏覽器控制台',
    'common_instructions_label': '共用翻譯指示',
    'common_instructions_help': '這些指示會自動附加到所有專家模式的提示中。更改會立即生效。',
    'common_instructions_placeholder': '輸入會附加到所有專家模式的共用翻譯指示...',
    'reset_to_default': '重置為預設值',
    'apply_changes': '套用變更',

    // Language settings
    'language_settings': '語言設定',
    'language_settings_desc': '選擇擴展介面的顯示語言',
    'interface_language': '介面語言',

    // Buttons
    'save_settings_btn': '儲存設定',
    'test_connection_btn': '測試連接',

    // Messages
    'settings_saved': '設定儲存成功',
    'connection_test_success': '連接測試成功',
    'connection_test_failed': '連接測試失敗',
    'please_set_api_key': '請設定 API Key',
    'connected_to': '已連接',

    // Translation UI
    'translate_page': '翻譯此頁面',
    'translating': '翻譯中...',
    'restore_original': '恢復原文',
    'translation_failed': '翻譯失敗',
    'auto_translate': '自動翻譯',
    'auto_translate_enabled': '左鍵：翻譯頁面 | 右鍵：關閉自動翻譯',
    'auto_translate_disabled': '左鍵：翻譯頁面 | 右鍵：開啟自動翻譯',
    'cannot_translate_on_page': '無法在此頁面上執行翻譯',
    'translation_mode': '翻譯模式',
    'checking': '檢查中...',
    'settings': '設定',

    // Error messages
    'api_key_error': 'API Key 錯誤',
    'quota_exceeded': 'API 配額超過',
    'network_error': '網路錯誤',
    'extension_context_invalid': '擴展上下文無效，請重新載入',
    'translation_error': '翻譯錯誤',
    'gemini_max_tokens': 'Gemini 回應超過 token 限制，請減少翻譯內容量或調整批次大小',
    'gemini_safety_block': 'Gemini 因安全原因拒絕翻譯此內容',
    'gemini_no_translation': 'Gemini 回應中沒有翻譯文本',
    
    // Language detection
    'enable_language_detection': '啟用語言檢測',
    'language_detection': '語言檢測',
    'language_detection_desc': '自動檢測來源語言，如果與目標語言相同則跳過翻譯',
    'translation_skipped': '翻譯已跳過',
    'content_already_in_target_language': '內容已經是目標語言',
    'detected_language': '檢測到的語言',
    'language_detection_help': '啟用後，擴展會檢測來源語言，如果已經是目標語言則跳過翻譯',
    
    // Placeholder messages for dynamic content
    'translation_partial_error': '成功翻譯 $1 個元素，$2 個元素翻譯失敗。<br>可能是因為網路問題或 API 限制。'
  },

  // Japanese
  'ja': {
    // General
    'extension_name': 'TransCraft',
    'loading': '読み込み中...',
    'saving': '保存中...',
    'saved': '保存されました',
    'error': 'エラー',
    'success': '成功',
    'cancel': 'キャンセル',
    'save': '保存',
    'close': '閉じる',
    'delete': '削除',
    'edit': '編集',
    'add': '追加',
    'test': 'テスト',
    'auto_adjust': '自動調整',

    // Options page
    'settings_title': 'TransCraft 設定',
    'select_translation_service': '翻訳サービスの選択',
    'translation_service': '翻訳サービス',
    'please_select_service': 'サービスを選択してください',
    'api_key_settings': 'API キー設定',
    'please_select_service_first': 'まず翻訳サービスを選択してから、対応するAPIキーを設定してください',
    'get_from': '取得元：',
    'supports': 'サポート：',
    'important_setup_steps': '⚠️ 重要な設定手順',
    'get_api_key': '1. API キーの取得：',
    'configure_privacy': '2. プライバシー設定の構成：',
    'enable_model_training': '3. モデルトレーニングを有効にする：',
    'save_settings': '4. 設定を保存：',
    'wait_for_effect': '5. 効果を待つ：',
    'setup_note': '💡 注意：プロンプトトレーニングを有効にしないと、一部の無料モデルが使用できません',
    'no_api_key_required': 'API キーは不要（ローカル実行）',
    'please_ensure_ollama_running': 'Ollama がインストールされ、localhost:11434 で実行されていることを確認してください',
    'local_ai_private': 'ローカル AI モデル、完全にプライベート、インターネット接続不要',
    'quick_setup_guide': '📋 クイック設定ガイド',
    'download_install_ollama': 'Ollama をダウンロードしてインストール',
    'run_ollama_serve': 'ターミナルを開いて実行：ollama serve',
    'download_model': 'モデルをダウンロード：ollama pull llama3.1:8b',
    'test_connection': '接続をテスト：ollama list',
    'please_select_service': 'まず翻訳サービスを選択してください',

    // Default settings
    'default_settings': 'デフォルト設定',
    'target_language': 'ターゲット言語',
    'ai_model': 'AI モデル',
    'please_select_service_for_models': '利用可能な AI モデルを表示するには、まず翻訳サービスを選択してください',

    // Languages
    'lang_zh_tw': '繁体中国語',
    'lang_zh_cn': '簡体中国語',
    'lang_en': '英語',
    'lang_ja': '日本語',
    'lang_ko': '韓国語',
    'lang_es': 'スペイン語',
    'lang_fr': 'フランス語',
    'lang_de': 'ドイツ語',

    // Batch settings
    'translation_batch_settings': '翻訳バッチ設定',
    'batch_settings_desc': '翻訳処理のバッチサイズを調整し、翻訳速度とAPI使用効率に影響します',
    'batch_max_chars': 'バッチ最大文字数',
    'batch_max_chars_help': '一回の翻訳リクエストの最大文字数、範囲：1000-60000。「自動調整」をクリックして選択されたモデルに基づいてバッチサイズを最適化',
    'batch_max_elements': 'バッチ最大要素数',
    'batch_max_elements_help': '一回の翻訳リクエストの最大要素数、上限なし、文字数により自動制御',
    'request_timeout': '翻訳リクエストタイムアウト（秒）',
    'request_timeout_help': '単一翻訳リクエストの最大待機時間、推奨範囲：30-60秒',
    'smaller_batches': '小さなバッチ：翻訳速度は遅いが、より安定、複雑なコンテンツに適している',
    'larger_batches': '大きなバッチ：翻訳速度は速いが、品質に影響する可能性、シンプルなコンテンツに適している',

    // Expert mode
    'expert_mode_management': 'エキスパートモード管理',
    'expert_mode_desc': '異なるタイプのコンテンツに対して翻訳プロンプトをカスタマイズ',
    'add_expert_mode': '+ エキスパートモードを追加',
    'edit_expert_mode': 'エキスパートモードを編集',
    'add_expert_mode_title': 'エキスパートモードを追加',
    'mode_id': 'モード ID',
    'mode_id_placeholder': '例：novel, technical, academic',
    'mode_id_help': '一意の識別子、英文字、数字、アンダースコアのみ使用可能',
    'mode_name': 'モード名',
    'mode_name_placeholder': '例：小説モード',
    'mode_description': 'モードの説明',
    'mode_description_placeholder': '例：文学作品の翻訳に適しており、文学性と感情表現を維持',
    'system_prompt': 'システムプロンプト',
    'system_prompt_placeholder': '例：You are a literary translator specializing in novels and creative works. Translate the following text to {targetLanguage}...',
    'system_prompt_help': 'ターゲット言語のプレースホルダーとして {targetLanguage} を使用',

    // Debug mode
    'debug_mode': '🐛 デバッグモード',
    'debug_mode_desc': '開発者オプション - 有効にすると、詳細なデバッグ情報がコンソールに表示されます',
    'enable_debug_mode': 'デバッグモードを有効にする',
    'debug_mode_help': '有効にすると、APIリクエスト/レスポンス、翻訳プロセスなどの詳細情報がブラウザコンソールに記録されます',
    'common_instructions_label': '共通翻訳指示',
    'common_instructions_help': 'これらの指示は、すべてのエキスパートモードのプロンプトに自動的に追加されます。変更は即座に有効になります。',
    'common_instructions_placeholder': 'すべてのエキスパートモードに追加される共通翻訳指示を入力...',
    'reset_to_default': 'デフォルトにリセット',
    'apply_changes': '変更を適用',

    // Language settings
    'language_settings': '言語設定',
    'language_settings_desc': '拡張機能のインターフェース言語を選択',
    'interface_language': 'インターフェース言語',

    // Buttons
    'save_settings_btn': '設定を保存',
    'test_connection_btn': '接続をテスト',

    // Messages
    'settings_saved': '設定が正常に保存されました',
    'connection_test_success': '接続テストが成功しました',
    'connection_test_failed': '接続テストが失敗しました',
    'please_set_api_key': 'API キーを設定してください',
    'connected_to': '接続済み',

    // Translation UI
    'translate_page': 'このページを翻訳',
    'translating': '翻訳中...',
    'restore_original': '元のテキストに戻す',
    'translation_failed': '翻訳に失敗しました',
    'auto_translate': '自動翻訳',
    'auto_translate_enabled': '左クリック：ページを翻訳 | 右クリック：自動翻訳をオフ',
    'auto_translate_disabled': '左クリック：ページを翻訳 | 右クリック：自動翻訳をオン',
    'cannot_translate_on_page': 'このページでは翻訳を実行できません',
    'translation_mode': '翻訳モード',
    'checking': 'チェック中...',
    'settings': '設定',

    // Error messages
    'api_key_error': 'API キーエラー',
    'quota_exceeded': 'API クォータを超過',
    'network_error': 'ネットワークエラー',
    'extension_context_invalid': '拡張機能のコンテキストが無効です。リロードしてください',
    'translation_error': '翻訳エラー',
    'gemini_max_tokens': 'Gemini のレスポンスがトークン制限を超えています。翻訳内容を減らすかバッチサイズを調整してください',
    'gemini_safety_block': 'Gemini は安全上の理由でこのコンテンツの翻訳を拒否しました',
    'gemini_no_translation': 'Gemini のレスポンスに翻訳テキストが含まれていません',
    
    // Language detection
    'enable_language_detection': '言語検出を有効にする',
    'language_detection': '言語検出',
    'language_detection_desc': 'ソース言語を自動検出し、ターゲット言語と同じ場合は翻訳をスキップ',
    'translation_skipped': '翻訳をスキップしました',
    'content_already_in_target_language': 'コンテンツは既にターゲット言語です',
    'detected_language': '検出された言語',
    'language_detection_help': '有効にすると、拡張機能がソース言語を検出し、ターゲット言語と同じ場合は翻訳をスキップします',
    
    // Placeholder messages for dynamic content
    'translation_partial_error': '$1 個の要素の翻訳に成功し、$2 個の要素の翻訳に失敗しました。<br>ネットワークの問題やAPI制限が原因の可能性があります。'
  }
};

// Current language - defaults to English
let currentLanguage = 'en';

// Initialize i18n system
async function initI18n() {
  try {
    const result = await chrome.storage.sync.get(['interfaceLanguage']);
    currentLanguage = result.interfaceLanguage || 'en';
  } catch (error) {
    console.warn('Failed to load interface language, using default (en):', error);
    currentLanguage = 'en';
  }
}

// Get localized message
function getMessage(key, substitutions = []) {
  const langMessages = messages[currentLanguage] || messages['en'];
  let message = langMessages[key] || messages['en'][key] || key;
  
  // Handle substitutions
  if (substitutions.length > 0) {
    substitutions.forEach((sub, index) => {
      message = message.replace(`$${index + 1}`, sub);
    });
  }
  
  return message;
}

// Set language
async function setLanguage(lang) {
  if (!messages[lang]) {
    console.warn(`Language ${lang} not supported, using English`);
    lang = 'en';
  }
  
  currentLanguage = lang;
  
  try {
    await chrome.storage.sync.set({ interfaceLanguage: lang });
  } catch (error) {
    console.warn('Failed to save interface language:', error);
  }
}

// Get current language
function getCurrentLanguage() {
  return currentLanguage;
}

// Get available languages
function getAvailableLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'ja', name: '日本語' }
  ];
}

// For use in different contexts
if (typeof window !== 'undefined') {
  // Browser context
  window.i18n = {
    initI18n,
    getMessage,
    setLanguage,
    getCurrentLanguage,
    getAvailableLanguages
  };
} else if (typeof self !== 'undefined') {
  // Service Worker context
  self.i18n = {
    initI18n,
    getMessage,
    setLanguage,
    getCurrentLanguage,
    getAvailableLanguages
  };
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initI18n,
    getMessage,
    setLanguage,
    getCurrentLanguage,
    getAvailableLanguages
  };
}