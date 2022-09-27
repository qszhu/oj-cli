import { convert } from 'html-to-text'
import Site from '.'
import Config from '../config'
import { extractInfo, newPage, submitFormForCookies } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Cpp: return '0'
    case Language.Java: return '2'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class POJ extends BaseSite implements Site {
  constructor(config: Config) {
    super('poj', 'http://poj.org', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}/modifyuser`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input[name=user_id1]', username],
        ['input[name=password1]', password]
      ]),
      ['input[value=login][type=Submit]']
    )
    // TODO: wait for selector

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    const url = `${this.host}/problem?id=${problemId}`

    const getProblemDesc = () => {
      const problemSel = 'table:nth-child(3)'
      const testSel = 'pre.sio'

      const problem = document.querySelector(problemSel)
      const test = Array.from(document.querySelectorAll(testSel))
      const tests = []
      tests.push({
        input: (test[0] as HTMLElement).innerText,
        output: (test[1] as HTMLElement).innerText,
      })
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
    const selectSel = 'select[name=language]'
    const sourceSel = 'textarea[name=source]'
    const submitSel = 'input[value=Submit][type=submit]'

    const url = `${this.host}/submit?problem_id=${problemId}`
    await newPage(async page => {
      await page.setCookie(...this.config.getCookies(this.host))
      await page.goto(url, {
        waitUntil: 'networkidle2'
      })

      await Promise.all([selectSel, sourceSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(project.getLanguage())
      await page.select(selectSel, programType)

      await page.evaluate(({ sel, src }) => {
        const textArea = document.querySelector(sel)!
        ;(textArea as HTMLInputElement).value = src
      }, { sel: sourceSel, src: project.getSource() })

      await page.click(submitSel)
      await page.waitForTimeout(2 * 60 * 1000)
    })
  }
}
