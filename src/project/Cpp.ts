import fs from 'fs';
import path from "path";
import { promisify } from "util";
import Project from ".";
import { Language } from "../types";
import { ensureDir } from "../utils";
import BaseProject from "./BaseProject";

const STD = 'c++17'

export default class Cpp extends BaseProject implements Project {
  constructor(rootDir: string) {
    super(rootDir, Language.Cpp)
  }

  protected getSrcTemplate(): string {
    return TMPL
  }

  private getExecutableFn(): string {
    return path.join(this.getBuildDir(), 'solution')
  }

  protected async beforeBuild() {
    const srcFn = this.getSourceFn()
    const outFn = this.getBuiltFn()
    await ensureDir(path.dirname(outFn))
    await ensureDir(path.dirname(this.getExecutableFn()))
    await promisify(fs.copyFile)(srcFn, outFn)
  }

  protected getBuildCmd(srcFn: string, outFn: string): string {
    return `g++ -std=${STD} -O2 -Wall ${srcFn} -o ${this.getExecutableFn()}`
  }

  protected getRunCmd(): string {
    return `${this.getExecutableFn()}`
  }
}

const TMPL = `
#include <iostream>
using namespace std;

int solve(int n) {
  return 0;
}

void output(int res) {
  cout << res << endl;
}

int main() {
  int n;
  cin >> n;
  output(solve(n));
  return 0;
}
`
