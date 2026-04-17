import { test, expect } from '@playwright/test'

test.describe('任务组2.1：产品详情页创建测试', () => {
  test('1. V5011B2W产品详情页可访问', async ({ page }) => {
    await page.goto('/products/v5011b2w')
    await expect(page).toHaveURL(/.*v5011b2w/)
    await expect(page.locator('text=技术参数').first()).toBeVisible()
  })

  test('2. V5011B2W产品详情页内容完整', async ({ page }) => {
    await page.goto('/products/v5011b2w')
    await expect(page.locator('text=技术参数').first()).toBeVisible()
    await expect(page.locator('text=选型方法').first()).toBeVisible()
    await expect(page.locator('text=应用场景').first()).toBeVisible()
  })

  test('3. V5011B2W产品详情页SEO元素正确', async ({ page }) => {
    await page.goto('/products/v5011b2w')
    const title = await page.title()
    expect(title).toContain('V5011B2W')
    expect(title).toContain('霍尼韦尔')
  })

  test('4. V5GV产品详情页可访问', async ({ page }) => {
    await page.goto('/products/v5gv')
    await expect(page).toHaveURL(/.*v5gv/)
  })

  test('5. V5011S2W产品详情页可访问', async ({ page }) => {
    await page.goto('/products/v5011s2w')
    await expect(page).toHaveURL(/.*v5011s2w/)
  })

  test('6. V6GV产品详情页可访问', async ({ page }) => {
    await page.goto('/products/v6gv')
    await expect(page).toHaveURL(/.*v6gv/)
  })

  test('7. 页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/products/v5011b2w')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })
})
