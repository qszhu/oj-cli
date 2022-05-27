import Project from "../project"
import { Problem } from "../types"

export default interface Site {
  readonly name: string
  readonly host: string
  login(username: string, password: string): Promise<unknown>
  thirdPartyLogin(): Promise<unknown>
  readProblem(problemId: string): Promise<Problem>
  submit(problemId: string, project: Project): Promise<unknown>
}
