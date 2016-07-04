'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import fs = require('fs');
import path = require('path');
const sax = require('sax');

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

class RfModel {
	kws: {[kw: string]: string[]} = {};
	parse(cont: string) {
		const parser = sax.parser(false);
		let current_kw = '';
		let current_args = [];
		let current_text = '';
		parser.onopentag = (node) => {
			if (node.name == 'KW') {
				current_kw = node.attributes.NAME;
				current_args = [];
			}
			if (node.name == 'ARG') {
				current_text = '';
			}
		}
		parser.ontext = (text) => current_text = text;
		parser.onclosetag = (tag => {
			if (tag == 'ARG') {
				current_args.push(current_text);
			}
			if (tag == "KW") {
				this.kws[current_kw] = current_args
			}
		});
		parser.write(cont);
	}

	keywordNames() {
		return Object.keys(this.kws);
	}

}
function parseDocFiles(fnames: string[]) {
	const keywords = [];
	const model = new RfModel();
	fnames.forEach ( (fn) => {
		const cont = fs.readFileSync(fn, 'utf8');
		const re =  /<kw name="(.*?)">/g;
		const matches = findAll(re, cont).map(el => el[1]);
		model.parse(cont);
		keywords.push(...matches);

	})
	return model;
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
	let model: RfModel = null;
	//let keywords = null;


	const disposable = vscode.commands.registerCommand('extension.searchRobotKeyword', () => {
		if (!model) {
			const pp = getPythonPath();
			const libRefs = findLibRefs(vscode.window.activeTextEditor.document.getText());

			const docFiles = findDocFiles(pp, libRefs);
			model = parseDocFiles(docFiles);
		}

		vscode.window.showQuickPick(model.keywordNames()).then( (selected) => {
			const editor = vscode.window.activeTextEditor;

			editor.edit((editBuilder) => {
				const pos = new vscode.Position (editor.selection.active.line, editor.selection.active.character);
				const args = model.kws[selected].map(arg => arg.indexOf('=') == -1 ? arg + '=' : arg )

				const output = selected + '    ' + args.join('    ');

				editBuilder.insert(pos, output);
			});
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}