import prompts from 'prompts'
import Site from './site'
import { Language } from './types'

export async function promptSite() {
  const resp = await prompts([
    {
      type: 'select',
      name: 'site',
      message: 'choose a site:',
      choices: [
        { title: 'アルゴ式', value: 'am' },
        { title: 'AOJ', value: 'aoj' },
        { title: 'AtCoder', value: 'atc' },
        { title: 'CodeChef', value: 'cc' },
        { title: 'CodeForces', value: 'cf' },
        { title: 'CSES', value: 'cses' },
        { title: 'HackerEarth', value: 'he' },
        { title: 'HDU', value: 'hdu' },
        { title: 'Kattis', value: 'kattis' },
        { title: 'POJ', value: 'poj' },
        { title: 'USACO', value: 'usaco' },
        { title: 'UVa', value: 'uva' },
        { title: 'yukicoder', value: 'yc' }
      ]
    }
  ])
  return resp.site
}

export async function promptProblem() {
  const resp = await prompts([
    {
      type: 'text',
      name: 'problem',
      message: 'problem id:',
    }
  ])
  return resp.problem
}

export async function promptLang() {
  const resp = await prompts([
    {
      type: 'select',
      name: 'lang',
      message: 'choose a language:',
      choices: [
        { title: 'C++', value: 'cpp' },
        { title: 'Kotlin', value: 'kotlin' },
        { title: 'TypeScript', value: 'typescript' }
      ]
    }
  ])
  return resp.lang
}

export async function confirm(site: Site, problemId: string, lang: Language) {
  const message = [
    `site: ${site.name}`,
    `problem: ${problemId}`,
    `language: ${lang}`,
    'proceed?'
  ].join('\n')
  const resp = await prompts([
    {
      type: 'confirm',
      name: 'confirm',
      message,
      initial: true
    }
  ])
  if (!resp.confirm) process.exit()
}
