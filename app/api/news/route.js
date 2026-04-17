import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const data = await request.json();
    const { title, content, category, publishTime } = data;

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const publishDate = new Date(publishTime);
    const datePrefix = publishDate.toISOString().split('T')[0];
    
    const markdownContent = `---
title: ${title}
slug: ${slug}
date: ${publishDate.toISOString()}
category: ${category}
status: scheduled
publishAt: ${publishTime}
author: 湖北科信达机电设备有限公司
seoTitle: ${title}
seoDescription: ${title}
keywords: 暖通,阀门,霍尼韦尔
relatedLinks: []
---

${content}
`;

    const newsDir = path.join(process.cwd(), 'content', 'news');
    if (!fs.existsSync(newsDir)) {
      fs.mkdirSync(newsDir, { recursive: true });
    }

    let mediaId = '';
    try {
      const { wechatService } = require('@/lib/wechat');
      const article = {
        title: title,
        author: '湖北科信达机电设备有限公司',
        content: content,
        content_source_url: `http://localhost:3002/news/${slug}`,
        digest: content.substring(0, 120) + '...'
      };

      mediaId = await wechatService.addDraft([article]);
      console.log('微信服务号草稿创建成功:', mediaId);
    } catch (error) {
      console.error('同步到微信服务号失败:', error);
    }

    const updatedMarkdownContent = `---
title: ${title}
slug: ${slug}
date: ${publishDate.toISOString()}
category: ${category}
status: scheduled
publishAt: ${publishTime}
author: 湖北科信达机电设备有限公司
seoTitle: ${title}
seoDescription: ${title}
keywords: 暖通,阀门,霍尼韦尔
relatedLinks: []
${mediaId ? `wechat_media_id: ${mediaId}` : ''}
---

${content}
`;

    const filePath = path.join(newsDir, `${datePrefix}-${slug}.md`);
    fs.writeFileSync(filePath, updatedMarkdownContent);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create news' }, { status: 500 });
  }
}
