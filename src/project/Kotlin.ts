import fs from 'fs'
import path from 'path'
import Project from '.'
import Site from '../site'
import { Language } from '../types'
import { ensureDir, runCmd } from '../utils'
import BaseProject from './BaseProject'

export class KotlinBuildOptions {
  constructor(public packJar = false) { }
}
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

  async build(site: Site) {
    const buildOption = site.getBuildOption(this.lang) as KotlinBuildOptions

    const cmd = site.getBuildCmdFromLang(this.lang, this.getSourceFn(), this.getBuiltFn())
    console.log(cmd)

    const { err, stdout, stderr } = await runCmd(cmd)
    if (err) throw new Error(stderr)

    console.error(stderr)
    if (buildOption.packJar) await this.packJar()
    else await this.copySource()
  }

  async copySource() {
    const srcFn = this.getSourceFn()
    const dstFn = this.getSubmitFn()
    ensureDir(path.dirname(dstFn))
    fs.copyFileSync(srcFn, dstFn)
  }

  async packJar() {
    const srcFn = this.getBuiltFn()
    const b64str = fs.readFileSync(srcFn).toString('base64')

    const outFn = this.getSubmitFn()
    await ensureDir(path.dirname(outFn))

    fs.writeFileSync(outFn, `
import java.io.*
import java.util.*
import java.util.jar.JarInputStream

class MemClassLoader(): ClassLoader() {
    private val classContents = mutableMapOf<String, ByteArray>()

    init {
        val b64str = "${b64str}"
        val bytes = Base64.getDecoder().decode(b64str)
        val jis = JarInputStream(ByteArrayInputStream(bytes))
        var entry = jis.nextJarEntry
        while (entry != null) {
            var name = entry.name
            val size = entry.size.toInt()
            if (name.endsWith(".class")) {
                name = name.substringBeforeLast(".class")
                if (size != -1) {
                    val buf = ByteArray(size)
                    jis.read(buf, 0, size)
                    classContents[name] = buf
                } else {
                    classContents[name] = jis.readAllBytes()
                }
            }
            entry = jis.nextJarEntry
        }
    }

    override fun findClass(name: String?): Class<*> {
        val buf = classContents[name]
        return defineClass(name, buf, 0, buf!!.size)
    }
}

fun main() {
    val loader = MemClassLoader()
    val klass = Class.forName("SolutionKt", true, loader)
    val main = klass.getMethod("main")
    try {
        main.invoke(null)
    } catch (e: Exception) {
        println(e.cause)
    }
}
`)
  }

  protected getRunCmd() {
    return `kotlin -classpath ${this.getBuiltFn()} SolutionKt`
  }
}

const TMPL = `import java.io.PrintWriter
import kotlin.system.exitProcess

val br = System.\`in\`.bufferedReader()
var out = PrintWriter(System.out.bufferedWriter())

fun readLine(): String? = br.readLine()
fun readString() = readLine()!!
fun readInt() = readString().toInt()
fun readLong() = readString().toLong()
fun readDouble() = readString().toDouble()
fun readStrings() = readLine()?.split(" ")?.filter { it.isNotEmpty() } ?: listOf()
fun readInts() = readStrings().map { it.toInt() }.toIntArray()
fun readLongs() = readStrings().map { it.toLong() }.toLongArray()
fun readDoubles() = readStrings().map { it.toDouble() }.toDoubleArray()
fun readLines(n: Int) = Array(n) { readString() }

const val MAX_STACK_SIZE: Long = 128 * 1024 * 1024

class Solution {
    // TODO
    var t: Int = 0
    var n: Long = 0
    lateinit var res: List<Long>

    fun run() {
        // TODO
        t = readInt()
        (1..t).map {
            n = readLong()
            solve()
            output()
        }
        out.flush()
    }

    fun solve() {
        res = mutableListOf()
    }

    fun output() {
        if (res.isEmpty()) return
        out.println(res.joinToString(" "))
    }

    fun main() {
        val thread = Thread(null, ::run, "solve", MAX_STACK_SIZE)
        thread.setUncaughtExceptionHandler { _, e -> e.printStackTrace(); exitProcess(1) }
        thread.start()
    }
}

fun main() {
    Solution().main()
}
`
