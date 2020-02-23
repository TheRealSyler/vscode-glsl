import {
  ExtensionContext,
  CompletionItemProvider,
  TextDocument,
  Position,
  CompletionItem,
  Range,
  MarkdownString,
  CompletionItemKind
} from 'vscode';

// qualifiers description source: http://www.shaderific.com/glsl-qualifiers
import qualifiersRaw from './data/qualifiers.json';

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
    for (const key in qualifiersRaw) {
      // @ts-ignore
      if (qualifiersRaw.hasOwnProperty(key) && typeof qualifiersRaw[key] === 'object') {
        // @ts-ignore
        const qualifier = qualifiersRaw[key];
        const item = new CompletionItem(key);
        item.kind = CompletionItemKind.Keyword;
        item.documentation = new MarkdownString(qualifier.desc);
        this.checkStateAndPushItem(qualifier.if, item);
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
