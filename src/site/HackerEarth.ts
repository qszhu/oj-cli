import clipboardy from 'clipboardy'
import fs from 'fs'
import { convert } from 'html-to-text'
import Site from '.'
import Config from '../config'
import { extractInfo, newPage, newPageForCookies } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Kotlin: return 'KOTLIN'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class HackerEarth extends BaseSite implements Site {
  constructor(config: Config) {
    super('hackerearth', 'https://www.hackerearth.com', config)
  }

  getProblemUrl(problemId: string) {
    return `${this.host}/problem/algorithm/${problemId}/`
  }

  async login(username: string, password: string) {
    throw new Error("Method not implemented.");
  }

  async thirdPartyLogin() {
    const cookies = await newPageForCookies(`${this.host}/login`)
    this.config.setCookies(this.host, cookies)
  }

  async readProblem(problemId: string) {
    const url = this.getProblemUrl(problemId)

    const problemSel = 'div.problem-details'
    const partsSel = 'div.input-output'

    const getProblemDesc = () => {
      const problemSel = 'div.problem-details'
      const partsSel = 'div.input-output'
      const problem = document.querySelector(problemSel)
      const parts = problem!.querySelectorAll(partsSel)
      const tests = []
      let testCase: any = {}
      for (let i = 0; i < parts.length; i += 2) {
        testCase.input = parts[i].querySelector('pre')!.innerText
        testCase.output = parts[i + 1].querySelector('pre')!.innerText
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
      this.config.getCookies(this.host),
      [problemSel, partsSel]
    )

    const textContent = convert(content, {
      wordwrap: 100
    })

    return new Problem(problemId, textContent, tests)
  }

  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    switch (lang) {
      case Language.Kotlin:
        return `kotlinc -language-version 1.5 ${srcFn} -include-runtime -d ${outFn}`
      default:
        throw new Error(`Unsupported language ${lang}`)
    }
  }

  async submitFile(problemId: string, srcFn: string, lang: Language) {
    const src = fs.readFileSync(srcFn, 'utf-8')
    clipboardy.writeSync(src)

    const url = this.getProblemUrl(problemId)
    const selectSel = 'select.editor-lang-select'
    const submitSel = 'button[class*=btn-blue][type=button]'
    const editorSel = 'div.monaco-editor'

    await newPage(async page => {
      await page.goto(url, { waitUntil: 'networkidle2' })

      await Promise.all([selectSel, submitSel, editorSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(lang)
      await page.select(selectSel, programType)

      await page.click(editorSel)

      // TODO: Mac only
      await page.keyboard.down('MetaLeft')
      await page.keyboard.press('a')
      await page.keyboard.up('MetaLeft')

      await page.keyboard.press('Backspace')

      await page.keyboard.down('Shift')
      await page.keyboard.press('Insert')
      await page.keyboard.up('Shift')

      await page.click(submitSel)
      await page.waitForTimeout(2 * 60 * 1000)
    }, this.config.getCookies(this.host))
  }

  async submit(problemId: string, project: Project) {
    await this.submitFile(problemId, project.getSubmitFn(), project.getLanguage())
  }
}
