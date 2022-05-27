import { convert } from "html-to-text";
import Site from ".";
import Config from "../config";
import { extractInfo, newPage, newPageForCookies } from "../lib/crawler";
import Project from "../project";
import { Language, Problem } from "../types";
import BaseSite from "./BaseSite";

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Cpp: return 'C++'
    case Language.Go: return 'Go'
    case Language.Haskell: return 'Haskell'
    case Language.Java: return 'Java'
    case Language.JavaScript:
    case Language.TypeScript: return 'JavaScript (Node.js)'
    case Language.Kotlin: return 'Kotlin'
    case Language.Python: return 'Python3'
    case Language.Rust: return 'Rust'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class Kattis extends BaseSite implements Site {
  constructor(config: Config) {
    super('kattis', 'https://open.kattis.com', config)
  }

  async login(username: string, password: string) {
    throw new Error("Method not implemented.");
  }

  async thirdPartyLogin() {
    const cookies = await newPageForCookies(`${this.host}/login`)
    this.config.setCookies(this.host, cookies)
  }

  async readProblem(problemId: string) {
    const url = `${this.host}/problems/${problemId}`

    const getProblemDesc = () => {
      const problemSel = 'div.problembody'
      const testsSel = 'table.sample'
      const testInputSel = 'td:nth-child(1) pre'
      const testOutputSel = 'td:nth-child(2) pre'

      const problem = document.querySelector(problemSel)
      const testCases = Array.from(document.querySelectorAll(testsSel))
      const tests = []
      for (let i = 0; i < testCases.length; i++) {
        const c = testCases[i]
        const inputs: any[] = Array.from(c.querySelectorAll(testInputSel))
        const outputs: any[] = Array.from(c.querySelectorAll(testOutputSel))
        for (let j = 0; j < inputs.length; j++) {
          const input = inputs[j].innerText
          const output = outputs[j].innerText
          tests.push({ input, output })
        }
      }
      return {
        tests,
        content: problem!.innerHTML.trim(),
      }
    }

    const { content, tests } = await extractInfo(url, getProblemDesc)
    const textContent = convert(content, {
      wordwrap: 100
    })

    return new Problem(problemId, textContent, tests)
  }

  async submit(problemId: string, project: Project) {
    const selectSel = 'input[id=language_select]'
    const uploadSel = 'input[id=sub_files_input][type=file]'
    const submitSel = 'input[type=submit][value=Submit]'
    const errorSel = 'span.error'

    const url = `${this.host}/problems/${problemId}/submit`
    await newPage(async page => {
      await page.setCookie(...this.config.getCookies(this.host))
      await page.goto(url, {
        waitUntil: 'networkidle2'
      })

      await Promise.all([selectSel, uploadSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(project.getLanguage())
      await page.type(selectSel, programType)

      const uploadHandle = await page.$(uploadSel)
      uploadHandle?.uploadFile(project.getBuiltFn())

      await page.click(submitSel)
      await page.waitForTimeout(2 * 60 * 1000)
    })
  }
}
