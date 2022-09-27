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
        { title: 'AtCoder', value: 'atc' },
        { title: 'CodeForces', value: 'cf' },
        { title: 'Kattis', value: 'kattis' },
        { title: 'UVa', value: 'uva' },
        { title: 'POJ', value: 'poj' },
        { title: 'CSES', value: 'cses' },
        { title: 'HDU', value: 'hdu' },
        { title: 'USACO', value: 'usaco' },
        { title: 'HackerEarth', value: 'he' },
        { title: 'CodeChef', value: 'cc' },
        { title: 'AOJ', value: 'aoj' }
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
