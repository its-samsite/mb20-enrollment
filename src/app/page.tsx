'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  name: string;
  email: string;
  enrolled: boolean;
  lastAttendance?: string;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '' });
  const [deviceStatus, setDeviceStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [attendanceLogs, setAttendanceLogs] = useState<any[]>([]);

  useEffect(() => {
    // Initialize socket connection for real-time data
    const socketConnection = io();
    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      console.log('Connected to server');
    });

    socketConnection.on('attendance_data', (data) => {
      setAttendanceLogs(prev => [...prev, data]);
      // Update user's last attendance
      setUsers(prev => prev.map(user => 
        user.id === data.userId 
          ? { ...user, lastAttendance: new Date().toLocaleString() }
          : user
      ));
    });

    socketConnection.on('device_status', (status) => {
      setDeviceStatus(status);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  const enrollUser = async (userId: string) => {
    try {
      const response = await axios.post('/api/enroll', { userId });
      if (response.data.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, enrolled: true } : user
        ));
        alert('User enrollment initiated. Please place finger/face on device.');
      }
    } catch (error) {
      alert('Enrollment failed. Check device connection.');
    }
  };

  const addUser = async () => {
    if (!newUser.name || !newUser.email) return;
    
    const user: User = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      enrolled: false
    };
    
    setUsers(prev => [...prev, user]);
    setNewUser({ name: '', email: '' });
  };

  const testDevice = async () => {
    try {
      const response = await axios.get('/api/device-status');
      setDeviceStatus(response.data.connected ? 'connected' : 'disconnected');
    } catch (error) {
      setDeviceStatus('disconnected');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">eSSL MB20 Enrollment System</h1>
        
        {/* Device Status */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Device Status</h2>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm ${
                deviceStatus === 'connected' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {deviceStatus === 'connected' ? 'Connected' : 'Disconnected'}
              </span>
              <button 
                onClick={testDevice}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Connection
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add User Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Add New User</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newUser.email}
                onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={addUser}
                className="w-full bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
              >
                Add User
              </button>
            </div>
          </div>

          {/* Users List */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Users ({users.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map(user => (
                <div key={user.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.lastAttendance && (
                        <p className="text-xs text-blue-600">Last: {user.lastAttendance}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.enrolled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.enrolled ? 'Enrolled' : 'Pending'}
                      </span>
                      {!user.enrolled && (
                        <button
                          onClick={() => enrollUser(user.id)}
                          className="bg-blue-500 text-white px-3 py-1 text-xs rounded hover:bg-blue-600"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Attendance */}
        <div className="bg-white p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-4">Live Attendance Feed</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {attendanceLogs.slice(-10).reverse().map((log, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                <p className="font-medium">User: {log.userId}</p>
                <p className="text-sm text-gray-600">Time: {new Date(log.timestamp).toLocaleString()}</p>
                <p className="text-sm text-gray-600">Status: {log.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
