import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    // MB20 Device IP (replace with your device IP)
    const deviceIP = process.env.MB20_DEVICE_IP || '192.168.1.101';
    const devicePort = process.env.MB20_DEVICE_PORT || '80';
    
    // Send enrollment command to MB20
    const enrollmentCommand = {
      cmd: 'enrolluser',
      userid: userId,
      name: `User${userId}`,
      privilege: 0,
      password: '',
      group: 1,
      timezone: 1,
      verify: 15 // Face + Fingerprint
    };

    // You would typically use TCP socket or HTTP request here
    // This is a placeholder for the actual device communication
    const response = await fetch(`http://${deviceIP}:${devicePort}/cgi-bin/enrollment.cgi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrollmentCommand)
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      throw new Error('Device communication failed');
    }
    
  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ success: false, error: 'Enrollment failed' }, { status: 500 });
  }
}
