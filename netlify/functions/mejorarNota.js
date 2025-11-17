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

        // 3. Prompt para mejorar la redacción Y sugerir un plan social
        const prompt = `Eres un editor de textos profesional especializado en documentos de Trabajo Social y un analista de casos. Tu tarea es doble:

        1.  **Mejorar la redacción:** Mejora la claridad, coherencia y formalidad de la siguiente nota de Trabajo Social, manteniendo siempre TODA LA INFORMACIÓN FÁCTICA Y LOS DETALLES ESENCIALES sin omitir nada.
        2.  **Sugerir Plan y Acciones:** Basado únicamente en el contenido de la nota mejorada, sugiere un Plan Social inicial y una lista de Acciones a seguir.

        El formato de tu respuesta debe ser:
        
        **Nota Mejorada:**
        [Aquí va el texto corregido]
        
        ---
        
        **Plan Social Sugerido y Acciones:**
        
        **Objetivo General del Plan:** [Ej: Facilitar la reincorporación laboral del usuario.]
        
        **Acciones Recomendadas:**
        * [Acción 1: Detalle de la acción.]
        * [Acción 2: Detalle de la acción.]
        * [Acción 3: Detalle de la acción.]

        ---
        
        Nota de Trabajo Social a mejorar:
        "${notaOriginal}"
        
        `;
        
        // El resto del código que llama a la API sigue igual...
        
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