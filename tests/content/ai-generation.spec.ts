import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

test.describe('任务组1.3：内容生成系统建设测试', () => {
  test('1. 关键词库文件存在', async () => {
    const keywordsPath = path.join(process.cwd(), 'data', 'keywords.json')
    expect(fs.existsSync(keywordsPath)).toBeTruthy()
    
    const keywordsContent = fs.readFileSync(keywordsPath, 'utf-8')
    const keywords = JSON.parse(keywordsContent)
    expect(Array.isArray(keywords)).toBeTruthy()
    expect(keywords.length).toBeGreaterThan(0)
  })

  test('2. Prompt模板库文件存在', async () => {
    const promptPath = path.join(process.cwd(), 'lib', 'prompt-templates.ts')
    expect(fs.existsSync(promptPath)).toBeTruthy()
  })

  test('3. 内容审核流程文档存在', async () => {
    const checklistPath = path.join(process.cwd(), 'docs', 'content-review-checklist.md')
    expect(fs.existsSync(checklistPath)).toBeTruthy()
    
    const checklistContent = fs.readFileSync(checklistPath, 'utf-8')
    expect(checklistContent).toContain('内容审核Checklist')
  })

  test('4. AI内容生成脚本存在', async () => {
    const contentGeneratePath = path.join(process.cwd(), 'scripts', 'ai-content-generate.js')
    expect(fs.existsSync(contentGeneratePath)).toBeTruthy()
    
    const knowledgeGeneratePath = path.join(process.cwd(), 'scripts', 'ai-knowledge-generate.js')
    expect(fs.existsSync(knowledgeGeneratePath)).toBeTruthy()
  })

  test('5. 关键词库包含P0级关键词', async () => {
    const keywordsPath = path.join(process.cwd(), 'data', 'keywords.json')
    const keywordsContent = fs.readFileSync(keywordsPath, 'utf-8')
    const keywords = JSON.parse(keywordsContent)
    
    const p0Keywords = keywords.filter((k: any) => k.priority === 'P0')
    expect(p0Keywords.length).toBeGreaterThan(0)
  })

  test('6. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })
})
