'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function findAll(re: RegExp, haystack: string) {
	const res: RegExpExecArray[] = [];
	while (1) {
		const match = re.exec(haystack);
		if (!match) {
			break;
		}
		res.push(match);
	}
	return res;
}

function parseDocFiles(fnames: string[]) {
	const keywords = [];
	fnames.forEach ( (fn) => {
		const cont = fs.readFileSync(fn, 'utf8');
		const re =  /<kw name="(.*?)">/g;
		const matches = findAll(re, cont).map(el => el[1]);
		keywords.push(...matches);

	})
	return keywords;
}

function findDocFiles(dirs: string[], fnames: string[]) {
	const found = [];
	dirs.forEach( (d) => {
		const tries = fnames.map( (fn) => path.join(d, fn) + ".xml");
		const exists = tries.filter((fn) => fs.existsSync(fn));
		found.push(...exists);
	});
	return found;
}

function getPythonPath() {
	const env: string = process.env.PYTHONPATH;
	const parts = env.split(path.delimiter);
	return parts;
}

function findLibRefs(doc: string) {
	const hits = findAll(/Library\s+?(\w+)/g, doc);
	return hits.map(h => h[1]);
}

export function activate(context: vscode.ExtensionContext) {
	let keywords = null;

	let disposable = vscode.commands.registerCommand('extension.searchRobotKeyword', () => {
		if (!keywords) {
			const pp = getPythonPath();
			const libRefs = findLibRefs(vscode.window.activeTextEditor.document.getText());

			const docFiles = findDocFiles(pp, libRefs);
			const matches = parseDocFiles(docFiles);
			keywords = matches;
		}

		vscode.window.showQuickPick(keywords).then( (selected) => {
			const editor = vscode.window.activeTextEditor;

			editor.edit((editBuilder) => {
				const pos = new vscode.Position (editor.selection.active.line, editor.selection.active.character);
				editBuilder.insert(pos, selected);
			});
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}