import { convert } from "html-to-text";
import Site from ".";
import Config from "../config";
import { extractInfo, newPage, submitFormForCookies } from "../lib/crawler";
import Project from "../project";
import { Language, Problem } from "../types";
import BaseSite from "./BaseSite";

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Cpp: return '0'
    case Language.Java: return '5'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class HDU extends BaseSite implements Site {
  constructor(config: Config) {
    super('hdu', 'https://acm.hdu.edu.cn', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input[name=username]', username],
        ['input[name=userpass]', password]
      ]),
      ['input[name=login][type=submit]']
    )

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    const url = `${this.host}/showproblem.php?pid=${problemId}`

    const getProblemDesc = () => {
      const problemSel = 'tr:nth-child(4) td'
      const testSel = 'pre'

      const problem = document.querySelector(problemSel)
      const test = Array.from(document.querySelectorAll(testSel))
      const tests = []
      tests.push({
        input: test[0].innerText,
        output: test[1].innerText,
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
    const sourceSel = 'textarea[name=usercode]'
    const submitSel = 'input[value=Submit][type=submit]'

    const url = `${this.host}/submit.php?pid=${problemId}`
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
