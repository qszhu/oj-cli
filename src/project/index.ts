import { Language, Problem } from "../types";

export default interface Project {
  getLanguage(): Language
  getBuiltFn(): string
  create(problem: Problem): Promise<unknown>
  build(): Promise<unknown>
  runTests(): Promise<unknown>
  select(n: number): Promise<unknown>
}
