import { convert } from "html-to-text";
import Site from ".";
import Config from "../config";
import { extractInfo, newPage, submitFormForCookies } from "../lib/crawler";
import Project from "../project";
import { Language, Problem } from "../types";
import BaseSite from "./BaseSite";

const splitProblemId = (problemId: string): [number, string] => {
  const n = problemId.match(/^(\d+)/)![0]
  return [Number(n), problemId.substring(n.length)]
}

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Go: return '32'
    case Language.Cpp: return '54'
    case Language.JavaScript:
    case Language.TypeScript: return '55'
    case Language.Java: return '60'
    case Language.Python: return '70'
    case Language.Rust: return '75'
    case Language.Kotlin: return '77'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class CodeForces extends BaseSite implements Site {
  constructor(config: Config) {
    super('codeforces', 'https://codeforces.com', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}/enter`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input#handleOrEmail', username],
        ['input#password', password]
      ]),
      ['input#remember', 'input.submit']
    )

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    const [contestId, problemIndex] = splitProblemId(problemId)
    const url = `${this.host}/contest/${contestId}/problem/${problemIndex}`

    const getProblemDesc = () => {
      const problemSel = 'div.problem-statement'
      const testsSel = 'div.problem-statement div.sample-test'
      const testInputSel = 'div.input pre'
      const testOutputSel = 'div.output pre'

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

  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    switch (lang) {
      case Language.Kotlin:
        return `kotlinc -language-version 1.6 ${srcFn} -include-runtime -d ${outFn} -jvm-target 11`
      default:
        throw new Error(`Unsupported language ${lang}`)
    }
  }

  async submit(problemId: string, project: Project) {
    const [contestId, problemIndex] = splitProblemId(problemId)
    const selectSel = 'select[name=programTypeId]'
    const uploadSel = 'input[name=sourceFile][type=file]'
    const submitSel = 'input[type=submit][value=Submit]'
    const errorSel = 'span.error'

    const url = `${this.host}/contest/${contestId}/problem/${problemIndex}`
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
