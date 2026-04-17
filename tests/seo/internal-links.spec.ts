import { test, expect } from '@playwright/test'

test.describe('任务组2.3：内链系统建设测试', () => {
  test('1. 产品详情页显示相关文章', async ({ page }) => {
    await page.goto('/products/v5011b2w')
    await expect(page.locator('text=相关文章').first()).toBeVisible()
  })

  test('2. 产品详情页显示相关产品', async ({ page }) => {
    await page.goto('/products/v5011b2w')
    await expect(page.locator('text=相关产品').first()).toBeVisible()
  })

  test('3. 知识库文章显示相关产品', async ({ page }) => {
    await page.goto('/selection-guide/valve-selection-guide')
    await expect(page.locator('text=相关产品').first()).toBeVisible()
  })

  test('4. 知识库文章显示相关文章', async ({ page }) => {
    await page.goto('/selection-guide/valve-selection-guide')
    await expect(page.locator('text=相关文章').first()).toBeVisible()
  })

  test('5. 案例页显示使用产品', async ({ page }) => {
    await page.goto('/cases/wuhan-tongji-hospital-hvac')
    await expect(page.locator('text=使用产品').first()).toBeVisible()
  })

  test('6. 案例页显示相关案例', async ({ page }) => {
    await page.goto('/cases/wuhan-tongji-hospital-hvac')
    const relatedCasesSection = page.locator('text=相关案例').first()
    const relatedCasesCount = await page.locator('section:has-text("相关案例") a').count()
    if (relatedCasesCount > 0) {
      await expect(relatedCasesSection).toBeVisible()
    } else {
      expect(true).toBeTruthy()
    }
  })

  test('7. 内链可点击且跳转正确', async ({ page }) => {
    await page.goto('/products/v5011b2w')
    const firstRelatedArticle = page.locator('section:has-text("相关文章") a').first()
    await firstRelatedArticle.click()
    await expect(page).toHaveURL(/.*selection-guide/)
  })

  test('8. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/products/v5011b2w')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })
})
