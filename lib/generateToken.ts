import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken'

interface JwtPayload {
    userId: string;
    role: 'member' | 'admin';
}

const generateToken = (userId: string, role: 'member' | 'admin' = 'member'): void => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    const payload: JwtPayload = { userId, role };

    // Generate the JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15d',
    });

    // Get the cookies object from Next.js headers
    const cookieStore = cookies();

    let sameSitePolicy: 'lax' | 'none' = 'lax';
    if (process.env.NODE_ENV === 'production') {
        sameSitePolicy = 'none';
    }

    // Set the JWT as a cookie
    cookieStore.set({
        name: 'jwt',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: sameSitePolicy,
        maxAge: 15 * 24 * 60 * 60 * 1000,
    });
};

export { generateToken };