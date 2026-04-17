# 湖北科信达机电设备有限公司 - 设计系统规范

## 一、设计风格

**风格名称**：Industrial Professionalism + Minimalist Precision（工业专业主义+极简精确）

### 设计原则

- 极简优先，功能至上
- 高对比度，保障可读性
- 白色背景，纯净专业
- 霍尼韦尔品牌色，建立信任
- 工业风格，专业严谨
- 清晰层次，信息明确

***

## 二、配色规范（严格执行，禁止新增颜色）

### 品牌色值

| 颜色类型                    | 色值        | 用途                          |
| ----------------------- | --------- | --------------------------- |
| **Primary主色**           | `#005EB8` | 霍尼韦尔品牌蓝，CTA按钮、核心强调、导航链接     |
| **Secondary辅助色**        | `#FFB500` | 霍尼韦尔品牌黄，次要强调、标签、提示          |
| **Background背景色**       | `#FFFFFF` | 页面背景、卡片背景                   |
| **Text正文文本色**           | `#1E293B` | 深灰黑，正文内容（对比度≥4.5:1，WCAG AA） |
| **Text-secondary次要文本色** | `#64748B` | 中性灰，次要说明、辅助信息               |

### 禁止使用的颜色

- ❌ 霓虹色、荧光色
- ❌ 渐变背景（纯色优先）
- ❌ AI风格紫粉色系
- ❌ 暗黑模式相关颜色
- ❌ 透明度过低的颜色（<80%）

***

## 三、字体规范

### 字体组合：Inter + Noto Sans SC

**英文字体**：Inter（无衬线，高可读性）\
**中文字体**：Noto Sans SC（思源黑体，国内加载稳定）

### 字体层级

| 层级      | 用途    | 字号（移动端/桌面端） | 字重           |
| ------- | ----- | ----------- | ------------ |
| H1      | 页面主标题 | 28px / 40px | 700 Bold     |
| H2      | 区块标题  | 24px / 32px | 600 Semibold |
| H3      | 子区块标题 | 20px / 24px | 600 Semibold |
| Body    | 正文内容  | 16px / 16px | 400 Regular  |
| Small   | 辅助说明  | 14px / 14px | 400 Regular  |
| Caption | 标注信息  | 12px / 12px | 400 Regular  |

### Tailwind配置

```javascript
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
    },
  }
}
```

***

## 四、交互规范

### 允许的交互

- ✅ Hover状态：颜色微变（`transition-colors duration-200`）
- ✅ 点击反馈：轻微阴影变化
- ✅ 平滑滚动：`scroll-behavior: smooth`
- ✅ 焦点状态：`outline` + `ring`

### 禁止的交互

- ❌ 视差滚动
- ❌ 3D效果
- ❌ 轮播图
- ❌ 悬浮弹窗/模态框
- ❌ 复杂动画（>200ms）
- ❌ 缩放/旋转等布局变换的hover效果
- ❌ 加载动画/骨架屏（内容SSG静态生成）

### Hover示例

```tsx
// 正确示例
<a 
  href="/products"
  className="text-text-secondary hover:text-primary transition-colors duration-200 cursor-pointer"
>
  产品中心
</a>

// 按钮hover
<button 
  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors duration-200 cursor-pointer"
>
  立即咨询
</button>
```

***

## 五、布局规范

### 容器宽度

| 断点            | 容器最大宽度 | 左右内边距 |
| ------------- | ------ | ----- |
| 375px（移动端）    | 100%   | 16px  |
| 768px（平板）     | 720px  | 24px  |
| 1024px（小屏桌面）  | 960px  | 32px  |
| 1440px+（大屏桌面） | 1200px | 32px  |

### 间距系统（8px基准）

| 间距名称 | 像素值  | Tailwind类         |
| ---- | ---- | ----------------- |
| XS   | 4px  | space-x-1 / p-1   |
| SM   | 8px  | space-x-2 / p-2   |
| MD   | 16px | space-x-4 / p-4   |
| LG   | 24px | space-x-6 / p-6   |
| XL   | 32px | space-x-8 / p-8   |
| 2XL  | 48px | space-x-12 / p-12 |
| 3XL  | 64px | space-x-16 / p-16 |

### 页面区块间距

- 区块之间：`py-16 md:py-24`
- 区块内部上下：`py-8 md:py-12`

***

## 六、组件规范

### Button按钮

#### 主按钮（Primary CTA）

```tsx
<button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer">
  立即咨询
</button>
```

