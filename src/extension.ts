import * as vscode from 'vscode';

const textEditorMap = new Map<vscode.TextEditor, number>();

export function activate(context: vscode.ExtensionContext) {
	
	let disposable = vscode.commands.registerCommand('ignore-the-rest.run', () => {
		
		const te = vscode.window.activeTextEditor;
		if (!!te) {
			let linesLastCommented = textEditorMap.get(te);			
			if (linesLastCommented === undefined) {
				linesLastCommented = -1;
				textEditorMap.set(te, linesLastCommented);
			}

			if (linesLastCommented >= 0) {
				unIgnoreTheRest(vscode.window.activeTextEditor!, linesLastCommented);
			} else {
				ignoreTheRest(vscode.window.activeTextEditor!);
			}
		}
	});

	context.subscriptions.push(disposable);
}

function ignoreTheRest(te: vscode.TextEditor) {
	const selectionsToRestore = te.selections;
	let selectionLineClosestToEnd = Math.max(te.selection.start.line, te.selection.end.line);

	te.selections.forEach(s => {
		if (Math.max(s.start.line, s.end.line) > selectionLineClosestToEnd) {
			selectionLineClosestToEnd = Math.max(s.start.line, s.end.line);
		}
	});

	const start = new vscode.Position(selectionLineClosestToEnd + 1, 0);
	const end = new vscode.Position(te.document.lineCount, 0);
	const selection = new vscode.Selection(start, end);
	textEditorMap.set(te, end.line - start.line);
	te.selections = [selection];
	vscode.commands.executeCommand('editor.action.commentLine');
	te.selections = selectionsToRestore;
}

function unIgnoreTheRest(te: vscode.TextEditor, linesLastCommented: number) {
	const selectionsToRestore = te.selections;
	const start = new vscode.Position(te.document.lineCount - linesLastCommented, 0);
	const end = new vscode.Position(te.document.lineCount, 0);
	const selection = new vscode.Selection(start, end);
	textEditorMap.set(te, -1);
	te.selections = [selection];
	vscode.commands.executeCommand('editor.action.commentLine');
	te.selections = selectionsToRestore;
}
