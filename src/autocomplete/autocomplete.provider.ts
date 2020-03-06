import {
  ExtensionContext,
  CompletionItemProvider,
  TextDocument,
  Position,
  CompletionItem,
  Range,
  MarkdownString,
  CompletionItemKind,
  SnippetString
} from 'vscode';

// qualifiers description source: http://www.shaderific.com/glsl-qualifiers
// types description source: http://www.shaderific.com/glsl-types
// variable description source: http://www.shaderific.com/glsl-variables
import rawCompletionItems from './data/completionItems.json';

type completionDataTypes =
  | 'parameter'
  | 'empty'
  | 'vertex-output'
  | 'fragment-output'
  | 'fragment-empty'
  | 'vertex-empty'
  | 'vertex-built-in'
  | 'fragment-built-in';

type GLSLCompletionData = { [key in completionDataTypes]: CompletionItem[] };

export class GLSLCompletions implements CompletionItemProvider {
  context: ExtensionContext;

  completionData: GLSLCompletionData = {
    empty: [],
    parameter: [],
    'fragment-empty': [],
    'fragment-output': [],
    'vertex-empty': [],
    'vertex-output': [],
    'fragment-built-in': [],
    'vertex-built-in': []
  };
  constructor(context: ExtensionContext) {
    this.context = context;
    this.getCompletions();
  }
  async provideCompletionItems(document: TextDocument, position: Position) {
    const start = new Position(position.line, 0);
    const range = new Range(start, position);
    const currentWord = document.getText(range).trim();

    const isVertexShader = /^\.?vert$|^\.?vs$/.test(document.languageId);

    let state: completionDataTypes = 'empty';

    // if (/^[ \t]*$/.test(currentWord)) {
    //   state = 'empty';
    // }

    const completions: CompletionItem[] = [];

    switch (state) {
      case 'empty':
        completions.push(...this.completionData.empty, ...this.completionData['fragment-built-in']);
        break;
    }

    return completions;
  }

  private getCompletions() {
    for (const key in rawCompletionItems) {
      // @ts-ignore
      if (rawCompletionItems.hasOwnProperty(key) && typeof rawCompletionItems[key] === 'object') {
        // @ts-ignore
        const rawItem = rawCompletionItems[key];
        const item = new CompletionItem(key);
        item.kind = (CompletionItemKind[rawItem.kind] as unknown) as any;
        item.insertText = new SnippetString(rawItem.insertText || `${key} `);
        item.documentation = new MarkdownString(rawItem.desc);
        this.checkStateAndPushItem(rawItem.if, item);
      }
    }
  }

  private checkStateAndPushItem(
    types: completionDataTypes | completionDataTypes[],
    item: CompletionItem
  ) {
    if (typeof types === 'string') {
      if (this.completionData.hasOwnProperty(types)) {
        this.completionData[types].push(item);
      }
    } else {
      for (const type of types) {
        if (this.completionData.hasOwnProperty(type)) {
          this.completionData[type].push(item);
        }
      }
    }
  }
}
