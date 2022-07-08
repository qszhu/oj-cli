import fs from 'fs';
import path from "path";
import { promisify } from "util";
import Project from ".";
import { Language } from "../types";
import { ensureDir } from "../utils";
import BaseProject from "./BaseProject";

export default class Kotlin extends BaseProject implements Project {
  constructor(rootDir: string) {
    super(rootDir, Language.Kotlin)
  }

  protected getSrcTemplate(): string {
    return TMPL
  }

  private getJarFn(): string {
    return path.join(this.getBuildDir(), 'solution.jar')
  }

  protected async beforeBuild() {
    const srcFn = this.getSourceFn()
    const outFn = this.getBuiltFn()
    await ensureDir(path.dirname(outFn))
    await promisify(fs.copyFile)(srcFn, outFn)
  }

  protected getBuildCmd(srcFn: string, outFn: string) {
    const jarFn = this.getJarFn()
    return `kotlinc ${srcFn} -include-runtime -d ${jarFn}`
  }

  protected getRunCmd() {
    return `java -jar ${this.getJarFn()}`
  }
}

const TMPL = `
fun readInt() = readln().toInt()
fun readLong() = readln().toLong()
fun readStrings() = readln().split(" ")
fun readInts() = readStrings().map { it.toInt() }
fun readLongs() = readStrings().map { it.toLong() }
fun readLines(n: Int) = List(n) { readln() }

fun main() {
    // TODO
    val n = readLong()
    output(solve(n))
}

fun solve(n: Long): Long {
    // TODO
    return 0L
}

fun output(res: Long) {
    // TODO
    println(res)
}
`
