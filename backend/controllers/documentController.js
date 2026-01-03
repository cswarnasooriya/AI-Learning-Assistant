import Document from "../models/document.js";
import Flashcard from "../models/flashCard.js";
import Quiz from "../models/quiz.js";
import {extractTextFromPDF} from '../utils/pdfParser.js';
import {chunkText} from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from "mongoose";

// @desc    Upload document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
    try {
        if(!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file",
                statuscode: 400
            });
        }

        const {title} = req.body;

        if(!title) {
            //Delete uploaded file if no title provided
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: "Please provide a document title",
                statuscode: 400
            });
        }
        //construct the URL for uploaded file
        const baseUrl = `http://localhost:${process.env.PORT || 8000}`;
        const fileUrl = `${baseUrl}/uploads/documents/${req.file.filename}`;

        //create the document
        const document = await Document.create({
            userId: req.user._id,
            title,
            fileName: req.file.originalname,
            filePath: fileUrl, //Store the URl instead of the local path
            flieSize: req.file.size,
            status: "Processing",
        });

        //Proces PDF in background 
        processPDF(document._id, req.file.path).catch((error) => {
            console.error("Error processing PDF:", error);
        });

        return res.status(201).json({
            success: true,
            data: document,
            message: "Document uploaded successfully",
            statuscode: 201,
            
        });

    } catch (error) {
        //clean up file on error
        if(req.file) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};


//helper fuction process PDF

const processPDF = async (documentId, filePath) => {
    try {
        const {text} = await extractTextFromPDF(filePath);
        //create chunk
        const chunks = chunkText(text,500,50);

        //update document
        await Document.findByIdAndUpdate(documentId, {
            extractedText: text,
            chunks: chunks,
            status: "ready",
        });

        console.log(`Document ${documentId} processed successfully`)
        
     } catch (error) {
        console.error(`Document ${documentId} processing failed`, error);
        await Document.findByIdAndUpdate(documentId, {
            status: "failed",
        });
    }
};



// @desc    Get documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
    try {
        const documents = await Document.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(req.user._id),
                }
            },
            {
                $lookup: {
                    from: "flashcards",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "flashcards",
                }
            },
            {
                $lookup: {
                    from: "quizzes",
                    localField: "_id",
                    foreignField: "documentId",
                    as: "quizzes",
                }
            },
            {
                $addFields: {
                    flashcardCount: {
                        $size: "$flashcardsSets",
                    },
                    quizCount: {
                        $size: "$quizzes",
                    },
                }
            },
            {
                $project: {
                    extractedText: 0,
                    chunks: 0,
                    flashcardSets: 0,
                    quizzes: 0,
                }
            },
            {
                $sort: {
                    uploadDate: -1,
                }
            },
        ]);


        return res.status(200).json({
            success: true,
            count: documents.length,
            data: documents,
            message: "Documents retrieved successfully",
            statuscode: 200,
        });
        
    } catch (error) {
        next(error);
    }
};


// @desc    Get document
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
    try {
        


    } catch (error) {
        next(error);
    }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
};

// @desc    Update document Title
// @route   PUT /api/documents/:id
// @access  Private

export const updateDocument = async (req, res, next) => {
    try {
        
    } catch (error) {
        next(error);
    }
};
