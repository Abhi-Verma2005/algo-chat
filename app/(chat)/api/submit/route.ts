import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import {db} from "@/db/queries"
import { codeSubmissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface SubmitRequest {
  slug: string;
  code: string;
  language: string;
  timestamp: string;
  problemTitle: string;
}

interface SubmitResponse {
  success: boolean;
  message?: string;
  submissionId?: string;
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function POST(request: NextRequest): Promise<NextResponse<SubmitResponse>> {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'Missing or invalid authorization header'
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({
        success: false,
        message: 'Server configuration error'
      }, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token'
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Extract user ID from token
    const externalUserId = decoded.userId;
    if (!externalUserId) {
      return NextResponse.json({
        success: false,
        message: 'Invalid token payload'
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Parse request body
    const { slug, code, language, timestamp, problemTitle }: SubmitRequest = await request.json();

    // Validate required fields
    if (!slug || !code || !language) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: slug, code, and language are required'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Validate code is not empty
    if (!code.trim()) {
      return NextResponse.json({
        success: false,
        message: 'Code cannot be empty'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Check for existing submission
    const existingSubmission = await db
      .select()
      .from(codeSubmissions)
      .where(
        and(
          eq(codeSubmissions.externalUserId, externalUserId),
          eq(codeSubmissions.questionSlug, slug)
        )
      )
      .limit(1);

    let submission;
    let isUpdate = false;

    if (existingSubmission.length > 0) {
      // Update existing submission
      const [updatedSubmission] = await db
        .update(codeSubmissions)
        .set({
          code: code.trim(),
          language: language.toLowerCase(),
          problemTitle: problemTitle || null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(codeSubmissions.externalUserId, externalUserId),
            eq(codeSubmissions.questionSlug, slug)
          )
        )
        .returning({ id: codeSubmissions.id });

      submission = updatedSubmission;
      isUpdate = true;
      console.log(`Code submission updated for user ${externalUserId}, problem ${slug}`);
    } else {
      // Create new submission
      const [newSubmission] = await db
        .insert(codeSubmissions)
        .values({
          externalUserId,
          questionSlug: slug,
          code: code.trim(),
          language: language.toLowerCase(),
          problemTitle: problemTitle || null,
          submissionStatus: 'accepted',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning({ id: codeSubmissions.id });

      submission = newSubmission;
      console.log(`Code submission created for user ${externalUserId}, problem ${slug}`);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Code submission updated successfully' : 'Code submission saved successfully',
      submissionId: submission.id,
      isUpdate
    }, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Submit endpoint error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key') || error.message.includes('UNIQUE constraint')) {
        return NextResponse.json({
          success: false,
          message: 'Submission already exists'
        }, { 
          status: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          }
        });
      }
    }
    
    // Generic error response
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}