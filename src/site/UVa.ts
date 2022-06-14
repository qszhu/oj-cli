import Site from ".";
import Config from "../config";
import { newPage, submitFormForCookies } from "../lib/crawler";
import Project from "../project";
import { Language, Problem } from "../types";
import BaseSite from "./BaseSite";

function programTypeFromLang(lang: Language): string {
  switch (lang) {
    case Language.Java: return '2'
    case Language.Cpp: return '5'
    case Language.Python: return '6'
  }
  throw new Error(`unsupported languge ${lang}`)
}

export default class UVa extends BaseSite implements Site {
  constructor(config: Config) {
    super('uva', 'https://onlinejudge.org', config)
  }

  async login(username: string, password: string) {
    const url = `${this.host}/index.php`

    const cookies = await submitFormForCookies(url,
      new Map([
        ['input#mod_login_username', username],
        ['input#mod_login_password', password]
      ]),
      [
        'input#mod_login_remember',
        'input[value=Login][type=submit]'
      ]
    )
    // TODO: wait for selector

    this.config.setCookies(this.host, cookies)
  }

  async thirdPartyLogin() {
    throw new Error("Method not implemented.");
  }

  async readProblem(problemId: string) {
    return new Problem(problemId, '', [{ input: '', output: '' }])
  }

  async submit(problemId: string, project: Project) {
    const selectSel = 'input[name=language]'
    const uploadSel = 'input[type=file][name=codeupl]'
    const submitSel = 'input[value=Submit][type=submit]'

    const url = `${this.host}/index.php?option=com_onlinejudge&Itemid=8&page=submit_problem&problemid=${problemId}&category=0`
    await newPage(async page => {
      await page.setCookie(...this.config.getCookies(this.host))
      await page.goto(url, {
        waitUntil: 'networkidle2'
      })

      await Promise.all([selectSel, uploadSel, submitSel]
        .map(s => page.waitForSelector(s)))

      const programType = programTypeFromLang(project.getLanguage())
      await page.click(`input[name=language][value="${programType}"]`)

      const uploadHandle = await page.$(uploadSel)
      uploadHandle?.uploadFile(project.getBuiltFn())

      await page.click(submitSel)
      await page.waitForTimeout(2 * 60 * 1000)
    })
  }
}
