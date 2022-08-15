import * as vscode from 'vscode';

interface LinesLast {
	commented: number,
	uncommented: number,
}

const textEditorMap = new Map<vscode.TextEditor, LinesLast>();

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('ignore-the-rest.run', () => {

		const te = vscode.window.activeTextEditor;
		if (!!te) {
			const config = vscode.workspace.getConfiguration("ignore-the-rest");
			const uclbitr = config.get("uncommentCurrentLinesBeforeIgnoringTheRest", false);

			let linesLastCommented = textEditorMap.get(te);
			if (linesLastCommented === undefined) {
				ignoreTheRest(vscode.window.activeTextEditor!, uclbitr);
			} else {
				unIgnoreTheRest(vscode.window.activeTextEditor!, uclbitr, linesLastCommented);
			}
		}
	});

	context.subscriptions.push(disposable);
}

function ignoreTheRest(te: vscode.TextEditor, uclbitr: boolean) {
	const selectionsToRestore = te.selections;
	let commented = 0;
	let uncommented = 0;
	let selectionLineClosestToEnd = Math.max(te.selection.start.line, te.selection.end.line);

	te.selections.forEach(s => {
		if (Math.max(s.start.line, s.end.line) > selectionLineClosestToEnd) {
			selectionLineClosestToEnd = Math.max(s.start.line, s.end.line);
		}
	});

	// uncomment the current selection before ignoring the rest
	if (uclbitr) {
		// find the number of currently selected lines that are contiguous with the selectionLineClosestToEnd
		const allLinesSelected: number[] = [];		
		selectionsToRestore.forEach(s => {
			const strt = Math.min(s.start.line, s.end.line);
			const eend = Math.max(s.start.line, s.end.line);
		  for (let index = strt; index <= eend; index++) {
			  allLinesSelected.push(index);
		  }	
		});
		let lastLineContiguous = selectionLineClosestToEnd;		
		allLinesSelected.sort((a, b) => b - a);
		allLinesSelected.forEach(l => {
			if (l === lastLineContiguous || l === lastLineContiguous - 1) {
			  lastLineContiguous--;
			}
		});
		uncommented = selectionLineClosestToEnd - lastLineContiguous;
		vscode.commands.executeCommand('editor.action.commentLine');
	}


	const start = new vscode.Position(selectionLineClosestToEnd + 1, 0);
	const end = new vscode.Position(te.document.lineCount, 0);
	commented = end.line - start.line;
	const lastLines = { commented, uncommented };
	textEditorMap.set(te, lastLines);
	const selection = new vscode.Selection(end, start);
	te.selections = [selection];
	vscode.commands.executeCommand('editor.action.commentLine');
	te.selections = selectionsToRestore;
}

function unIgnoreTheRest(te: vscode.TextEditor, uclbitr: boolean, linesLast: LinesLast) {
	const selectionsToRestore = te.selections;
	let start = new vscode.Position(te.document.lineCount - linesLast.commented, 0);
	let end = new vscode.Position(te.document.lineCount - 1, 1);
	const selection = new vscode.Selection(end, start);
	te.selections = [selection];
	vscode.commands.executeCommand('editor.action.commentLine');

	// re-comment the original commented lines
	if (uclbitr) {	
		start = new vscode.Position(te.document.lineCount - linesLast.commented - linesLast.uncommented, 0);
	  end = new vscode.Position(te.document.lineCount - linesLast.commented - 1, 1);
		const selection = new vscode.Selection(end, start);
		te.selections = [selection];
	  vscode.commands.executeCommand('editor.action.commentLine');
	}

	textEditorMap.delete(te);
	te.selections = selectionsToRestore;

}
