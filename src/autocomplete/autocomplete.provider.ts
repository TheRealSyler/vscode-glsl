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
import rawCompletionItems from './data/completionItems.json';

type States = 'empty' | 'parameter';

type GLSLCompletionData = { [key in States]: CompletionItem[] };

export class GLSLCompletions implements CompletionItemProvider {
  context: ExtensionContext;

  completionData: GLSLCompletionData = {
    empty: [],
    parameter: []
  };
  constructor(context: ExtensionContext) {
    this.context = context;
    this.getCompletions();
  }
  async provideCompletionItems(document: TextDocument, position: Position) {
    const start = new Position(position.line, 0);
    const range = new Range(start, position);
    const currentWord = document.getText(range).trim();

    let state: States = 'empty';

    // if (/^[ \t]*$/.test(currentWord)) {
    //   state = 'empty';
    // }

    const completions: CompletionItem[] = [];

    switch (state) {
      case 'empty':
        completions.push(...this.completionData.empty);
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

  private checkStateAndPushItem(states: States | States[], item: CompletionItem) {
    if (typeof states === 'string') {
      this.pushItemToCompletionData(states, item);
    } else {
      for (const state of states) {
        this.pushItemToCompletionData(state, item);
      }
    }
  }

  private pushItemToCompletionData(state: States, item: CompletionItem) {
    switch (state) {
      case 'empty':
        this.completionData.empty.push(item);
        break;
      case 'parameter':
        this.completionData.parameter.push(item);
        break;
    }
  }
}
