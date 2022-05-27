import path from 'path';
import Project from '.';
import { Language } from "../types";
import BaseProject from "./BaseProject";

const TARGET = 'node10.0'

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

const main = (lines: string[]): void => {
  let i = 0
  for (let t = Number(lines[i++]); t > 0; t--) {
    // TODO
    const args = lines[i++]
    output(solve(args))
  }
}

const solve = (args: any): any => {
  // TODO
}

const output = (res: any): void => {
  // TODO
  console.log(res)
}
`
