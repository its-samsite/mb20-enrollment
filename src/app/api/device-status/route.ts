import { NextResponse } from 'next/server';
import net from 'net';

export async function GET() {
  try {
    const deviceIP = process.env.MB20_DEVICE_IP || '192.168.1.101';
    const devicePort = parseInt(process.env.MB20_DEVICE_PORT || '4370');
    
    const isConnected = await checkDeviceConnection(deviceIP, devicePort);
    
    return NextResponse.json({ 
      connected: isConnected,
      ip: deviceIP,
      port: devicePort 
    });
    
  } catch {
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}

function checkDeviceConnection(ip: string, port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(port, ip);
  });
}
