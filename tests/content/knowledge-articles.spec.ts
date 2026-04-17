import { test, expect } from '@playwright/test'

test.describe('任务组2.2：技术文章生成测试', () => {
  test('1. V5011B2W选型参数详解文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/v5011b2w-selection-guide')
    await expect(page).toHaveURL(/.*v5011b2w-selection-guide/)
  })

  test('2. V5GV法兰阀安装指南文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/v5gv-installation-guide')
    await expect(page).toHaveURL(/.*v5gv-installation-guide/)
  })

  test('3. 电动二通阀安装方法详解文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/valve-installation-guide')
    await expect(page).toHaveURL(/.*valve-installation-guide/)
  })

  test('4. 电动阀执行器接线方法文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/actuator-wiring-guide')
    await expect(page).toHaveURL(/.*actuator-wiring-guide/)
  })

  test('5. 风机盘管电动阀文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/fan-coil-valve')
    await expect(page).toHaveURL(/.*fan-coil-valve/)
  })

  test('6. 霍尼韦尔阀门故障排查指南文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/valve-troubleshooting')
    await expect(page).toHaveURL(/.*valve-troubleshooting/)
  })

  test('7. 风机盘管电动阀故障诊断与维修文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/fan-coil-troubleshooting')
    await expect(page).toHaveURL(/.*fan-coil-troubleshooting/)
  })

  test('8. 霍尼韦尔vs西门子阀门对比分析文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/honeywell-vs-siemens')
    await expect(page).toHaveURL(/.*honeywell-vs-siemens/)
  })

  test('9. 电动座阀vs电动球阀如何选择文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/seat-valve-vs-ball-valve')
    await expect(page).toHaveURL(/.*seat-valve-vs-ball-valve/)
  })

  test('10. 商业综合体中央空调阀门配套方案文章可访问', async ({ page }) => {
    await page.goto('/selection-guide/commercial-complex-solution')
    await expect(page).toHaveURL(/.*commercial-complex-solution/)
  })

  test('11. 文章页面无JavaScript错误', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/selection-guide/v5011b2w-selection-guide')
    await page.waitForTimeout(2000)
    expect(errors.length).toBe(0)
  })
})
