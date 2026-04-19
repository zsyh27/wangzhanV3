# 湖北科信达机电设备有限公司官网 - V3

霍尼韦尔阀门湖北授权代理商官方网站，采用 Next.js 15 构建，专注百度 SEO 优化。V3 版本全新升级，引入 LLM Wiki Karpathy 知识库架构，全面优化主页和导航。

## 项目简介

湖北科信达机电设备有限公司是霍尼韦尔阀门湖北唯一官方授权代理商，专注于中央空调阀门、暖通阀门的销售与技术服务。本网站采用"工业专业主义+极简精确"设计风格，全面优化百度搜索引擎收录，提供产品展示、选型工具、技术支持、项目案例、新闻资讯等功能。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **内容管理**: Markdown + Frontmatter (零数据库)
- **测试**: Playwright E2E 测试
- **知识库**: LLM Wiki Karpathy 架构
- **设计系统**: Industrial Professionalism + Minimalist Precision

## 项目结构

```
wangzhanV3/
├── llm-wiki-karpathy/           # LLM Wiki 知识库（Karpathy架构）
│   ├── raw/                     # 原始素材（只读）
│   │   └── 霍尼韦尔产品手册、PDF文档
│   ├── wiki/                    # AI 编译的知识文章（可读写）
│   │   ├── products/            # 产品列表和详情
│   │   └── selection-guide/     # 技术文章和选型指南
│   ├── scripts/                 # 知识处理和同步脚本
│   │   ├── knowledge-sync.js    # 知识库同步脚本
│   │   ├── parse-pdf.js         # PDF解析脚本
│   │   ├── extract-images.js    # 图片提取脚本
│   │   └── verify-content.js    # 内容验证脚本
│   ├── verify-config/           # 验证配置
│   └── SCHEMA.md                # 知识库结构规范
├── design-system/               # 设计系统规范
│   └── MASTER.md               # 完整设计规范文档
├── cron-task-manager/           # 定时任务管理器（独立模块）
│   ├── src/                    # TypeScript 源码
│   └── README.md               # 模块文档
├── app/                         # Next.js App Router页面
│   ├── admin/                  # 内容管理后台
│   ├── api/                    # API路由
│   │   ├── news/               # 新闻相关API
│   │   ├── tasks/              # 定时任务API
│   │   └── wechat/             # 微信相关API
│   ├── cases/                  # 案例中心
│   ├── contact/                # 联系我们
│   ├── news/                   # 新闻资讯
│   ├── products/               # 产品中心
│   ├── selection-guide/        # 技术支持
│   ├── selection-tool/         # 选型工具
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页（V3 全新重构）
├── components/                  # 通用组件
│   ├── Navbar.tsx              # 导航栏（V3 全新调整）
│   ├── Footer.tsx              # 页脚组件
│   ├── Breadcrumb.tsx          # 面包屑导航
│   ├── MobileBottomNav.tsx     # 移动端底部导航
│   └── CertificateGallery.tsx   # 证书展示
├── content/                     # Markdown内容目录（从wiki/同步）
│   ├── cases/                  # 案例Markdown文件
│   ├── news/                   # 新闻Markdown文件
│   ├── products/               # 产品Markdown文件
│   └── selection-guide/        # 技术支持Markdown文件
├── lib/                         # 工具库
│   ├── markdown.ts             # Markdown解析工具
│   ├── config.js               # 配置管理
│   ├── wechat.js               # 微信服务号API
│   ├── ai-json-cleaner.js      # AI JSON清洗处理模块
│   ├── task-manager.ts         # 定时任务管理器
│   └── seo.ts                  # SEO工具
├── scripts/                     # 脚本工具
│   ├── generate-seo-files.js   # SEO文件生成脚本
│   ├── ai-content-generate.js  # AI内容生成脚本
│   ├── baidu-push.js           # 百度主动推送脚本
│   └── task-scheduler.js       # 定时任务调度器
├── tests/                       # E2E测试
├── public/                      # 静态资源
│   ├── images/                 # 图片资源
│   ├── sitemap.xml             # 网站地图
│   └── robots.txt              # 搜索引擎爬虫规则
├── .env.example                # 环境配置模板
├── next.config.js              # Next.js配置
├── tailwind.config.js          # Tailwind CSS配置
└── package.json                # 项目依赖
```

## LLM Wiki Karpathy 知识库

本项目 V3 版本采用 Karpathy LLM Wiki 架构模式，构建独立的知识库系统：

