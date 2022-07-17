import path from 'path';
import Project from '.';
import { Language } from "../types";
import BaseProject from "./BaseProject";

const TARGET = 'node12.16.1'

export default class TypeScript extends BaseProject implements Project {
  constructor(rootDir: string) {
    super(rootDir, Language.TypeScript)
  }

  getBuiltFn(): string {
    return path.join(this.getBuildDir(), 'solution.js')
  }

  protected getSrcTemplate(): string {
    return TMPL
  }

  protected getBuildCmd(srcFn: string, outFn: string) {
    return `esbuild ${srcFn} --bundle --platform=node --target=${TARGET} --outfile=${outFn}`
  }

  protected getRunCmd() {
    return `node ${this.getBuiltFn()}`
  }
}

const TMPL = `
const lines: string[] = []

require('readline').createInterface({
  input: process.stdin
}).on('line', (line: string) => lines.push(line))

process.stdin.on('end', () => {
  main(lines)
})

let args: number[]

const main = (lines: string[]): void => {
  let _ln = 0
  const readString = () => lines[_ln++]
  const readStrings = () => readString().split(' ')
  const readNumber = () => Number(readString())
  const readNumbers = () => readStrings().map(Number)

  for (let [t] = readNumbers(); t > 0; t--) {
    // TODO
    args = readNumbers()
    output(solve())
  }
}

const solve = () => {
  // TODO
}

const output = (res: any) => {
  // TODO
  console.log(res)
}
`
