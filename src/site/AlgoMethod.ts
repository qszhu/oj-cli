import clipboardy from 'clipboardy'
import fs from 'fs'
import { convert } from 'html-to-text'
import path from 'path'
import Site from '.'
import Config from '../config'
import { extractInfo, newPage, newPageForCookies } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Kotlin: return '14'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class AlgoMethod extends BaseSite implements Site {
  constructor(config: Config) {
    super('algomethod', 'https://algo-method.com', config)
  }

  async login(username: string, password: string) {
    throw new Error("Method not implemented.");
  }

  async thirdPartyLogin() {
    const cookies = await newPageForCookies(`${this.host}/login_select`)
    this.config.setCookies(this.host, cookies)
  }

  getProblemUrl(problemId: string) {
    return `${this.host}/tasks/${problemId}`
  }

  async readProblem(problemId: string) {
    const url = this.getProblemUrl(problemId)
    const problemSel = 'div[class*=Markdown_markdownBody__]'

    const getProblemDesc = () => {
      const problemSel = 'div[class*=Markdown_markdownBody__]'
      const partsSel = 'pre > pre'

      const problem = document.querySelector(problemSel)
      const parts = problem!.querySelectorAll(partsSel)
      // TODO: hack when :has selector is absent
      const filtered = []
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (part.querySelectorAll('button').length > 0) filtered.push(part.querySelector('span'))
      }

      const tests = []
      let testCase: any = {}
      for (let i = 0; i < filtered.length; i += 2) {
        testCase.input = (filtered[i] as any).innerText
        testCase.output = (filtered[i + 1] as any).innerText
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
      [problemSel]
    )
    const textContent = convert(content, {
      wordwrap: 100
    })

    return new Problem(problemId, textContent, tests)
  }

  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    const libDir = path.join(path.dirname(srcFn), 'lib')
    switch (lang) {
      case Language.Kotlin:
        return `kotlinc -language-version 1.5 ${srcFn} ${libDir} -d ${outFn}`
      default:
        throw new Error(`Unsupported language ${lang}`)
    }
  }

  async submitFile(problemId: string, srcFn: string, lang: Language) {
    const src = fs.readFileSync(srcFn, 'utf-8')
    clipboardy.writeSync(src)

    const url = this.getProblemUrl(problemId)

    const selectSel = 'select[class*=EditorWrapper_languageChanger_]'
    const editorSel = 'div.monaco-scrollable-element'
    const submitSel = 'button[class*=Button_submitButton_][type=submit]'

    await newPage(async page => {
      await page.goto(url, { waitUntil: 'networkidle2' })

      await Promise.all([selectSel, editorSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(lang)
      await page.select(selectSel, programType)

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
