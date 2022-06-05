# Requirements

* Node.js >= v14.1

# Supported Sites and Referenced Guide Books

- [x] [AtCoder](https://atcoder.jp/)
- [x] [CodeForces](https://codeforces.com/)
  * https://www.vplanetcoding.com
  * https://usaco.guide/
- [x] [Kattis](https://open.kattis.com/)
  * Johan Sannemo, *Principles of Algorithmic Problem Solving*
- [x] [CSES](https://cses.fi/)
  * Antti Laaksonen, *Guide to Competitive Programming*
- [x] [USACO](http://usaco.org/)
  * https://usaco.guide/
- [x] HDU
  * 陈小玉, *算法训练营*
- [ ] POJ
  * 陈小玉, *算法训练营*
- [ ] UVa
  * 陈小玉, *算法训练营*
- [ ] 洛谷
  * 陈小玉, *算法训练营*

# Supported Languages and Required Compilers

- [x] TypeScript
  * `esbuild`
- [x] Kotlin
  * `kotlinc`
- [x] C++
  * `g++`
- [ ] Python
- [ ] Go
- [ ] Java
- [ ] Rust
- [ ] Dart
- [ ] Haskell
- [ ] OCaml
- [ ] Elixir

# Usage

## Install

```bash
$ npm i -g ya-oj-cli
```

## Login to OJ

```bash
$ oj login --site=codeforces
```

## Create Solution

```bash
$ oj new 1A --lang=cpp
```

## Build Solution

```bash
$ oj build
```

## Test Solution

```bash
$ oj test
```

## Submit Solution

```bash
$ oj submit
```

# Known Issues

* \[USACO\] Problems before 2020 requires file IO.
* \[USACO\] Use at your own risk:
> Submission of code must be done via the interface on the usaco.org website (i.e., by selecting your file and clicking "submit solution"); attempts to submit via other means (e.g., scripts that attempt to automate this process) are NOT permitted. - http://www.usaco.org/index.php?page=instructions
* \[HDU\] C++ multi-line comments causes CE.
