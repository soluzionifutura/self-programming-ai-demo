import OpenAI from "openai"
import { config } from "dotenv"
import { readFileSync, readdirSync, writeFileSync } from "fs"
import { join, parse } from "path"
import { ChatCompletionMessageParam, ChatCompletionTool, FunctionDefinition } from "openai/resources"

config()

const {
  OPENAI_KEY
} = process.env

const HISTORY_FILE_PATH = join(__dirname, "../history.json")

const history: ChatCompletionMessageParam[] = []
const saveHistory = (): void => {
  writeFileSync(HISTORY_FILE_PATH, JSON.stringify(history, null, 2))
}

try {
  history.push(...JSON.parse(readFileSync(HISTORY_FILE_PATH, "utf8")))
} catch(_) {
  saveHistory()
}


const openai = new OpenAI({ apiKey: OPENAI_KEY })

const functions: Record<string, {
  core: boolean,
  path: string,
  tool: ChatCompletionTool
}> = {}

void ["./core-ai-fn", "../generated-ai-fns"].forEach(folder => {
  readdirSync(join(__dirname, folder)).forEach((file) => {
    const { ext, name } = parse(file)
    if (ext === ".json") {
      const functionDefinition = JSON.parse(readFileSync(join(__dirname, folder, file), "utf8")) as FunctionDefinition

      if (!functionDefinition.parameters) {
        functionDefinition.parameters = {
          type: "object",
          properties: {}
        }
      }

      functions[name] = {
        core: folder === "./core-ai-fn",
        path: join(__dirname, folder, `${name}.js`),
        tool: {
          type: "function",
          function: functionDefinition
        }
      }
    }
  })
})

const execute = async(messages: ChatCompletionMessageParam[]): Promise<void> => {
  history.push(...messages)
  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    tools: Object.values(functions).map(({ tool }) => tool),
    messages: [
      { role: "system", content: `
      You are a salf programmed bot,
      CAREFULLY UNDESTAND YOUR FUNCTIONS: this is a list of all your functions:
      ${Object.entries(functions).map(([key, { core, tool: { function: { description } } }]) => `${key} (type: ${core ? "CORE" : "GENERATED"}): ${description}`).join("\n")}.` },
      ...history
    ],
  })

  const { content , tool_calls } = chatCompletion.choices[0].message
  if (content) {
    history.push({ role: "assistant", content })
    console.log(content)
  } else if (tool_calls) {
    console.dir(tool_calls, { depth: null })
    history.push({ role: "assistant", tool_calls, content: null })

    const messages: ChatCompletionMessageParam[] = await Promise.all(tool_calls.map(async(tool_call) => {
      const { id, type, function: { name: fnName, arguments: fnArgsJSON } } = tool_call

      if (type !== "function") {
        throw new Error(`Unknown tool type ${type}`)
      }

      try {
        const fnArgs = JSON.parse(fnArgsJSON)
        console.log(functions[fnName].path)
        const fn = require(functions[fnName].path).default
        const result = String(await fn(fnArgs))
        return { role: "tool", tool_call_id: id, "content": result }
      } catch(err) {
        const { stack } = err as Error
        return { role: "tool", tool_call_id: id, "content": `Error: ${stack}; Explain the error SHORTLY, and IN DETAILS.` }
      }
    }))

    await execute(messages)
  }

  saveHistory()
}

execute([{ role: "user", content: process.argv[2] }])
