import fs from 'fs/promises';
import {PDFParse} from 'pdf-parse';

/**
 * Extracts text from a PDF file.
 * @param {string} filePath - The path to the PDF file.
 * @returns {Promise<{text: string, numPages: number}>} - The extracted text or null if an error occurs.
 */

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        
        //pdf-parse expects a Uint8Array, not a buffer
        const parser = await PDFParse(new Uint8Array(dataBuffer));
        const data = await parser.getText();

        return {
            text: data.text, 
            numPages: data.numpages,
            info: data.info,
           
        };

    } catch (error) {
        console.error('PDF Parsing Error :', error);
        throw new Error('Failed to extract text from PDF!');
    }
};