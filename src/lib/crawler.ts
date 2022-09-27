import puppeteer from 'puppeteer'

const WIDTH = 1280, HEIGHT = 1280
const DEBUG = Boolean(process.env.DEBUG_CRAWLER)

const PROXY_SERVER = '127.0.0.1:8888'

export async function newPageForCookies(url: string) {
  const launchOpts = {
    headless: false,
    slowMo: 250,
    args: [
      `--proxy-server=${PROXY_SERVER}`
    ],
  }
  const browser = await puppeteer.launch(launchOpts)
  const page = await browser.newPage()
  const timeout = 5 * 60 * 1000
  await page.goto(url, { timeout, waitUntil: 'networkidle2' })
  while (true) {
    await page.waitForNavigation({ timeout, waitUntil: 'networkidle2' })
    if (new URL(page.url()).host === new URL(url).host) break
  }
  const cookies = await page.cookies()
  await browser.close()
  return cookies
}

export async function newPage(
  cb: (page: puppeteer.Page, browser: puppeteer.Browser) => Promise<void>,
  cookies: any[] = [],
  slowMo = false
) {
  let launchOpts: any = {
    headless: false,
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      `--proxy-server=${PROXY_SERVER}`
    ],
  }
  if (slowMo) launchOpts.slowMo = 250
  if (DEBUG) {
    launchOpts = {
      headless: false,
      devtools: true,
      args: [`--window-size=${WIDTH},${HEIGHT}`],
    }
  }

  const browser = await puppeteer.launch(launchOpts)
  const page = await browser.newPage()
  await page.setViewport({ width: WIDTH, height: HEIGHT })
  await page.setCookie(...cookies)
  if (DEBUG) {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()))
  }

  await cb(page, browser)

  if (!DEBUG) {
    await browser.close()
  }
}

export async function extractInfo<T>(
  url: string,
  cb: () => T,
  cookies: any[] = [],
  selectors: string[] = []
): Promise<T> {
  let res: any

  await newPage(async page => {
    await page.goto(url)
    await Promise.all(selectors.map(sel => page.waitForSelector(sel)))

    res = await page.evaluate(cb)
  }, cookies)

  return res
}

export async function submitFormForCookies(
  url: string,
  params: Map<string, string>,
  clickSels: string[]
): Promise<any> {
  let cookies: any

  await newPage(async page => {
    await page.goto(url, {
      waitUntil: 'networkidle2'
    })

    for (const [sel, value] of params.entries()) {
      await page.type(sel, value)
    }
    for (const c of clickSels) {
      await page.click(c)
    }

    // TODO: wait for selector
    await page.waitForTimeout(5 * 1000)

    cookies = await page.cookies()
  })

  return cookies
}
