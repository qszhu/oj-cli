import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

export async function ensureDir(dir: string) {
  await promisify(fs.mkdir)(dir, { recursive: true })
}

export async function writeStringToFile(fn: string, content: string) {
  await ensureDir(path.dirname(fn))
  return promisify(fs.writeFile)(fn, content, 'utf-8')
}

export async function linkFile(from: string, to: string) {
  if (fs.existsSync(from)) await promisify(fs.unlink)(from)
  return promisify(fs.symlink)(to, from)
}

export async function runCmd(cmd: string): Promise<any> {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr })
    })
  })
}

export async function getFolders(root: string, pred: (ent: fs.Dirent) => boolean) {
  const ents = await promisify(fs.readdir)(root, { withFileTypes: true })
  return ents.filter(ent => ent.isDirectory() && pred(ent))
}

export async function getFiles(root: string, pred: (ent: fs.Dirent) => boolean) {
  const ents = await promisify(fs.readdir)(root, { withFileTypes: true })
  return ents.filter(ent => ent.isFile() && pred(ent))
}
