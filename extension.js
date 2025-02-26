const vscode = require('vscode');
const axios = require('axios');
const ChatPanel = require('./src/chatPanel');
const fileAnalyzer = require('./src/fileAnalyzer');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function activate(context) {
    console.log('La extensión "GPT Helper" está activa.');

    // 📌 Comando para abrir el chat
    let chatCommand = vscode.commands.registerCommand('gptHelper.openChat', function () {
        ChatPanel.createOrShow(context);
    });

    // 📌 Comando para analizar un archivo
    let analyzeFileCommand = vscode.commands.registerCommand('gptHelper.analyzeFile', async function () {
        const fileUri = await vscode.window.showOpenDialog({ canSelectMany: false });
        if (!fileUri) return;
        
        const filePath = fileUri[0].fsPath;
        await fileAnalyzer.analyzeFile(filePath);
    });

    // 📌 Comando para analizar una carpeta completa
    let analyzeFolderCommand = vscode.commands.registerCommand('gptHelper.analyzeFolder', async function () {
        const folderUri = await vscode.window.showOpenDialog({ canSelectFolders: true });
        if (!folderUri) return;
        
        const folderPath = folderUri[0].fsPath;
        await fileAnalyzer.analyzeFolder(folderPath);
    });

    // 📌 Registrar comandos en la extensión
    context.subscriptions.push(chatCommand, analyzeFileCommand, analyzeFolderCommand);
}

function deactivate() {}

module.exports = { activate, deactivate };
