/**
 * AI JSON清洗处理模块
 * 
 * 用于清洗和解析AI大模型返回的JSON字符串
 * 解决各种格式问题：代码块标记、坏字符、换行符等
 * 
 * 支持不同大模型返回的JSON格式
 */

/**
 * 清洗JSON字符串中的坏字符
 * 移除控制字符、BOM、零宽字符等
 * 
 * @param {string} str - 原始字符串
 * @returns {string} 清洗后的字符串
 */
function cleanJsonString(str) {
  let result = str
  
  // 移除所有控制字符（保留 \n, \r, \t）
  // \u0000-\u0008: NULL到退格
  // \u000B-\u000C: 垂直制表符和换页符
  // \u000E-\u001F: Shift Out到US
  // \u007F: DEL字符
  result = result.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
  
  // 移除BOM（Byte Order Mark）
  result = result.replace(/^\uFEFF/, '')
  
  // 移除零宽字符
  // \u200B: 零宽空格
  // \u200C: 零宽不连字
  // \u200D: 零宽连字
  // \uFEFF: 零宽无断空格（也是BOM）
  result = result.replace(/[\u200B-\u200D\uFEFF]/g, '')
  
  // 移除软连字符
  result = result.replace(/\u00AD/g, '')
  
  // 移除反引号（防止Markdown代码块残留）
  result = result.replace(/`/g, '')
  
  // 移除其他可能的坏字符
  // \u0080-\u009F: C1控制字符
  result = result.replace(/[\u0080-\u009F]/g, '')
  
  // 移除替换字符（通常表示解码错误）
  result = result.replace(/\uFFFD/g, '')
  
  return result
}

/**
 * 修复JSON字符串中的换行问题
 * 将字符串值中的换行符转换为 \n 转义序列
 * 
 * @param {string} str - 原始JSON字符串
 * @returns {string} 修复后的JSON字符串
 */
function fixJsonStringWithNewlines(str) {
  const firstBrace = str.indexOf('{')
  const lastBrace = str.lastIndexOf('}')
  
  if (firstBrace === -1 || lastBrace === -1) return str
  
  let result = str.substring(0, firstBrace + 1)
  let inString = false
  let escapeNext = false
  
  for (let i = firstBrace + 1; i < lastBrace; i++) {
    const char = str[i]
    
    if (escapeNext) {
      result += char
      escapeNext = false
      continue
    }
    
    if (char === '\\') {
      result += char
      escapeNext = true
      continue
    }
    
    if (char === '"') {
      inString = !inString
      result += char
      continue
    }
    
    // 在字符串值内部，将换行符转换为 \n
    if (inString && (char === '\n' || char === '\r')) {
      result += '\\n'
      continue
    }
    
    result += char
  }
  
  result += str.substring(lastBrace)
  return result
}

/**
 * 移除Markdown代码块标记
 * 
 * @param {string} str - 原始字符串
 * @returns {string} 移除代码块标记后的字符串
 */
function removeMarkdownCodeBlocks(str) {
  let result = str
  
  // 移除开头的 ```json 或 ```javascript 等标记
  result = result.replace(/^```(?:json|javascript|js)?\s*/, '')
  
  // 移除结尾的 ``` 标记
  result = result.replace(/```\s*$/, '')
  
  return result.trim()
}

/**
 * 提取JSON片段
 * 从字符串中提取第一个完整的JSON对象
 * 
 * @param {string} str - 原始字符串
 * @returns {string|null} 提取的JSON字符串，如果未找到则返回null
 */
function extractJsonFragment(str) {
  const jsonMatch = str.match(/\{[\s\S]*\}/)
  return jsonMatch ? jsonMatch[0] : null
}

/**
 * 修复JSON中的常见格式问题
 * 
 * @param {string} str - 原始JSON字符串
 * @returns {string} 修复后的JSON字符串
 */
function fixCommonJsonIssues(str) {
  let result = str
  
  // 修复尾随逗号（例如：{"a":1,} -> {"a":1}）
  result = result.replace(/,\s*([}\]])/g, '$1')
  
  // 修复未加引号的键（例如：{a:1} -> {"a":1}）
  result = result.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
  
  // 修复单引号（例如：{'a':1} -> {"a":1}）
  result = result.replace(/'/g, '"')
  
  return result
}

/**
 * 主要的AI响应解析函数
 * 
 * 处理流程：
 * 1. 移除Markdown代码块标记
 * 2. 修复JSON字符串中的换行
 * 3. 清洗坏字符
 * 4. 尝试直接解析
 * 5. 如果失败，提取JSON片段后重试
 * 
 * @param {string} content - AI返回的原始内容
 * @param {Object} options - 配置选项
 * @param {boolean} options.enableCommonFixes - 是否启用常见格式问题修复（默认：false）
 * @param {boolean} options.verbose - 是否输出详细日志（默认：false）
 * @returns {Object} 解析后的JSON对象
 * @throws {Error} 如果解析失败则抛出错误
 */
function parseAIResponse(content, options = {}) {
  const { enableCommonFixes = false, verbose = false } = options
  
  try {
    if (verbose) {
      console.log('=== 开始解析AI响应 ===')
      console.log('原始内容长度:', content.length)
    }
    
    // 步骤1：移除Markdown代码块标记
    let processedContent = removeMarkdownCodeBlocks(content)
    
    if (verbose) {
      console.log('去除代码块标记后长度:', processedContent.length)
    }
    
    // 步骤2：修复JSON字符串中的换行问题
    let fixedContent = fixJsonStringWithNewlines(processedContent)
    
    if (verbose) {
      console.log('修复换行后长度:', fixedContent.length)
    }
    
    // 步骤3：清洗坏字符
    let cleanedContent = cleanJsonString(fixedContent)
    
    if (verbose) {
      console.log('清洗后内容长度:', cleanedContent.length)
    }
    
    // 步骤4：尝试直接解析JSON
    try {
      const result = JSON.parse(cleanedContent)
      if (verbose) console.log('✅ 直接解析成功')
      return result
    } catch (e1) {
      if (verbose) console.log('直接解析失败:', e1.message)
      
      // 步骤5：提取JSON部分
      const jsonFragment = extractJsonFragment(processedContent)
      if (jsonFragment) {
        if (verbose) console.log('找到JSON片段，长度:', jsonFragment.length)
        
        // 修复换行问题
        let fixedJson = fixJsonStringWithNewlines(jsonFragment)
        
        // 再次清洗
        let cleanedJson = cleanJsonString(fixedJson)
        
        // 可选：修复常见格式问题
        if (enableCommonFixes) {
          cleanedJson = fixCommonJsonIssues(cleanedJson)
        }
        
        try {
          const result = JSON.parse(cleanedJson)
          if (verbose) console.log('✅ 提取JSON后解析成功')
          return result
        } catch (e2) {
          if (verbose) console.log('提取后解析失败:', e2.message)
        }
      }
      
      // 解析失败，输出完整的原始内容以便调试
      if (verbose) {
        console.error('❌ 所有解析尝试均失败')
        console.error('\n========== AI返回的原始内容（完整） ==========')
        console.error(content)
        console.error('========== 原始内容结束 ==========\n')
        console.error('清洗后的内容:')
        console.error(cleanedContent)
      }
      throw new Error(`无法解析AI响应: ${e1.message}`)
    }
  } catch (error) {
    if (verbose) {
      console.error('❌ parseAIResponse 最终失败:', error.message)
    }
    throw error
  }
}

/**
 * 安全解析JSON，失败时返回null
 * 
 * @param {string} content - JSON字符串
 * @param {Object} options - 配置选项
 * @returns {Object|null} 解析后的对象，失败时返回null
 */
function safeParseJson(content, options = {}) {
  try {
    return parseAIResponse(content, options)
  } catch (error) {
    return null
  }
}

module.exports = {
  cleanJsonString,
  fixJsonStringWithNewlines,
  removeMarkdownCodeBlocks,
  extractJsonFragment,
  fixCommonJsonIssues,
  parseAIResponse,
  safeParseJson
}
