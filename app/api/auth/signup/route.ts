// pages/api/auth/signup.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import {
  getSignupSchema,
  SignupSchemaType,
} from '@/app/(auth)/forms/signup-schema';
import { UserStatus } from '@/app/models/user';

export async function POST(req: NextRequest) {
  try {
    const recaptchaToken = req.headers.get('x-recaptcha-token');

    if (!recaptchaToken) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification required' },
        { status: 400 },
      );
    }

    const isValidToken = await verifyRecaptchaToken(recaptchaToken);

    if (!isValidToken) {
      return NextResponse.json(
        { message: 'reCAPTCHA verification failed' },
        { status: 400 },
      );
    }

    // Parse the request body as JSON.
    const body = await req.json();

    // Validate the data using safeParse.
    const result = getSignupSchema().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        {
          message: 'Invalid input. Please check your data and try again.',
        },
        { status: 400 },
      );
    }

    const { email, password, name }: SignupSchemaType = result.data;

    // Check if a user with the given email already exists.
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already registered.' },
        { status: 409 },
      );
    }

    const defaultRole = await prisma.userRole.findFirst({
      where: { isDefault: true },
    });

    if (!defaultRole) {
      throw new Error('Default role not found. Unable to create a new user.');
    }

    // Hash the password.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with ACTIVE status (email verification disabled).
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        status: UserStatus.ACTIVE,
        roleId: defaultRole.id,
        emailVerifiedAt: new Date(), // Auto-verify email
      },
      include: { role: true },
    });

    return NextResponse.json(
      {
        message: 'Registration successful. You can now sign in.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roleName: user.role.name,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Registration failed. Please try again later.' },
      { status: 500 },
    );
  }
}
