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

const TMPL = `// https://gist.github.com/reza-ryte-club/97c39f35dab0c45a5d924dd9e50c445f
#ifndef _GLIBCXX_NO_ASSERT
#include <cassert>
#endif
#include <cctype>
#include <cerrno>
#include <cfloat>
#include <ciso646>
#include <climits>
#include <clocale>
#include <cmath>
#include <csetjmp>
#include <csignal>
#include <cstdarg>
#include <cstddef>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <ctime>

#if __cplusplus >= 201103L
#include <ccomplex>
#include <cfenv>
#include <cinttypes>
#include <cstdbool>
#include <cstdint>
#include <ctgmath>
#include <cwchar>
#include <cwctype>
#endif

// C++
#include <algorithm>
#include <bitset>
#include <complex>
#include <deque>
#include <exception>
#include <fstream>
#include <functional>
#include <iomanip>
#include <ios>
#include <iosfwd>
#include <iostream>
#include <istream>
#include <iterator>
#include <limits>
#include <list>
#include <locale>
#include <map>
#include <memory>
#include <new>
#include <numeric>
#include <ostream>
#include <queue>
#include <set>
#include <sstream>
#include <stack>
#include <stdexcept>
#include <streambuf>
#include <string>
#include <typeinfo>
#include <utility>
#include <valarray>
#include <vector>

#if __cplusplus >= 201103L
#include <array>
#include <atomic>
#include <chrono>
#include <condition_variable>
#include <forward_list>
#include <future>
#include <initializer_list>
#include <mutex>
#include <random>
#include <ratio>
#include <regex>
#include <scoped_allocator>
#include <system_error>
#include <thread>
#include <tuple>
#include <typeindex>
#include <type_traits>
#include <unordered_map>
#include <unordered_set>
#endif

using namespace std;

#define rep(i, a) for (int i = 0; i < (int)(a); ++i)
#define rep2(i, a, b) for (int i = (int)(a); i < (int)(b); ++i)
#define trav(a, x) for (auto& a : x)
#define all(x) x.begin(), x.end()
#define sz(x) (int)(x).size()

typedef long long ll;
typedef pair<int, int> pii;
typedef vector<int> vi;

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
