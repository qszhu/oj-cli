export enum Language {
  Python = 'py',
  Java = 'java',
  Cpp = 'cpp',
  JavaScript = 'js',
  Go = 'go',
  Rust = 'rs',
  Kotlin = 'kt',
  Dart = 'dart',
  Haskell = 'hs',
  TypeScript = 'ts',
}

export class TestCase {
  constructor(
    public readonly input: string,
    public readonly output: string
  ) { }
}

export class Problem {
  constructor(
    public readonly id: string,
    public readonly desc: string,
    public readonly tests: TestCase[]
  ) { }
}
