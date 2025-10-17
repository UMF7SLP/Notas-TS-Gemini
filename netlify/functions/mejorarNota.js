const { GoogleGenAI } = require('@google/genai');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido. Usa POST.' }),
        };
    }

    // 1. Obtener la nota del usuario
    const { notaOriginal } = JSON.parse(event.body);

    if (!notaOriginal) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Falta el texto de la nota.' }),
        };
    }

    // 2. Obtener la clave API de las variables de entorno de Netlify (seguro)
    const apiKey = process.env.GEMINI_API_KEY; 
    
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'La clave API no está configurada.' }),
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        // 3. Prompt para mejorar la redacción sin omitir información
        const prompt = `Eres un editor de textos profesional especializado en documentos de Trabajo Social. Tu tarea es mejorar la claridad, coherencia y formalidad de la siguiente nota, manteniendo siempre TODA LA INFORMACIÓN FÁCTICA Y LOS DETALLES ESENCIALES sin omitir nada. La mejora debe enfocarse únicamente en la redacción, el vocabulario y la estructura de las oraciones. 

        ---
        Nota de Trabajo Social a mejorar:
        "${notaOriginal}"
        ---
        
        Texto mejorado:`;
        
        // 4. Llamar al modelo de Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        });

        const notaMejorada = response.text.trim();

        // 5. Devolver el resultado
        return {
            statusCode: 200,
            body: JSON.stringify({ notaMejorada }),
        };

    } catch (error) {
        console.error("Error al llamar a Gemini:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Error interno al procesar la nota. Intenta de nuevo.' }),
        };
    }
};