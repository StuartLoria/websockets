import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import Snackbar from '@mui/material/Snackbar';

function ProcessManager() {
  const [progress, setProgress] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const socketRef = useRef<Socket | null>(null); // It persists across renders

  //////////////////////////////  EVENT HANDLERS  ////////////////////////////////////

  // Socket events
  const handleSocketConnect = useCallback(() => {
    console.log('Connected to WebSocket');
    showSnackMessage('Connected to WebSocket');
  }, []);

  const handleSocketError = useCallback((error: Error) => {
    console.error('Connection Error:', error);
    showSnackMessage(`Connection Error:${JSON.stringify(error)}`);
  }, []);

  const handleSocketDisconnect = useCallback((reason: string) => {
    console.log('Disconnected:', reason);
    showSnackMessage(`Disconnected:${JSON.stringify(reason)}`);
  }, []);

  const handleReconnectAttempt = useCallback((attempt: number) => {
    console.log('Reconnection attempt:', attempt);
  }, []);

  const handleReconnectError = useCallback((error: Error) => {
    console.log('Reconnection error:', error);
  }, []);

  const handleReconnectFailed = useCallback(() => {
    console.log('All reconnection attempts failed');

    if (socketRef.current) {
      if (socketRef.current.connected) {
        console.log(
          'Disconnecting the socket after multiple attempts'
        );
        socketRef.current.disconnect();
      }

      console.log('Destroying the socket after multiple attempts');
      socketRef.current.close(); // Destroy the socket
      socketRef.current = null; // Clean up socket reference
    }

    setSnackbarMessage(
      'Unable to reconnect to the server after multiple attempts.'
    );
    setSnackbarOpen(true);
  }, []);

  const handleReconnect = useCallback((attempt: number) => {
    console.log('Reconnected on attempt:', attempt);
  }, []);

  // App specific events
  const handleRuleEngineRefreshStarted = useCallback(() => {
    console.log('New Rule Engine Refresh Started');
    showSnackMessage('Rule Engine Refresh started');
  }, []);

  const handleRuleEngineRefreshAlreadyStarted = useCallback(() => {
    console.log('Rule Engine Refresh already started');
    showSnackMessage('Rule Engine Refresh already started');
  }, []);

  const handleRuleEngineRefreshProgress = useCallback(
    (data: { progress: number }) => {
      console.log('New Process Update message from Server');
      setProgress(data.progress);
    },
    []
  );

  const handleRuleEngineRefreshComplete = useCallback(() => {
    console.log('New Process Complete message from Server');
    setProgress(100);
    showSnackMessage('Process completed');
  }, []);

  //////////////////////////////  SOCKET METHODS  ////////////////////////////////

  const createSocket = useCallback(() => {
    // Check before creating a new one
    // Since Strict Mode intentionally renders components twice (in development, not production)
    // to help identify side effects and unexpected behavior.
    if (!socketRef.current) {
      console.log('Creating new socket');

      const newSocket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: false, // Prevent auto-connection
      });

      newSocket.on('connect', handleSocketConnect); // Works
      newSocket.on('connect_error', handleSocketError); // Works
      newSocket.on('disconnect', handleSocketDisconnect); // Works
      newSocket.io.on('reconnect_attempt', handleReconnectAttempt); // Works on each attempt

      newSocket.io.on('reconnect_error', handleReconnectError); // Works on each attempt
      newSocket.io.on('reconnect_failed', handleReconnectFailed); // Works after all attempts fail
      newSocket.io.on('reconnect', handleReconnect);

      newSocket.on(
        'ruleEngineRefreshStarted',
        handleRuleEngineRefreshStarted
      );
      newSocket.on(
        'ruleEngineAlreadyStarted',
        handleRuleEngineRefreshAlreadyStarted
      );
      newSocket.on(
        'ruleEngineRefreshUpdate',
        handleRuleEngineRefreshProgress
      );
      newSocket.on(
        'ruleEngineRefreshComplete',
        handleRuleEngineRefreshComplete
      );

      socketRef.current = newSocket;
    } else {
      console.log('A socket already exists');
    }
  }, [
    handleSocketConnect,
    handleSocketError,
    handleSocketDisconnect,
    handleReconnectAttempt,
    handleReconnectError,
    handleReconnectFailed,
    handleReconnect,
    handleRuleEngineRefreshStarted,
    handleRuleEngineRefreshAlreadyStarted,
    handleRuleEngineRefreshProgress,
    handleRuleEngineRefreshComplete,
  ]);

  const connectSocket = useCallback(() => {
    if (socketRef.current) {
      if (!socketRef.current.connected) {
        console.log('Connecting to socket');
        socketRef.current.connect();
      } else {
        console.log('Socket is already connected');
      }
    } else {
      console.log('Socket does not exist');
    }
  }, []);

  // Try reconnecting or re-creating the socket if needed
  const reconnectSocket = useCallback(() => {
    if (socketRef.current) {
      if (!socketRef.current.connected) {
        console.log('Attempting to reconnect socket');
        socketRef.current.connect();
      }
    } else {
      console.log('Recreating a new socket after failure');
      createSocket(); // Recreate the socket if it was destroyed
    }
  }, [createSocket]);

  // Create and destroy the socket
  useEffect(() => {
    console.log('UseEffect create socket');
    createSocket();

    return () => {
      console.log('Cleaning up socket');

      if (socketRef.current) {
        socketRef.current.off('connect', handleSocketConnect);
        socketRef.current.off('connect_error', handleSocketError);
        socketRef.current.off('disconnect', handleSocketDisconnect);

        socketRef.current.io.on(
          'reconnect_attempt',
          handleReconnectAttempt
        );
        socketRef.current.io.on(
          'reconnect_failed',
          handleReconnectFailed
        );
        socketRef.current.io.on('reconnect', handleReconnect);

        socketRef.current.off(
          'ruleEngineRefreshStarted',
          handleRuleEngineRefreshStarted
        );
        socketRef.current.off(
          'ruleEngineAlreadyStarted',
          handleRuleEngineRefreshAlreadyStarted
        );
        socketRef.current.off(
          'ruleEngineRefreshUpdate',
          handleRuleEngineRefreshProgress
        );
        socketRef.current.off(
          'ruleEngineRefreshComplete',
          handleRuleEngineRefreshComplete
        );

        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }

        socketRef.current.close(); // Destroy the socket
        socketRef.current = null; // Clean up socket reference
      }
    };
  }, [
    createSocket,
    handleRuleEngineRefreshComplete,
    handleSocketConnect,
    handleSocketDisconnect,
    handleSocketError,
    handleRuleEngineRefreshProgress,
    handleRuleEngineRefreshStarted,
    handleRuleEngineRefreshAlreadyStarted,
    handleReconnectFailed,
    handleReconnectAttempt,
    handleReconnect,
  ]);

  ////////////////////////////////////////////////////////////////////////

  const handleTriggerRuleEngine = useCallback(() => {
    console.log('handleTriggerRuleEngine');
    reconnectSocket(); // Ensure socket is connected before emitting

    if (socketRef.current) {
      if (socketRef.current.connected) {
        console.log(
          'Emitting triggerRuleEngineRefresh from connected socket'
        );
        socketRef.current.emit('triggerRuleEngineRefresh');
      } else {
        connectSocket(); // Ensure socket is connected before emitting
        console.log('Waiting for socket connection...');
        showSnackMessage('Waiting for socket connection...');

        // Listen for the `connect` event and emit the event once connected
        socketRef.current.once('connect', () => {
          console.log('Connected after waiting');
          // For some reason if I move this to a function and call it here the socket will still not be connected
          console.log(
            'Emitting triggerRuleEngineRefresh from recently connected socket'
          );
          socketRef.current?.emit('triggerRuleEngineRefresh');
        });
      }
    } else {
      console.log('Socket does not exist');
      showSnackMessage(
        'Unable to start process. Socket is not initialized'
      );
    }
  }, [connectSocket, reconnectSocket]);

  const showSnackMessage = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <button onClick={handleTriggerRuleEngine}>
        Trigger Rule Engine Refresh
      </button>
      {
        <div>
          <h2>Rule Engine Progress</h2>
          <progress value={progress} max='100' />
          <p>{progress}% complete</p>
        </div>
      }
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </div>
  );
}

export default ProcessManager;
