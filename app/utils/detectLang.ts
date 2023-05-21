import { ModelOperations } from "@vscode/vscode-languagedetection";

const modulOperations = new ModelOperations();

export async function detectLanguage(data: string, maxLength = 100) {
    if (maxLength) {
        data = data.slice(0, 100) // max data to check
    }
    const result = await modulOperations.runModel(data);
    if (result.length === 0) {
        return ''
    }
    const top = result.reduce((acc, cur) => 
        acc.confidence > cur.confidence ? acc : cur
    )
    return top.languageId
}