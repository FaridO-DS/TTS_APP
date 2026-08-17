import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profilePicture: {
        type: String,
        default: ''
    }
    },
{
    timestamps: true // createdAt and updatedAt fields will be automatically added
});

const User = mongoose.model('User', userSchema);

export default User;