import Config from "../config";
import { Language } from "../types";

export default abstract class BaseSite {
  constructor(public readonly name: string, public readonly host: string, protected config: Config) { }

  getBuildCmdFromLang(lang: Language, srcFn: string, outFn: string): string {
    throw new Error('not implemented')
  }
}
