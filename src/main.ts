#!/usr/bin/env node

import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import Config from './config'
import * as funcs from './funcs'
import * as prompt from './prompt'

const config = Config.load()

async function main() {
  const argv = await yargs(hideBin(process.argv)).argv
  const [cmd, param] = argv._

  if (argv.site) {
    config.site = String(argv.site)
  }
  if (param) {
    config.problemId = String(param)
  }
  if (argv.lang) {
    config.language = String(argv.lang)
  }

  if (!config.site) config.site = await prompt.promptSite()
  if (!config.problemId) config.problemId = await prompt.promptProblem()
  if (!config.language) config.language = await prompt.promptLang()

  const site = funcs.getSite(config)
  const lang = funcs.getLang(config)
  const problemId = config.problemId

  if (cmd === 'new') {
    await prompt.confirm(site, problemId, lang)
    await funcs.newSolution(site, problemId, lang)
  } else if (cmd === 'build') await funcs.buildSolution(site, problemId, lang)
  else if (cmd === 'test') await funcs.testSolution(site, problemId, lang)
  else if (cmd === 'submit') await funcs.submitSolution(site, problemId, lang)
  else if (cmd === 'login') await funcs.login(site)
  else if (cmd === 'select') await funcs.selectSolution(site, problemId, lang, Number(param))
}

if (require.main === module) {
  main().catch(console.error)
}

