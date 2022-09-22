import { convert } from "html-to-text";
import Site from ".";
import Config from "../config";
import { extractInfo, newPage, submitFormForCookies } from "../lib/crawler";
import Project from "../project";
import { Language, Problem } from "../types";
import BaseSite from "./BaseSite";

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Cpp: return '7'
    case Language.Java: return '9'
    case Language.Python: return '4'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class USACO extends BaseSite implements Site {
  constructor(config: Config) {
    super('usaco', 'http://www.usaco.org', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}/index.php`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input[name=uname]', username],
        ['input[name=password]', password]
      ]),
      ['input[type=submit]']
    )

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    const url = `${this.host}/index.php?page=viewproblem2&cpid=${problemId}`

    const getProblemDesc = () => {
      const problemSel = 'div.problem-text'
      const inputSel = 'pre.in'
      const outputSel = 'pre.out'

      const problem = document.querySelector(problemSel)
      const inputs = Array.from(document.querySelectorAll(inputSel))
      const outputs = Array.from(document.querySelectorAll(outputSel))
      const tests = []
      for (let i = 0; i < inputs.length; i++) {
        tests.push({
          input: (inputs[i] as HTMLElement).innerText,
          output: (outputs[i] as HTMLElement).innerText
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
    const selectSel = 'select[name=language]'
    const uploadSel = 'input[type=file]'
    const submitSel = 'input[type=submit]'

    const url = `${this.host}/index.php?page=viewproblem2&cpid=${problemId}`
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
