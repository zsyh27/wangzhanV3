#!/usr/bin/env node

/**
 * 定时检查并发布已到时间的新闻内容
 * 可通过crontab或其他定时任务工具定期执行
 */

const fs = require('fs');
const path = require('path');

async function checkScheduledPosts() {
  const newsDir = path.join(process.cwd(), 'content', 'news');
  
  if (!fs.existsSync(newsDir)) {
    return;
  }

  const files = fs.readdirSync(newsDir);
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(newsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 解析frontmatter
      const frontmatterMatch = content.match(/---\n([\s\S]*?)\n---/);
      if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const statusMatch = frontmatter.match(/status:\s*(.+)/);
        const publishAtMatch = frontmatter.match(/publishAt:\s*(.+)/);
        
        if (statusMatch && publishAtMatch) {
          const status = statusMatch[1].trim();
          const publishAt = publishAtMatch[1].trim();
          const publishDate = new Date(publishAt);
          const now = new Date();
          
          // 检查是否到了发布时间
          if (status === 'scheduled' && publishDate <= now) {
            // 更新状态为published
            const updatedContent = content.replace(/status:\s*scheduled/, 'status: published');
            fs.writeFileSync(filePath, updatedContent);
            console.log(`已发布: ${file}`);
          }
        }
      }
    }
  }
}

async function main() {
  console.log('开始检查定时发布的新闻内容...');
  
  try {
    await checkScheduledPosts();
    console.log('检查完成');
  } catch (error) {
    console.error('检查过程中出现错误:', error);
  }
}

main();
