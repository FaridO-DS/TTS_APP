import jwt from 'jsonwebtoken';
import { ENV } from './env.js';

export const generateToken = (userID, res) => {
    const { JWT_SECRET } = ENV;
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
    }

    const token = jwt.sign({ id: userID }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, 
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'development' ? false : true,});
    return token;
};