#### 次要按钮（Secondary）

```tsx
<button className="bg-white border border-gray-200 hover:border-primary text-text hover:text-primary px-6 py-3 rounded-lg font-medium transition-colors duration-200 cursor-pointer">
  了解更多
</button>
```

### Card卡片

```tsx
<div className="bg-white border border-gray-100 rounded-xl p-6 hover:border-primary/20 hover:shadow-md transition-all duration-200 cursor-pointer">
  卡片内容
</div>
```

### Navbar导航栏

```tsx
<nav className="sticky top-0 bg-white border-b border-gray-100 z-50">
  <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
    导航内容
  </div>
</nav>
```

***

## 七、SEO规范

### 页面标题层级

- ✅ 单页面仅1个h1标签
- ✅ h1-h6层级清晰，不跳级
- ✅ h1包含核心关键词
- ✅ 语义化标签：header、nav、main、section、article、footer

### Meta标签

- title：60字符以内，核心关键词前置
- description：150-160字符，包含关键词
- keywords：3-5个核心关键词

### 图片规范

- ✅ 使用Next.js Image组件
- ✅ 强制WebP格式
- ✅ 强制懒加载
- ✅ alt属性包含关键词
- ✅ width/height明确指定

### URL规范

- ✅ 小写字母
- ✅ 短横线分隔
- ✅ 包含关键词
- ✅ 层级清晰（/products/\[slug]）

***

## 八、禁止反模式

### 视觉反模式

- ❌ 霓虹色、渐变背景
- ❌ AI风格紫粉色
- ❌ 暗黑模式
- ❌ emoji替代图标（使用Heroicons/Lucide SVG）
- ❌ 隐藏文本（SEO作弊）
- ❌ 过多阴影/特效

### 技术反模式

- ❌ 客户端CSR动态渲染核心内容
- ❌ 接入数据库
- ❌ 使用客户端状态管理（useState/useEffect渲染内容）
- ❌ 过多第三方脚本
- ❌ 未优化的图片

***

## 九、响应式断点

| 断点     | Tailwind前缀 | 设备类型 |
| ------ | ---------- | ---- |
| 375px  | (默认)       | 移动端  |
| 768px  | md:        | 平板   |
| 1024px | lg:        | 小屏桌面 |
| 1440px | xl:        | 大屏桌面 |

### 响应式示例

```tsx
<div className="text-lg md:text-xl lg:text-2xl">
  响应式文本
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  响应式网格
</div>
```

***

## 十、性能规范

### SSG静态生成

- ✅ 所有页面在构建时生成完整静态HTML
- ✅ 使用generateStaticParams生成动态路径
- ✅ 禁止使用generateMetadata中的动态数据
- ✅ 所有图片在构建时优化

### 图片优化

```tsx
import Image from 'next/image'

<Image
  src="/images/product.jpg"
  alt="霍尼韦尔阀门产品图片"
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### 代码规范

- ✅ 组件使用PascalCase命名
- ✅ 工具函数使用camelCase命名
- ✅ 页面路由使用小写短横线分隔
- ✅ 所有函数必须加中文注释
- ✅ 核心SEO代码必须标注说明
- ✅ 禁止冗余代码

***

## 十一、可访问性规范

### WCAG AA标准

- ✅ 文本对比度≥4.5:1
- ✅ 所有图片有alt属性
- ✅ 表单输入有label
- ✅ 焦点状态可见
- ✅ 语义化HTML
- ✅ 键盘可导航
- ✅ 颜色不是唯一指示器

### prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
```

***

## 十二、开发检查清单

### 提交前检查

- [ ] 配色符合规范，无新增颜色
- [ ] 字体层级正确，h1唯一
- [ ] 交互符合规范，无复杂动画
- [ ] 所有交互元素有cursor-pointer
- [ ] 过渡动画≤200ms
- [ ] 图片使用Image组件，有alt属性
- [ ] 所有链接可跳转
- [ ] 响应式测试通过（375/768/1024/1440）
- [ ] 可访问性检查通过
- [ ] 无数据库接入
- [ ] 全SSG静态生成验证
- [ ] SEO标签完整
- [ ] 代码有中文注释
- [ ] 无冗余代码

### 构建前检查

- [ ] npm run build无错误
- [ ] out目录生成完整静态HTML
- [ ] 所有图片优化完成
- [ ] sitemap.xml生成
- [ ] robots.txt配置正确

***

**本设计系统为项目唯一规范，所有开发必须严格遵循，禁止任何自由发挥。**
