import { convert } from 'html-to-text'
import Site from '.'
import Config from '../config'
import { extractInfo, newPage, newPageForCookies } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Kotlin: return 'kotlin'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class YukiCoder extends BaseSite implements Site {
  constructor(config: Config) {
    super('yukicoder', 'https://yukicoder.me', config)
  }

  async login(username: string, password: string) {
    throw new Error('Method not implemented.')
  }

  async thirdPartyLogin() {
    const cookies = await newPageForCookies(`${this.host}`)
    this.config.setCookies(this.host, cookies)
  }

  getProblemUrl(problemId: string) {
    return `${this.host}/problems/no/${problemId}`
  }

  async readProblem(problemId: string) {
    const url = this.getProblemUrl(problemId)

    const getProblemDesc = () => {
      const problemSel = 'div#content'
      const partsSel = 'div.sample pre'

      const problem = document.querySelector(problemSel)
      const parts = problem!.querySelectorAll(partsSel)

      const tests = []
      let testCase: any = {}
      for (let i = 0; i < parts.length; i += 2) {
        testCase.input = (parts[i] as any).innerText
        testCase.output = (parts[i + 1] as any).innerText
        tests.push(testCase)
        testCase = {}
      }
      return {
        tests,
        content: problem!.innerHTML.trim(),
      }
    }

    const { content, tests } = await extractInfo(
      url,
      getProblemDesc,
      this.config.getCookies(this.host)
    )
    const textContent = convert(content, {
      wordwrap: 100
    })

    return new Problem(problemId, textContent, tests)
  }

  // https://yukicoder.me/help/environments
  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    switch (lang) {
      case Language.Kotlin:
        return `kotlinc -language-version 1.6 ${srcFn} -include-runtime -d ${outFn}`
      default:
        throw new Error(`Unsupported language ${lang}`)
    }
  }

  async submitFile(problemId: string, srcFn: string, lang: Language) {
    const url = `${this.host}/problems/no/${problemId}/submit`

    const selectSel = 'select[id=lang]'
    const uploadSel = 'input[id=file][type=file]'
    const submitSel = 'input[id=submit][type=submit]'

    await newPage(async page => {
      await page.setCookie(...this.config.getCookies(this.host))
      await page.goto(url, { waitUntil: 'networkidle2' })

      await Promise.all([selectSel, uploadSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(lang)
      await page.select(selectSel, programType)

      const uploadHandle = await page.$(uploadSel)
      uploadHandle?.uploadFile(srcFn)

      await page.click(submitSel)
      await page.waitForTimeout(2 * 60 * 1000)
    })
  }

  async submit(problemId: string, project: Project) {
    await this.submitFile(problemId, project.getSubmitFn(), project.getLanguage())
  }
}
