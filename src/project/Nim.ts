import fs from 'fs'
import path from 'path'
import Project from '.'
import Site from '../site'
import { Language } from '../types'
import { ensureDir, runCmd } from '../utils'
import BaseProject from './BaseProject'

export default class Nim extends BaseProject implements Project {
  constructor(rootDir: string) {
    super(rootDir, Language.Nim)
  }

  protected getSrcTemplate(): string {
    return TMPL
  }

  public getBuiltFn(): string {
    return path.join(this.getBuildDir(), 'solution')
  }

  public getSubmitFn(): string {
    return path.join(this.getBuildDir(), 'solution.nim')
  }

  async build(site: Site) {
    const cmd = site.getBuildCmdFromLang(this.lang, this.getSourceFn(), this.getBuiltFn())
    console.log(cmd)

    const { err, stdout, stderr } = await runCmd(cmd)
    if (err) throw new Error(stderr)

    console.error(stderr)
    await this.copySource()
  }

  async copySource() {
    const srcFn = this.getSourceFn()
    const dstFn = this.getSubmitFn()
    ensureDir(path.dirname(dstFn))
    fs.copyFileSync(srcFn, dstFn)
  }

  protected getRunCmd() {
    return `${this.getBuiltFn()}`
  }
}

const TMPL = `import std/[
  algorithm,
  bitops,
  complex,
  deques,
  heapqueue,
  intsets,
  lenientops,
  math,
  macros,
  pegs,
  re,
  sequtils,
  sets,
  stats,
  strformat,
  strscans,
  strutils,
  sugar,
  tables,
]

proc readString(): string = stdin.readLine
proc readInt(): int = readString().parseInt
proc readFloat(): float = readString().parseFloat
proc readStrings(): seq[string] = readString().split
proc readInts(): seq[int] = readStrings().map(parseInt)
proc readFloats(): seq[float] = readStrings().map(parseFloat)

template doWhile(cond, body: untyped): untyped =
  body
  while cond:
    body

template repeat(n: int, statements: untyped) =
  for i in 0..<n:
    statements

template chmax(x, y: typed): void = x = max(x, y)
template chmin(x, y: typed): void = x = min(x, y)

# v1.1
template countIt*(s, pred: untyped): int =
  var result = 0
  for it {.inject.} in s:
    if pred: result += 1
  result

# v1.3
proc toDeque[T](x: openArray[T]): Deque[T] =
  result = initDeque[T](x.len)
  for item in x: result.addLast item

# v1.3, suboptimal, siftdown is private
proc toHeapQueue[T](x: openArray[T]): HeapQueue[T] =
  result = initHeapQueue[T]()
  for item in x: result.push item

# v1.3
proc toIntSet(x: openArray[int]): IntSet =
  result = initIntSet()
  for item in x: result.incl item

################################################################################

var
  a, b, c: int
  s: string
  res: string

proc input =
  a = readInt()
  (b, c) = readInts()
  s = readString()

proc solve =
  res = &"{a+b+c} {s}"

proc output =
  echo res

################################################################################

proc main =
  input()
  solve()
  output()

when isMainModule:
  main()
`
