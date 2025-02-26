const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function analyzeFile(filePath) {
    try {
        // Leer el contenido del archivo
        const document = await vscode.workspace.openTextDocument(filePath);
        const fileContent = document.getText();

        vscode.window.showInformationMessage(`Analizando: ${filePath}`);

        // Llamar a OpenAI para analizar el código
        const suggestions = await analyzeCodeWithAI(fileContent);

        // Mostrar sugerencias en el chat o notificación
        vscode.window.showInformationMessage(`Sugerencias para ${path.basename(filePath)}: ${suggestions}`);

        // Preguntar al usuario si desea aplicar las sugerencias
        const applyFix = await vscode.window.showQuickPick(["Sí", "No"], {
            placeHolder: "¿Quieres aplicar las mejoras sugeridas?"
        });

        if (applyFix === "Sí") {
            applyChanges(filePath, suggestions);
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error al analizar archivo: ${error.message}`);
    }
}

async function analyzeFolder(folderPath) {
    try {
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        if (files.length === 0) {
            vscode.window.showWarningMessage("No se encontraron archivos JavaScript en la carpeta.");
            return;
        }

        for (const file of files) {
            await analyzeFile(path.join(folderPath, file));
        }
    } catch (error) {
        vscode.window.showErrorMessage(`Error al analizar carpeta: ${error.message}`);
    }
}

async function analyzeCodeWithAI(code) {
    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4",
                messages: [{ role: "user", content: `Analiza el siguiente código y sugiere mejoras:\n\n${code}` }],
                max_tokens: 500
            },
            {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
            }
        );

        return response.data.choices[0].message.content;
    } catch (error) {
        vscode.window.showErrorMessage(`Error en OpenAI: ${error.message}`);
        return null;
    }
}

function applyChanges(filePath, newContent) {
    try {
        fs.writeFileSync(filePath, newContent);
        vscode.window.showInformationMessage(`Modificaciones aplicadas en ${path.basename(filePath)}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error al aplicar cambios: ${error.message}`);
    }
}

module.exports = { analyzeFile, analyzeFolder };
