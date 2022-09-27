import Project from '../project'
import { Language, Problem } from '../types'

export default interface Site {
  readonly name: string
  readonly host: string
  login(username: string, password: string): Promise<unknown>
  thirdPartyLogin(): Promise<unknown>
  readProblem(problemId: string): Promise<Problem>
  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string
  submit(problemId: string, project: Project): Promise<unknown>
}
