/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE: string
  readonly VITE_WS_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.jsx' {
  const content: any;
  export default content;
  export const ThemeProvider: any;
  export const LiveProvider: any;
}

declare module '*.js' {
    const content: any;
    export default content;
}
