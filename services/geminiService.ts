import { GoogleGenAI, Type, GenerateContentResponse, Part } from "@google/genai";
import type { FileData, GeneratedContent } from '../types';

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        notes: {
            type: Type.OBJECT,
            properties: {
                summary: {
                    type: Type.STRING,
                    description: "A concise, well-structured summary of the content in markdown format. Should be easy to read and capture the key points.",
                },
            },
            required: ["summary"],
        },
        questions: {
            type: Type.ARRAY,
            description: "A list of 3-5 multiple-choice questions to test comprehension of the content.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question text." },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 potential answers (strings).",
                        items: { type: Type.STRING },
                    },
                    answer: { type: Type.STRING, description: "The correct answer from the options list." },
                },
                required: ["question", "options", "answer"],
            },
        },
        flashcards: {
            type: Type.ARRAY,
            description: "A list of 3-5 flashcards based on key concepts from the content.",
            items: {
                type: Type.OBJECT,
                properties: {
                    front: { type: Type.STRING, description: "The front of the flashcard (a question or term)." },
                    back: { type: Type.STRING, description: "The back of the flashcard (the answer or definition)." },
                },
                required: ["front", "back"],
            },
        },
    },
    required: ["notes", "questions", "flashcards"],
};

const getPrompt = (fileType: FileData['type']): string => {
    let contentDescription = '';
    switch(fileType) {
        case 'text':
            contentDescription = 'the provided text';
            break;
        case 'image':
            contentDescription = 'the content of the provided image (perform OCR if necessary)';
            break;
        case 'audio':
            contentDescription = 'the content of the provided audio file';
            break;
        case 'pdf':
            contentDescription = 'the content of the provided PDF document';
            break;
        case 'ppt':
            contentDescription = 'the content of the provided presentation (PPT) file';
            break;
    }

    return `Analyze ${contentDescription}. Your task is to generate a structured JSON output containing three distinct sections:
1.  **Notes**: A concise summary of the key information.
2.  **Questions**: 3-5 multiple-choice questions to test understanding. Each question must have exactly 4 options.
3.  **Flashcards**: 3-5 flashcards with a 'front' (term/question) and a 'back' (definition/answer).

Please adhere strictly to the provided JSON schema.`;
};

export const generateContentFromData = async (fileData: FileData): Promise<GeneratedContent | null> => {
    // Safely check for the environment variable. This is the standard for Vite-based projects
    // to expose variables to the browser, which is what Vercel often uses.
    //const apiKey = (typeof process !== 'undefined' && process.env) ? process.env.VITE_API_KEY : undefined;

    const apiKey = import.meta.env.VITE_API_KEY;
    console.log("Using API Key:", apiKey );

    if (!apiKey) {
        throw new Error("API_KEY is not configured for deployment. FIX: Go to your Vercel project settings > Environment Variables, add a variable named 'VITE_API_KEY', and then redeploy your project.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const promptText = getPrompt(fileData.type);
    const config = {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
    };

    try {
        let parts: Part[];

        if (fileData.type === 'text') {
            parts = [
                { text: fileData.content }, // User's text content
                { text: promptText },      // Instructions
            ];
        } else if (fileData.mimeType) {
            parts = [
                {
                    inlineData: {
                        data: fileData.content,
                        mimeType: fileData.mimeType,
                    },
                },
                { text: promptText },
            ];
        } else {
            throw new Error("Invalid file data: missing MIME type for a file.");
        }

        const response = await ai.models.generateContent({
            model,
            contents: { parts },
            config,
        });

        const jsonText = response.text?.trim();
        if (!jsonText) {
            console.error("API returned empty text response.");
            return null;
        }

        const parsedJson = JSON.parse(jsonText);
        return parsedJson as GeneratedContent;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('API key not valid')) {
             throw new Error("Failed to process content: The provided API Key is not valid. Please check it in your Vercel environment variables.");
        }
        throw new Error("Failed to process content with the Gemini API. Please check your network and Vercel environment configuration.");
    }
};
