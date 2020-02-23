import { GLSLCompletions } from './autocomplete/autocomplete.provider';
import { ExtensionContext, languages } from 'vscode';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    languages.registerCompletionItemProvider(
      [
        { language: 'glsl', scheme: 'file' },
        { language: 'glsl', scheme: 'untitled' }
      ],
      new GLSLCompletions(context),
      '\\.'
    )
  );
}

export function deactivate() {}
