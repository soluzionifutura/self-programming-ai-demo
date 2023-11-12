import { unlinkSync } from 'fs'
import { join } from 'path'

export default function deleteFunction({ name }: { name: string }): string {
  unlinkSync(join(__dirname, `${name}.json`))
  unlinkSync(join(__dirname, `${name}.js`))
  return `${name} function deleted successfully`
}
