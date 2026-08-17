import mongoose from 'mongoose';

const createhistorySchema = new mongoose.Schema(
    {
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
    },
    prompt: {
        type: String,
        required: true,   
    },
    langage: {
        type: String,
        required: true,
    },
    voice: {
        type: String,
        required: true,
    },
    duration_seconds: {
        type: Integer,
        required: true,
    },
    usage_credits: {
        type: Int,
        required: true,
    },
    result_url: {
        type: String,
        required: true,
    },
    },
{
    timestamps: true // createdAt and updatedAt fields will be automatically added
});

const createtHistory = mongoose.model('createHistory', createhistorySchema);

export default createHistory;