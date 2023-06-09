// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { LocalStorageService } from './helpers/localStorageService';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (// console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated

    // vscode.window.showInformationMessage('Congratulations, your extension "vue-3-vscode-webview" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let kindDisposable = vscode.commands.registerCommand('vue-3-vscode-webview.createFlow', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        // vscode.window.showInformationMessage('Opening vue generated webview inside extension!');
        const panel = prepareWebView(context);

        const storageService = LocalStorageService(context.workspaceState);
        storageService.setValue('backendResponse', 'Hi, I\'m RefactorAI. How can I help you today?');
        storageService.setValue('codeInputValue', 'Type here...');
        panel.webview.onDidReceiveMessage(
            async ({ message }) => {
                message = JSON.parse(message);
                vscode.window.showInformationMessage(message);
                if (message.backendResponse) {
                    // console.log('SAVING TO MEMENTO', message);
                    // save to memento
                    storageService.setValue('backendResponse', message.backendResponse);
                    storageService.setValue('codeInputValue', message.codeInputValue);
                } else {
                    // console.log('GETTING FROM MEMENTO', message);
                    // message must be to get all data in storage
                    let backendResponse: string | null = storageService.getValue('backendResponse');
                    let codeInputValue: string | null = storageService.getValue('codeInputValue');
                    // @ts-ignore
                    // vscode.window.showInformationMessage({ codeInputValue, backendResponse });
                    panel.webview.postMessage({ codeInputValue, backendResponse });
                }
            },
            undefined,
            context.subscriptions
        );
    });
    context.subscriptions.push(kindDisposable);
}

export function prepareWebView(context: vscode.ExtensionContext) {
    const panel = vscode.window.createWebviewPanel('vueWebview', 'RefactorAI', vscode.ViewColumn.One, {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'vue-dist', 'assets'))],
    });

    const dependencyNameList: string[] = ['index.css', 'index.js', 'vendor.js', 'logo.png'];
    const dependencyList: vscode.Uri[] = dependencyNameList.map((item) =>
        panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'vue-dist', 'assets', item)))
    );
    const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
    <script>
          const vscode = acquireVsCodeApi();
    </script>
    <script type="module" crossorigin src="${dependencyList[1]}"></script>
    <link rel="modulepreload" href="${dependencyList[2]}">
    <link rel="stylesheet" href="${dependencyList[0]}">
  </head>
  <body>
    <div id="app"></div>
  </body>
  </html>
  `;
    panel.webview.html = html;
    return panel;
}
// this method is called when your extension is deactivated
export function deactivate() {}
