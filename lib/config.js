/**
 * 环境变量读取工具函数
 * 统一管理项目配置，避免配置不一致问题
 */

/**
 * 获取环境变量，支持默认值
 */
function getEnv(key, defaultValue = '') {
  return process.env[key] || defaultValue
}

/**
 * 获取网站基础配置
 */
function getSiteConfig() {
  return {
    siteUrl: getEnv('NEXT_PUBLIC_SITE_URL', 'http://www.hubeikexinda.online'),
    siteName: getEnv('NEXT_PUBLIC_SITE_NAME', '湖北科信达机电设备有限公司'),
  }
}

/**
 * 获取百度统计配置
 */
function getBaiduTongjiConfig() {
  return {
    tongjiId: getEnv('BAIDU_TONGJI_ID', 'YOUR_BAIDU_TONGJI_ID'),
  }
}

/**
 * 获取百度搜索资源平台配置
 */
function getBaiduPushConfig() {
  const site = getEnv('BAIDU_PUSH_SITE', 'YOUR_BAIDU_SITE')
  const token = getEnv('BAIDU_PUSH_TOKEN', 'YOUR_BAIDU_TOKEN')
  
  return {
    site,
    token,
    apiUrl: `http://data.zz.baidu.com/urls?site=${encodeURIComponent(site)}&token=${token}`,
  }
}

/**
 * 获取百度站点验证配置
 */
function getBaiduVerificationConfig() {
  return {
    verificationCode: getEnv('BAIDU_VERIFICATION_CODE', 'YOUR_BAIDU_VERIFICATION_CODE'),
  }
}

/**
 * 获取月之暗面（Moonshot AI）API配置
 */
function getMoonshotConfig() {
  return {
    apiKey: getEnv('MOONSHOT_API_KEY', 'YOUR_MOONSHOT_API_KEY'),
  }
}

/**
 * 获取AI内容生成配置
 */
function getAIContentConfig() {
  return {
    minWords: parseInt(getEnv('AI_CONTENT_MIN_WORDS', '1500')),
    maxWords: parseInt(getEnv('AI_CONTENT_MAX_WORDS', '2000')),
    minKeywordDensity: parseFloat(getEnv('AI_KEYWORD_DENSITY_MIN', '0.02')),
    maxKeywordDensity: parseFloat(getEnv('AI_KEYWORD_DENSITY_MAX', '0.03')),
    maxRetries: parseInt(getEnv('AI_MAX_RETRIES', '3')),
  }
}

module.exports = {
  getEnv,
  getSiteConfig,
  getBaiduTongjiConfig,
  getBaiduPushConfig,
  getBaiduVerificationConfig,
  getMoonshotConfig,
  getAIContentConfig,
}
