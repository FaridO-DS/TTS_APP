import mongoose from 'mongoose';

const gethistorySchema = new mongoose.Schema(
    {
    userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
    },
    action: {
        type: String,
        required: true,
        unique: true
    },
    details: {
        type: String,
        required: true,
    },
    },
{
    timestamps: true // createdAt and updatedAt fields will be automatically added
});

const GetHistory = mongoose.model('GetHistory', gethistorySchema);

export default GetHistory;