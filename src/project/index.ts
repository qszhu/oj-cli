import Site from '../site'
import { Language, Problem } from '../types'

export default interface Project {
  getLanguage(): Language
  getBuiltFn(): string
  getSubmitFn(): string
  getSource(): string
  create(problem: Problem): Promise<unknown>
  build(site: Site): Promise<unknown>
  runTests(): Promise<unknown>
  select(n: number): Promise<unknown>
}
