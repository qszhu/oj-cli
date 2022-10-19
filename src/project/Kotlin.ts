import fs from 'fs'
import path from 'path'
import Project from '.'
import { Language } from '../types'
import { ensureDir } from '../utils'
import BaseProject from './BaseProject'

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

  protected async afterBuild() {
    const srcFn = this.getBuiltFn()
    const b64str = fs.readFileSync(srcFn).toString('base64')

    const outFn = this.getSubmitFn()
    await ensureDir(path.dirname(outFn))

    fs.writeFileSync(outFn, `
import java.io.ByteArrayInputStream
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

const TMPL = `import kotlin.system.exitProcess

val br = System.\`in\`.bufferedReader()

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

fun main() {
  val thread = Thread(null, ::run, "solve", MAX_STACK_SIZE)
  thread.setUncaughtExceptionHandler { _, e -> e.printStackTrace(); exitProcess(1) }
  thread.start()
}

fun run() {
  // TODO
  val t = readInt()
  output((1..t).map {
      val n = readLong()
      solve(n)
  })
}

fun solve(n: Long): LongArray {
  // TODO
  return LongArray(2)
}

fun output(res: List<LongArray>) {
  // TODO
  if (res.isEmpty()) return
  res.joinToString("\\n") { it.joinToString(" ") }
      .apply { println(this) }
}
`
