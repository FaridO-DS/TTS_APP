import mongoose from 'mongoose';

const historySchema = new mongoose.Schema(
    {
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
    },
    text: {
        type: String,
        required: true,   
    },
    language: {
        type: String,
        required: true,
    },
    duration_seconds: {
        type: Number,
        required: false,
    },
    audioUrl: {
        type: String,
        required: false,
    },
},
    { timestamps: true } // Ajoute automatiquement les champs createdAt et updatedAt gérés proprement par Mongoose
    
);

const History = mongoose.model('History', historySchema);

export default History;