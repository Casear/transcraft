// 批次大小限制测试和验证

// 模拟modelData中的一些关键模型进行测试
const testModels = [
    // OpenAI模型
    { api: 'openai', value: 'gpt-4.1', name: 'GPT-4.1', maxOutputTokens: 4096, contextWindow: 1000000 },
    { api: 'openai', value: 'gpt-4o-mini', name: 'GPT-4o Mini', maxOutputTokens: 4096, contextWindow: 128000 },
    
    // Claude模型
    { api: 'claude', value: 'claude-4-sonnet', name: 'Claude Sonnet 4', maxOutputTokens: 8192, contextWindow: 1000000 },
    { api: 'claude', value: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', maxOutputTokens: 128000, contextWindow: 200000 },
    
    // Gemini模型
    { api: 'gemini', value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', maxOutputTokens: 8192, contextWindow: 1000000 },
    { api: 'gemini', value: 'gemini-1.5-pro-002', name: 'Gemini 1.5 Pro', maxOutputTokens: 8192, contextWindow: 2000000 },
    
    // OpenRouter免费模型
    { api: 'openrouter', value: 'meta-llama/llama-4-scout:free', name: 'Llama 4 Scout (免費)', maxOutputTokens: 8192, contextWindow: 512000 },
    { api: 'openrouter', value: 'deepseek/deepseek-r1:free', name: 'DeepSeek R1 (免費)', maxOutputTokens: 8192, contextWindow: 128000 },
    
    // Ollama模型
    { api: 'ollama', value: 'llama3.3:70b', name: 'Llama 3.3 70B', maxOutputTokens: 8192, contextWindow: 128000 }
];

// 批次大小限制计算函数
function calculateBatchSizeLimit(model) {
    // 90%安全边际计算
    const safeOutputTokens = Math.floor(model.maxOutputTokens * 0.9);
    const maxAllowedBatchSize = Math.min(safeOutputTokens * 4, 60000); // 4字符/token
    
    return {
        model: model.name,
        api: model.api,
        originalOutputTokens: model.maxOutputTokens,
        safeOutputTokens: safeOutputTokens,
        maxBatchSizeChars: maxAllowedBatchSize,
        contextWindow: model.contextWindow
    };
}

// 生成测试结果
console.log('=== 批次大小限制测试结果 ===\n');
console.log('| 模型 | API | 原始输出 | 90%安全 | 最大批次字符 | 上下文窗口 |');
console.log('|------|-----|----------|---------|-------------|------------|');

testModels.forEach(model => {
    const result = calculateBatchSizeLimit(model);
    const contextK = result.contextWindow >= 1000000 ? 
        `${(result.contextWindow / 1000000).toFixed(1)}M` : 
        `${Math.round(result.contextWindow / 1000)}K`;
    
    console.log(`| ${result.model} | ${result.api} | ${result.originalOutputTokens} | ${result.safeOutputTokens} | ${result.maxBatchSizeChars} | ${contextK} |`);
});

console.log('\n=== 特殊情况分析 ===');

// 找出输出token限制最严格的模型
const strictestOutput = testModels.reduce((min, model) => 
    model.maxOutputTokens < min.maxOutputTokens ? model : min
);
console.log(`最严格输出限制: ${strictestOutput.name} (${strictestOutput.maxOutputTokens} tokens)`);

// 找出上下文窗口最大的模型
const largestContext = testModels.reduce((max, model) => 
    model.contextWindow > max.contextWindow ? model : max
);
console.log(`最大上下文窗口: ${largestContext.name} (${largestContext.contextWindow} tokens)`);

// Claude 3.7 Sonnet的特殊情况
const claude37 = testModels.find(m => m.value === 'claude-3-7-sonnet');
if (claude37) {
    const claude37Limit = calculateBatchSizeLimit(claude37);
    console.log(`\nClaude 3.7 Sonnet特殊情况:`);
    console.log(`- 原始输出限制: ${claude37.maxOutputTokens} tokens`);
    console.log(`- 90%安全输出: ${claude37Limit.safeOutputTokens} tokens`);
    console.log(`- 最大批次字符: ${claude37Limit.maxBatchSizeChars} 字符`);
    console.log(`- 注意: 这是唯一支持超大输出的模型，批次大小受60000字符上限约束`);
}

// 验证我们的实现逻辑
console.log('\n=== 验证实现逻辑 ===');
testModels.forEach(model => {
    const result = calculateBatchSizeLimit(model);
    // 验证批次大小不会导致翻译结果超出90%限制
    const estimatedTranslationTokens = result.maxBatchSizeChars / 4; // 假设翻译不会比原文更长
    const withinSafeLimit = estimatedTranslationTokens <= result.safeOutputTokens;
    
    console.log(`${model.name}: ${withinSafeLimit ? '✅' : '❌'} 批次大小安全 (${estimatedTranslationTokens} ≤ ${result.safeOutputTokens})`);
});

export { calculateBatchSizeLimit, testModels };