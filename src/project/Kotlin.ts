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

  public getBuiltFn(): string {
    return path.join(this.getBuildDir(), 'solution.jar')
  }

  public getSubmitFn(): string {
    return path.join(this.getBuildDir(), 'solution.kt')
  }

  protected async beforeBuild() {
    const srcFn = this.getSourceFn()
    const outFn = this.getSubmitFn()
    await ensureDir(path.dirname(outFn))
    await promisify(fs.copyFile)(srcFn, outFn)
  }

  protected getRunCmd() {
    return `java -jar ${this.getBuiltFn()}`
  }
}

const TMPL = `import kotlin.system.exitProcess

val br = System.\`in\`.bufferedReader()

fun readString() = br.readLine()!!
fun readInt() = readString().toInt()
fun readLong() = readString().toLong()
fun readDouble() = readString().toDouble()
fun readStrings() = readString().split(" ")
fun readInts() = readStrings().map { it.toInt() }.toIntArray()
fun readLongs() = readStrings().map { it.toLong() }.toLongArray()
fun readDoubles() = readStrings().map { it.toDouble() }.toDoubleArray()
fun readLines(n: Int) = Array(n) { readString() }

const val MAX_STACK_SIZE: Long = 128 * 1024 * 1024

fun main() {
    val thread = Thread(null, {
        // TODO
        val n = readLong()

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
