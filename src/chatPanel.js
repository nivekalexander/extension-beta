const vscode = require('vscode');

class ChatPanel {
    static currentPanel = undefined;

    static createOrShow(context) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        
        if (ChatPanel.currentPanel) {
            ChatPanel.currentPanel.reveal(column);
            return;
        }

        const panel = vscode.window.createWebviewPanel(
            'gptHelperChat',
            'GPT Helper Chat',
            column || vscode.ViewColumn.One,
            { enableScripts: true }
        );

        ChatPanel.currentPanel = new ChatPanel(panel);
    }

    constructor(panel) {
        this.panel = panel;
        this.panel.onDidDispose(() => this.dispose(), null);

        this.panel.webview.html = this.getHtml();
    }

    dispose() {
        ChatPanel.currentPanel = undefined;
        this.panel.dispose();
    }

    getHtml() {
        return `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>GPT Helper Chat</title>
                <script>
                    function sendMessage() {
                        const input = document.getElementById('chatInput');
                        vscode.postMessage({ text: input.value });
                        input.value = '';
                    }
                </script>
            </head>
            <body>
                <h1>GPT Helper Chat</h1>
                <textarea id="chatBox" rows="10" cols="50" readonly></textarea>
                <input type="text" id="chatInput" placeholder="Escribe un mensaje...">
                <button onclick="sendMessage()">Enviar</button>
            </body>
            </html>
        `;
    }
}

module.exports = ChatPanel;
