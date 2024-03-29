import path from 'path'
import prompts from 'prompts'
import Config from './config'
import Cpp from './project/Cpp'
import Kotlin from './project/Kotlin'
import Nim from './project/Nim'
import TypeScript from './project/TypeScript'
import Site from './site'
import AlgoMethod from './site/AlgoMethod'
import AOJ from './site/AOJ'
import AtCoder from './site/AtCoder'
import CodeChef from './site/CodeChef'
import CodeForces from './site/CodeForces'
import CSES from './site/CSES'
import HackerEarth from './site/HackerEarth'
import HDU from './site/HDU'
import Kattis from './site/Kattis'
import POJ from './site/POJ'
import USACO from './site/USACO'
import UVa from './site/UVa'
import YukiCoder from './site/YukiCoder'
import { Language } from './types'

export function getSite(config: Config) {
  const siteName = config.site
  if (siteName === 'am') return new AlgoMethod(config)
  if (siteName === 'aoj') return new AOJ(config)
  if (siteName === 'atc') return new AtCoder(config)
  if (siteName === 'cc') return new CodeChef(config)
  if (siteName === 'cf') return new CodeForces(config)
  if (siteName === 'cses') return new CSES(config)
  if (siteName === 'he') return new HackerEarth(config)
  if (siteName === 'hdu') return new HDU(config)
  if (siteName === 'kattis') return new Kattis(config)
  if (siteName === 'poj') return new POJ(config)
  if (siteName === 'usaco') return new USACO(config)
  if (siteName === 'uva') return new UVa(config)
  if (siteName === 'ykc') return new YukiCoder(config)
  throw new Error(`unsupported site ${siteName}`)
}

export function getLang(config: Config) {
  const lang = config.language
  if (lang === 'cpp') return Language.Cpp
  if (lang === 'kotlin') return Language.Kotlin
  if (lang === 'typescript') return Language.TypeScript
  if (lang === 'nim') return Language.Nim
  throw new Error(`unsupported language ${lang}`)
}

export async function login(site: Site) {
  console.log('login to', site.host)
  try {
    await site.thirdPartyLogin()
  } catch (e) {
    const questions: any[] = [
      { type: 'text', name: 'username', message: 'username:' },
      { type: 'password', name: 'password', message: 'password:' }
    ]
    const resp = await prompts(questions)
    await site.login(resp.username, resp.password)
  }
}

function createProject(lang: Language, rootDir: string) {
  switch (lang) {
    case Language.Cpp: return new Cpp(rootDir)
    case Language.Kotlin: return new Kotlin(rootDir)
    case Language.TypeScript: return new TypeScript(rootDir)
    case Language.Nim: return new Nim(rootDir)
  }
  throw new Error(`unsupported project for language ${lang}`)
}

export async function newSolution(site: Site, problemId: string, lang: Language) {
  const rootDir = path.join(site.name, problemId)
  const project = createProject(lang, rootDir)

  const problem = await site.readProblem(problemId)
  await project.create(problem)
}

export async function buildSolution(site: Site, problemId: string, lang: Language) {
  const rootDir = path.join(site.name, problemId)
  const project = createProject(lang, rootDir)

  await project.build(site)
}

export async function testSolution(site: Site, problemId: string, lang: Language) {
  const rootDir = path.join(site.name, problemId)
  const project = createProject(lang, rootDir)

  await project.runTests()
}

export async function submitSolution(site: Site, problemId: string, lang: Language) {
  const rootDir = path.join(site.name, problemId)
  const project = createProject(lang, rootDir)

  await site.submit(problemId, project)
}

export async function selectSolution(site: Site, problemId: string, lang: Language, n: number) {
  const rootDir = path.join(site.name, problemId)
  const project = createProject(lang, rootDir)
  await project.select(n)
}