### 三层架构

- **raw/** - 原始素材层（只读）
  - 存放霍尼韦尔官方产品手册、技术文档
  - 存放行业标准、技术规范等参考资料
  - 人类添加，AI只读

- **wiki/** - 知识编译层（AI读写）
  - AI 基于 raw/ 素材生成的结构化知识文章
  - 包含产品详情、技术指南等内容
  - AI 维护，人类阅读

- **content/** - 网站内容层（同步自 wiki/）
  - 通过 `npm run sync:knowledge` 从 wiki/ 同步
  - Next.js 应用直接读取此目录展示内容

### 使用方法

```bash
# 同步知识库到网站内容目录
npm run sync:knowledge

# 解析PDF文档
npm run parse:pdf

# 提取图片
npm run extract:images

# 验证内容
npm run verify:content
```

知识库结构规范详见 `llm-wiki-karpathy/SCHEMA.md`。

## 设计系统规范

本项目严格遵循"工业专业主义+极简精确"设计风格：

- **主色**: `#005EB8`（霍尼韦尔品牌蓝）
- **辅助色**: `#FFB500`（霍尼韦尔品牌黄）
- **背景色**: `#FFFFFF`（纯白，专业纯净）
- **字体**: Inter + Noto Sans SC

完整设计规范详见 `design-system/MASTER.md`。

## 核心功能

### 1. 页面模块（V3 全新重构）

- **首页** - 百度SEO核心权重页，V3 全新重构，模块包括：
  - Hero 区域（核心关键词突出）
  - 核心产品展示
  - 技术支持与选型指南
  - 成功案例
  - 公司优势
  - CTA 转化入口
- **产品中心** - 霍尼韦尔阀门产品展示，支持产品详情页
- **技术支持** - 霍尼韦尔阀门选型指导、安装说明、故障排查
- **选型工具** - 智能化阀门选型辅助工具（V3 新增）
- **案例中心** - 项目案例展示
- **新闻资讯** - 行业动态、技术干货
- **联系我们** - 公司联系方式
- **内容管理后台** - 定时任务管理、内容生成

### 2. 导航系统（V3 全新调整）

导航栏采用固定顶部设计，包含以下菜单：
- 首页
- 产品中心
- 技术支持
- 选型工具（新增）
- 案例中心
- 新闻资讯
- 联系我们

支持桌面端和移动端响应式布局。

### 3. SEO优化功能

- **自动生成 sitemap.xml** - 构建时自动生成网站地图
- **自动生成 robots.txt** - 搜索引擎爬虫规则
- **JSON-LD 结构化数据** - 帮助搜索引擎理解页面内容
- **百度主动推送** - 自动推送 URL 到百度搜索资源平台
- **百度统计集成** - 网站访问统计
- **TDK 自动生成** - 从 Markdown Frontmatter 自动读取 SEO 信息

### 4. 内容管理功能

- **零数据库内容管理** - 所有内容通过 Markdown 文件管理
- **AI 自动内容生成** - 基于 Moonshot API 自动生成 SEO 文章
- **定时任务调度** - Cron 表达式配置定时执行内容生成
- **微信服务号同步** - 自动同步文章到微信服务号草稿箱
- **知识库同步** - LLM Wiki Karpathy 架构，raw → wiki → content 三层同步

### 5. 定时任务功能

独立的 `cron-task-manager` 模块，提供：
- **任务创建** - 支持创建多个定时任务
- **Cron 表达式** - 灵活的执行时间配置
- **任务执行** - 支持立即执行和定时执行
- **任务管理** - 任务列表、启用/禁用、删除
- **可视化管理** - React 管理界面
- **RESTful API** - 完整的 CRUD API 接口

**启动定时任务调度器**：
```bash
# 先构建定时任务管理器
npm run build:cron-task-manager

# 启动调度器（后台运行）
npm run scheduler:start
```

**注意**：微信同步功能需要在微信公众平台后台配置 IP 白名单，详见 [部署到服务器.md](./部署到服务器.md)。

## AI JSON清洗处理功能

### 功能说明

AI大模型返回的JSON字符串可能包含各种格式问题，导致JSON解析失败。本系统提供了一个独立的AI JSON清洗处理模块，用于清洗和解析AI返回的JSON字符串。

### 支持的大模型

本模块设计为通用解决方案，理论上支持所有返回JSON格式的大模型：
- Moonshot (月之暗面)
- OpenAI GPT 系列
- Claude (Anthropic)
- 文心一言
- 通义千问
- 其他大模型

## 环境配置

### 必需配置

复制 `.env.example` 为 `.env`，并填写以下配置：

```env
# 网站基础配置
NEXT_PUBLIC_SITE_URL=http://www.hubeikexinda.online
NEXT_PUBLIC_SITE_NAME=湖北科信达机电设备有限公司

# 百度统计配置
BAIDU_TONGJI_ID=your_tongji_id_here

# 百度搜索资源平台配置
BAIDU_PUSH_SITE=www.hubeikexinda.online
BAIDU_PUSH_TOKEN=your_baidu_push_token_here

# 百度站点验证配置（可选）
BAIDU_VERIFICATION_CODE=your_verification_code_here

# Moonshot AI API配置（用于内容生成，可选）
MOONSHOT_API_KEY=your_moonshot_api_key_here

# AI内容生成配置（可选，使用默认值即可）
AI_CONTENT_MIN_WORDS=1500
AI_CONTENT_MAX_WORDS=2000
AI_KEYWORD_DENSITY_MIN=0.02
AI_KEYWORD_DENSITY_MAX=0.03
AI_MAX_RETRIES=3

# 微信服务号配置（可选）
WECHAT_APPID=your_wechat_appid_here
WECHAT_APPSECRET=your_wechat_appsecret_here
```

### 配置说明

| 配置项 | 说明 | 是否必需 |
|-------|------|---------|
| `NEXT_PUBLIC_SITE_URL` | 网站域名 | ✅ 必需 |
| `NEXT_PUBLIC_SITE_NAME` | 网站名称 | ✅ 必需 |
| `BAIDU_TONGJI_ID` | 百度统计ID | ✅ 必需 |
| `BAIDU_PUSH_SITE` | 百度推送站点 | ✅ 必需 |
| `BAIDU_PUSH_TOKEN` | 百度推送Token | ✅ 必需 |
| `BAIDU_VERIFICATION_CODE` | 百度验证代码 | ⚪ 可选 |
| `MOONSHOT_API_KEY` | 月之暗面API Key | ⚪ 可选 |
| `WECHAT_APPID` | 微信服务号AppID | ⚪ 可选 |
| `WECHAT_APPSECRET` | 微信服务号AppSecret | ⚪ 可选 |

**注意**：`.env` 文件包含敏感配置信息，**不应提交到 Git 仓库**。项目已包含 `.env.example` 作为配置模板。

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看网站

### 3. 运行 E2E 测试

```bash
npm run test:e2e
```

## 生产部署

详见 [部署到服务器.md](./部署到服务器.md) 文档。

## 项目脚本

```bash
# 开发
npm run dev

# 构建
npm run build

# 启动生产服务器
npm start

# 生成 SEO 文件
npm run generate:seo

# 百度主动推送
npm run push:baidu

# 百度主动推送（单页面）
npm run push:baidu:single

# AI 内容生成
npm run generate:content

# 知识库同步
npm run sync:knowledge

# 解析 PDF
npm run parse:pdf

# 提取图片
npm run extract:images

# 验证内容
npm run verify:content

# 智能验证
npm run verify:smart

# 检查定时任务
npm run check:scheduled

# 运行 E2E 测试
npm run test:e2e

# 运行 E2E 测试（UI模式）
npm run test:e2e:ui

# 构建并预览
npm run test-and-preview

# 构建定时任务管理器
npm run build:cron-task-manager

# 开发定时任务管理器
npm run dev:cron-task-manager

# 启动定时任务调度器
npm run scheduler:start
```

## 升级记录

### V3 版本主要变更

1. **LLM Wiki Karpathy 知识库系统** - 引入三层架构知识库，支持 AI 内容生成和同步
2. **全新设计系统** - 建立完整的设计规范文档
3. **主页全面重构** - 优化模块布局，提升 SEO 和转化效果
4. **导航系统调整** - 新增"技术支持"和"选型工具"菜单
5. **选型工具** - 新增智能化阀门选型辅助工具
6. **定时任务管理器** - 独立为可复用模块
7. **新增知识库脚本** - PDF 解析、图片提取、内容验证等工具

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

- 公司名称：湖北科信达机电设备有限公司
- 联系电话：139 0711 7179
- 公司地址：湖北省武汉市江汉区红旗渠路18号

---

**注意**：本项目为湖北科信达机电设备有限公司官方网站，未经授权不得用于商业用途。
