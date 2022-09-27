import { convert } from 'html-to-text'
import Site from '.'
import Config from '../config'
import { extractInfo, newPage, submitFormForCookies } from '../lib/crawler'
import Project from '../project'
import { Language, Problem } from '../types'
import BaseSite from './BaseSite'

const contestMap = new Map([
  ['indeednow_2015_quala', 'indeednow-quala'],
  ['indeednow_2015_qualb', 'indeednow-qualb'],
  ['indeednow_2015_finala', 'indeednow-finala-open'],
  ['indeednow_2015_finalb', 'indeednow-finalb-open'],
  ['code_festival_final', 'code-festival-2014-final']
])

const splitProblemId = (problemId: string): string[] => {
  const i = problemId.lastIndexOf('_')
  let contestId = problemId.substring(0, i)
  const taskId = problemId.substring(i + 1)

  if (contestMap.has(contestId)) contestId = contestMap.get(contestId)!
  else contestId = contestId.replace(/_/g, '-')

  return [contestId, taskId]
}

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Cpp: return '4003' // Clang '4004'
    case Language.Java: return '4005'
    case Language.Python: return '4006' // PyPy3 '4047'
    case Language.Dart: return '4018'
    case Language.Go: return '4026'
    case Language.Haskell: return '4027'
    case Language.JavaScript:
    case Language.TypeScript: return '4030'
    case Language.Kotlin: return '4032'
    case Language.Rust: return '4050'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class AtCoder extends BaseSite implements Site {
  constructor(config: Config) {
    super('atcoder', 'https://atcoder.jp', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}/login`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input#username', username],
        ['input#password', password]
      ]),
      ['button#submit']
    )

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    const [contestId] = splitProblemId(problemId)
    const url = `${this.host}/contests/${contestId}/tasks/${problemId}`

    const getProblemDesc = () => {
      const problemSel = 'div#task-statement'
      const partsSel = 'div#task-statement section'

      const problem = document.querySelector(problemSel)
      const parts = document.querySelectorAll(partsSel)
      const tests = []
      let testCase: any = {}
      for (let i = 0; i < parts.length; i++) {
        const part: any = parts[i]
        if (part.innerText.trim().startsWith('入力例')) {
          testCase.input = part.querySelector('pre').innerText
        } else if (part.innerText.trim().startsWith('出力例')) {
          testCase.output = part.querySelector('pre').innerText
          tests.push(testCase)
          testCase = {}
        }
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

  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    switch (lang) {
      case Language.Kotlin:
        return `kotlinc -language-version 1.3 ${srcFn} -include-runtime -d ${outFn} -XXLanguage:+InlineClasses`
      default:
        throw new Error(`Unsupported language ${lang}`)
    }
  }

  async submit(problemId: string, project: Project) {
    const [contestId] = splitProblemId(problemId)
    const selectSel = 'select'
    const uploadSel = 'input[id=input-open-file][type=file]'
    const submitSel = 'button[id=submit][type=submit]'
    const errorSel = 'span.error'

    const url = `${this.host}/contests/${contestId}/tasks/${problemId}`
    await newPage(async page => {
      await page.setCookie(...this.config.getCookies(this.host))
      await page.goto(url, { waitUntil: 'networkidle2' })

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
