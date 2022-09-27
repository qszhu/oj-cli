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
    case Language.Kotlin: return 'KTLN'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class CodeChef extends BaseSite implements Site {
  constructor(config: Config) {
    super('codechef', 'https://www.codechef.com', config)
  }

  async login(username: string, password: string) {
    throw new Error("Method not implemented.");
  }

  async thirdPartyLogin() {
    const cookies = await newPageForCookies(`${this.host}/login`)
    this.config.setCookies(this.host, cookies)
  }

  getProblemUrl(problemId: string) {
    return `${this.host}/problems/${problemId}`
  }

  async readProblem(problemId: string) {
    const url = this.getProblemUrl(problemId)

    const getProblemDesc = () => {
      const problemSel = 'div#problem-statement'
      const partsSel = 'pre'

      const problem = document.querySelector(problemSel)
      const parts = problem!.querySelectorAll(partsSel)
      const tests = []
      let testCase: any = {}
      for (let i = 0; i < parts.length; i += 2) {
        testCase.input = parts[i].innerText
        testCase.output = parts[i + 1].innerText
        tests.push(testCase)
        testCase = {}
      }
      return {
        tests,
        content: problem!.innerHTML.trim(),
      }
    }

    const { content, tests } = await extractInfo(url, getProblemDesc, this.config.getCookies(this.host))
    const textContent = convert(content, {
      wordwrap: 100
    })

    return new Problem(problemId, textContent, tests)
  }

  // https://www.codechef.com/wiki/list-compilers
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
    const selectSel = 'div[class*=_language__select_]'
    const inputSel = 'input[class*=_language-search__textfield_]'
    const editorSel = 'div.ace_scroller'
    const submitSel = 'button[class*=_submit__btn_][type=button]'

    await newPage(async page => {
      await page.goto(url, { waitUntil: 'networkidle2' })

      await Promise.all([selectSel, editorSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(lang)

      await page.click(selectSel)
      await page.type(inputSel, programType)
      await page.click(`li[data-value=${programType}]`)

      await page.click(editorSel)

      // TODO: Mac only, DRY
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
