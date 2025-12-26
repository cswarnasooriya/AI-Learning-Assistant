import mongoose from "mongoose";

const chatHistoryschema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
        required: true
    },

    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content : {
            type: String,
            required: true
        },
        timestamp : {
            type: Date,
            default: Date.now
        },
        relevantchunks: {
            type: [Number],
            default: []

        }
}]
    
}, {
    timestamps: true
});

//Index for faster queries
chatHistoryschema.index({userId: 1, documentId: 1});

const chatHistory = mongoose.model("ChatHistory", chatHistoryschema);

export default chatHistory;
