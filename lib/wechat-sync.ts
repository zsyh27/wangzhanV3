import fs from 'fs';
import path from 'path';
import { wechatService } from './wechat';
import { parseMarkdown, markdownToHtml, ParsedMarkdown } from './markdown-parser';
import { getNextFile } from './file-queue-manager';

const DEFAULT_COVER_URL = 'https://images.unsplash.com/photo-1609176345992-9c2f54b3e1f0?w=800&h=600&fit=crop';

function extractImageUrl(markdown: string, frontmatter: any): string | null {
  if (frontmatter?.image) {
    return frontmatter.image;
  }
  
  const imgMatch = markdown.match(/!\[.*?\]\((.*?)\)/);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return null;
}

async function uploadImageIfNeeded(imageUrl: string): Promise<string> {
  try {
    if (!imageUrl) {
      return DEFAULT_COVER_URL;
    }
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      if (imageUrl.includes('mmbiz.qpic.cn')) {
        return imageUrl;
      }
    }
    
    let localPath = imageUrl;
    if (imageUrl.startsWith('/')) {
      localPath = path.join(process.cwd(), 'public', imageUrl);
    }
    
    if (fs.existsSync(localPath)) {
      console.log('上传图片到微信:', localPath);
      const wechatUrl = await wechatService.uploadImage(localPath);
      console.log('图片上传成功,微信URL:', wechatUrl);
      return wechatUrl;
    }
    
    return imageUrl;
  } catch (error) {
    console.error('图片处理失败,使用默认图片:', error);
    return DEFAULT_COVER_URL;
  }
}

export async function syncMarkdownToWechat(
  directory: string,
  targetFile?: string
): Promise<{
    success: boolean;
    message: string;
    mediaId?: string;
    fileName?: string;
    error?: string;
  }> {
  try {
    let selectedFileName = targetFile;
    
    if (!selectedFileName) {
      selectedFileName = getNextFile(directory) || undefined;
      if (!selectedFileName) {
        return {
          success: false,
          message: `目录 ${directory} 中没有可用的md文件`
        };
      }
    }
    
    const filePath = path.join(process.cwd(), directory, selectedFileName);
    
    if (!fs.existsSync(filePath)) {
      return {
        success: false,
        message: `文件不存在: ${filePath}`,
        fileName: selectedFileName
      };
    }
    
    const parsed = parseMarkdown(filePath);
    const title = parsed.frontmatter.title || parsed.frontmatter.seoTitle || selectedFileName.replace('.md', '');
    const digest = parsed.frontmatter.seoDescription || parsed.content.substring(0, 100);
    
    let imageUrl = extractImageUrl(parsed.content, parsed.frontmatter);
    let coverUrl = await uploadImageIfNeeded(imageUrl || '');
    
    let htmlContent = markdownToHtml(parsed.content);
    
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
    let match;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      const originalUrl = match[1];
      if (!originalUrl.includes('mmbiz.qpic.cn')) {
        const wechatImgUrl = await uploadImageIfNeeded(originalUrl);
        htmlContent = htmlContent.replace(originalUrl, wechatImgUrl);
      }
    }
    
    const mediaId = await wechatService.addDraft({
      title,
      digest,
      content: htmlContent,
      coverUrl,
      author: parsed.frontmatter.author || '霍尼韦尔'
    });
    
    return {
      success: true,
      message: `文章已成功同步到微信草稿: ${title}`,
      mediaId,
      fileName: selectedFileName
    };
    
  } catch (error) {
    console.error('同步到微信失败:', error);
    return {
      success: false,
      message: '同步到微信失败',
      error: error instanceof Error ? error.message : String(error)
    };
  }
}
