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
    return `kotlinc -language-version 1.3 ${srcFn} -include-runtime -d ${jarFn}`
    // return `kotlinc ${srcFn} -include-runtime -d ${jarFn}`
  }

  protected getRunCmd() {
    return `java -jar ${this.getJarFn()}`
  }
}

const TMPL = `import kotlin.system.exitProcess

fun readString() = readLine()!!
fun readInt() = readString().toInt()
fun readLong() = readString().toLong()
fun readStrings() = readString().split(" ")
fun readInts() = readStrings().map { it.toInt() }.toIntArray()
fun readLongs() = readStrings().map { it.toLong() }.toLongArray()
fun readLines(n: Int) = Array(n) { readString() }

const val MAX_STACK_SIZE: Long = 128 * 1024 * 1024

fun main() {
    // TODO
    val n = readLong()

    val thread = Thread(null, Runnable {
      output(solve(n))
    }, "solve", MAX_STACK_SIZE)
    thread.setUncaughtExceptionHandler { _, e -> e.printStackTrace(); exitProcess(1) }
    thread.start()
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
