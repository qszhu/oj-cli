import Config from "../config";

export default abstract class BaseSite {
  constructor(public readonly name: string, public readonly host: string, protected config: Config) { }
}
