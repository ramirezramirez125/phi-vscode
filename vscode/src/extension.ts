import * as vscode from "vscode";
import { PhiEditorProvider } from "./phiEditor";

export function activate(context: vscode.ExtensionContext) {
  console.log("Activate Phi");

  context.subscriptions.push(
    new PhiEditorProvider(context.extensionPath).register()
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}