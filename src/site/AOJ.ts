import axios from 'axios'
import fs from 'fs'
import { convert } from 'html-to-text'
import Site from '.'
import Config from '../config'
import { newPage } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

const HOST_API = 'https://judgeapi.u-aizu.ac.jp'
const HOST_DAT = 'https://judgedat.u-aizu.ac.jp'

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Kotlin: return 'Kotlin'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class AOJ extends BaseSite implements Site {
  constructor(config: Config) {
    super('aoj', 'https://onlinejudge.u-aizu.ac.jp', config)
  }

  async login(username: string, password: string) {
    const res = await axios.request({
      url: `${HOST_API}/session`,
      method: 'post',
      data: { id: username, password },
    })
    this.config.setCookies(this.host, res.headers['set-cookie'])
    return res.data
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string): Promise<Problem> {
    let res = await axios.request({
      url: `${HOST_API}/resources/descriptions/en/${problemId}`,
      method: 'get'
    })
    const content = res.data.html
    const textContent = convert(content, {
      wordwrap: 100
    })

    res = await axios.request({
      url: `${HOST_DAT}/testcases/samples/${problemId}`,
      method: 'get'
    })
    const tests = (res.data as any[]).map(t => ({ input: t.in, output: t.out }))

    return new Problem(problemId, textContent, tests)
  }

  // https://onlinejudge.u-aizu.ac.jp/system_info
  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    switch (lang) {
      case Language.Kotlin:
        return `kotlinc -language-version 1.4 ${srcFn} -d ${outFn}`
      default:
        throw new Error(`Unsupported language ${lang}`)
    }
  }

  async submitFile(problemId: string, srcFn: string, lang: Language) {
    const src = fs.readFileSync(srcFn, 'utf-8')
    let res: any = await axios.request({
      url: `${HOST_API}/submissions`,
      method: 'post',
      headers: {
        cookie: this.config.getCookies(this.host)
      },
      data: {
        problemId,
        language: programTypeFromLang(lang),
        sourceCode: src
      }
    })

    res = await axios.request({
      url: `${HOST_API}/self`,
      method: 'get',
      headers: {
        cookie: this.config.getCookies(this.host)
      }
    })

    const url = `${this.host}/status/users/${res.data.id}/submissions/1`
    await newPage(async page => {
      await page.goto(url)
      await page.waitForTimeout(5 * 60 * 1000)
    })
  }

  async submit(problemId: string, project: Project) {
    await this.submitFile(problemId, project.getSubmitFn(), project.getLanguage())
  }
}
