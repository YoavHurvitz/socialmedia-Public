import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';

const useSocket = () => {
  const [socket, setSocket] = useState(null);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    let newSocket = null;

    if (token && user) {
      newSocket = io('http://localhost:3001', {
        auth: { token },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        console.log('Connected to socket server');
        if (user._id) {
          newSocket.emit('join_room', user._id);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from socket server');
      });

      setSocket(newSocket);
    } else {
      // If there's no token or user, close the existing socket
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }

    // Cleanup function
    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [token, user]);

  return socket;
};

export default useSocket;