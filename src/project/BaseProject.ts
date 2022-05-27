import path, { basename } from 'path';
import { Language, Problem } from '../types';
import { ensureDir, getFiles, getFolders, linkFile, runCmd, writeStringToFile } from "../utils";

export default abstract class BaseProject {
  constructor(private rootDir: string, protected lang: Language) { }

  getLanguage() {
    return this.lang
  }

  protected getSourceDir() {
    return path.join(this.rootDir, 'src', this.lang)
  }

  protected getBuildDir() {
    return path.join(this.rootDir, 'build', this.lang)
  }

  protected getTestDir() {
    return path.join(this.rootDir, 'test')
  }

  protected getSourceFn() {
    return path.join(this.getSourceDir(), `solution.${this.lang}`)
  }

  getBuiltFn(): string {
    return path.join(this.getBuildDir(), `solution.${this.lang}`)
  }

  protected async getTargetSourceFn() {
    const srcDir = this.getSourceDir()
    await ensureDir(srcDir)
    const fns = await getFiles(srcDir, ent =>
      new RegExp(`solution\\d+.${this.lang}`).test(ent.name))
    const n = fns.length + 1
    return path.join(srcDir, `solution${n}.${this.lang}`)
  }

  private async writeTestToFile(i: number, input: string, output: string) {
    const inputFn = path.join(this.getTestDir(), `test${i + 1}`, 'in.txt')
    const outputFn = path.join(this.getTestDir(), `test${i + 1}`, 'out.txt')
    return Promise.all([
      writeStringToFile(inputFn, input),
      writeStringToFile(outputFn, output)
    ])
  }

  private async saveTestFiles(problem: Problem) {
    return Promise.all([...problem.tests.entries()]
      .map(([i, { input, output }]) => this.writeTestToFile(i, input, output)))
  }

  protected abstract getSrcTemplate(): string

  protected async newSolution(problem: Problem) {
    const fn = await this.getTargetSourceFn()
    const src = `/*
${problem.desc}
*/
${this.getSrcTemplate()}
`
    await writeStringToFile(fn, src)
    await linkFile(this.getSourceFn(), basename(fn))
  }

  async select(n: number) {
    const fn = path.join(this.getSourceDir(), `solution${n}.${this.lang}`)
    await linkFile(this.getSourceFn(), basename(fn))
  }

  async create(problem: Problem) {
    await this.saveTestFiles(problem)
    await this.newSolution(problem)
  }

  protected async beforeBuild() { }

  protected abstract getBuildCmd(srcFn: string, outFn: string): string

  async build() {
    await this.beforeBuild()
    const cmd = this.getBuildCmd(this.getSourceFn(), this.getBuiltFn())

    const { err, stdout, stderr } = await runCmd(cmd)
    if (err) throw new Error(stderr)

    console.error(stderr)
  }

  protected abstract getRunCmd(): string

  private async runTest(testCaseName: string) {
    const testFolder = `test${testCaseName}`
    console.log('*', testFolder)

    const inputFn = path.join(this.getTestDir(), testFolder, 'in.txt')
    const outputFn = path.join(this.getTestDir(), testFolder, 'out.txt')

    const cmd = `${this.getRunCmd()} < ${inputFn} | diff ${outputFn} -`

    const { err, stdout, stderr } = await runCmd(cmd)
    if (err) throw new Error(stdout)

    console.log('Passed.')
  }

  async runTests() {
    const testFolders = await getFolders(this.getTestDir(),
      ent => ent.name.startsWith('test'))

    let allPassed = true
    for (const folder of testFolders) {
      const testCaseName = folder.name.substring(4)
      try {
        await this.runTest(testCaseName)
      } catch (e) {
        allPassed = false
        console.error(e)
      }
    }

    if (allPassed) {
      console.log('All tests passed.')
    }
  }
}
