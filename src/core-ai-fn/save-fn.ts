import { writeFileSync } from "fs"
import { join } from "path"

export default function({ name, description, parameters, fn }: { name: string, description: string, parameters: string, fn: string }): string {
  writeFileSync(join(__dirname, `../../generated-ai-fns/${name}.json`), JSON.stringify({
    name,
    description,
    parameters
  }, null, 2))

  writeFileSync(join(__dirname, `../../generated-ai-fns/${name}.js`), fn)

  return JSON.stringify({
    name,
    description,
    parameters,
    fn
  })
}
