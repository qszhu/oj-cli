import { convert } from 'html-to-text'
import Site from '.'
import Config from '../config'
import { extractInfo, newPage, submitFormForCookies } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Cpp: return 'C++'
    case Language.Java: return 'Java'
    case Language.Python: return 'Python3'
    case Language.Haskell: return 'Haskell'
    case Language.JavaScript:
    case Language.TypeScript: return 'Node.js'
    case Language.Rust: return 'Rust'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class CSES extends BaseSite implements Site {
  constructor(config: Config) {
    super('cses', 'https://cses.fi', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}/login`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input#nick', username],
        ['input[type=password]', password]
      ]),
      ['input[type=submit]']
    )

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    const url = `${this.host}/problemset/task/${problemId}`

    const getProblemDesc = () => {
      const problemSel = 'div.content'
      const partsSel = 'code'

      const problem = document.querySelector(problemSel)
      const parts = Array.from(document.querySelectorAll(partsSel))
      const tests = []
      for (let i = 0; i < parts.length; i += 2) {
        tests.push({
          input: parts[i].innerText,
          output: parts[i + 1].innerText
        })
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

  async submit(problemId: string, project: Project) {
    const selectSel = 'select#lang'
    const uploadSel = 'input[type=file]'
    const submitSel = 'input[type=submit]'

    const url = `${this.host}/problemset/submit/${problemId}/`
    await newPage(async page => {
      await page.setCookie(...this.config.getCookies(this.host))
      await page.goto(url, {
        waitUntil: 'networkidle2'
      })

      await Promise.all([selectSel, uploadSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(project.getLanguage())
      await page.select(selectSel, programType)

      const uploadHandle = await page.$(uploadSel)
      uploadHandle?.uploadFile(project.getSubmitFn())

      await page.click(submitSel)
      await page.waitForTimeout(2 * 60 * 1000)
    })
  }
}
