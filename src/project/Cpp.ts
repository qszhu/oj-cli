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
    return `g++-11 -std=${STD} -O2 -Wall ${srcFn} -o ${this.getExecutableFn()}`
  }

  protected getRunCmd(): string {
    return `${this.getExecutableFn()}`
  }
}

const TMPL = `#include <bits/stdc++.h>
using namespace std;

#define rep(i, a) for (int i = 0; i < (int)(a); ++i)
#define rep2(i, a, b) for (int i = (int)(a); i < (int)(b); ++i)
#define trav(a, x) for (auto& a : x)
#define all(x) x.begin(), x.end()
#define sz(x) (int)(x).size()

using ll = long long;
using pii = pair<int, int>;
using vi = vector<int>;
using vvi = vector<vi>;

template <typename T>
bool chmax(T &a, const T& b) {
  return a < b ? a = b, true : false;
}

template <typename T>
bool chmin(T &a, const T& b) {
  return a > b ? a = b, false : false;
}

int n;

int solve() {
  return 0;
}

void output(int res) {
  cout << res << endl;
}

void setIO(string s) {
  freopen((s + ".in").c_str(), "r", stdin);
  freopen((s + ".out").c_str(), "w", stdout);
}

int main() {
  setIO("problem");
  cin >> n;
  output(solve());
  return 0;
}
`
