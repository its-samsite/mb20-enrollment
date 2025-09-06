import { NextRequest, NextResponse } from 'next/server';

// This endpoint will receive push data from MB20
export async function POST(request: NextRequest) {
  try {
    const attendanceData = await request.json();
    
    // Process attendance data
    console.log('Attendance received:', attendanceData);
    
    // Here you would typically save to database
    // For now, we'll just acknowledge receipt
    
    return NextResponse.json({ 
      success: true, 
      message: 'Attendance recorded' 
    });
    
  } catch (error) {
    console.error('Attendance processing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process attendance' 
    }, { status: 500 });
  }
}
