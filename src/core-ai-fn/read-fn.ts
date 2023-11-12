import { readFileSync } from "fs"
import { join } from "path"

export default function({ name }: { name: string }): string {
  return readFileSync(join(__dirname, `../../generated-ai-fns/${name}.js`), "utf8")
}
