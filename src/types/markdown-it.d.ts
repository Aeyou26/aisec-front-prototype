declare module 'markdown-it' {
  interface MarkdownIt {
    render(content: string): string
    renderer: any
    utils: {
      escapeHtml(str: string): string
    }
  }

  interface MarkdownItOptions {
    html?: boolean
    linkify?: boolean
    typographer?: boolean
    highlight?: (str: string, lang: string) => string
  }

  interface MarkdownItConstructor {
    new (options?: MarkdownItOptions): MarkdownIt
  }

  const MarkdownIt: MarkdownItConstructor
  export default MarkdownIt
}
