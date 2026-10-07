declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PAYLOAD_SECRET: string
      DATABASE_URL: string
      NEXT_PUBLIC_SERVER_URL: string
      VERCEL_PROJECT_PRODUCTION_URL: string
      CRON_SECRET: string
      PREVIEW_SECRET: string
      CHATBOT_ENABLED?: string
      AI_PROVIDER?: string
      GOOGLE_GENERATIVE_AI_API_KEY?: string
      GOOGLE_MODEL?: string
      OPENAI_MODEL?: string
      OPENAI_API_KEY?: string
      OPENAI_MAX_OUTPUT_TOKENS?: string
      PAYLOAD_MCP_ENABLED?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
