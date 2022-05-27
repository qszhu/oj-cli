import fs from 'fs'
import path from 'path'

const CONFIG_FN = '.ojrc'
const KEY_SITE = 'site'
const KEY_PROBLEM_ID = 'problemId'
const KEY_LANGUAGE = 'language'
const KEY_COOKIES = 'cookies'

function getConfigFn() {
  return path.join(process.cwd(), CONFIG_FN)
}

export default class Config {
  static load() {
    const configFn = getConfigFn()
    if (fs.existsSync(configFn)) {
      const data = fs.readFileSync(configFn, 'utf-8')
      return new Config(JSON.parse(data))
    }
    return new Config()
  }

  constructor(private data: Record<string, any> = {}) { }

  private save() {
    fs.writeFileSync(getConfigFn(), JSON.stringify(this.data, null, 2))
  }

  get site() {
    return this.data[KEY_SITE]
  }

  set site(site: string) {
    this.data[KEY_SITE] = site
    this.save()
  }

  get problemId() {
    return this.data[KEY_PROBLEM_ID]
  }

  set problemId(problemId: string) {
    this.data[KEY_PROBLEM_ID] = problemId
    this.save()
  }

  get language() {
    return this.data[KEY_LANGUAGE]
  }

  set language(lang: string) {
    this.data[KEY_LANGUAGE] = lang
    this.save()
  }

  getCookies(host: string) {
    const cookies = this.data[KEY_COOKIES] || {}
    return cookies[host] || []
  }

  setCookies(host: string, cookies: any) {
    const c = this.data[KEY_COOKIES] || {}
    c[host] = cookies
    this.data[KEY_COOKIES] = c
    this.save()
  }
}
