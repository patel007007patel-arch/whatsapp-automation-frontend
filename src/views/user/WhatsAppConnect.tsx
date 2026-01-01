import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { whatsappAPI } from 'src/services/api';
import { Icon } from '@iconify/react';
import { QRCodeSVG } from 'qrcode.react';

const WhatsAppConnect = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [reconnectSuccess, setReconnectSuccess] = useState(false);

  useEffect(() => {
    let previousStatus: boolean | null = null;
    
    const checkStatus = async () => {
      try {
        const data = await whatsappAPI.getStatus();
        const wasConnected = previousStatus;
        const isNowConnected = data.isConnected;
        
        // Check if reconnected (was disconnected, now connected)
        // Also check if this is the first load and we're connected (auto-reconnection)
        if (isNowConnected && (wasConnected === false || previousStatus === null)) {
          // Only show success message if we transitioned from disconnected to connected
          if (wasConnected === false) {
            setReconnectSuccess(true);
            setTimeout(() => setReconnectSuccess(false), 5000);
          }
        }
        
        setStatus(data);
        setLoading(false);
        
        if (data.isConnected) {
          setQrCode(null);
          setQrLoading(false);
        } else {
          // Only fetch QR if we're not already showing one
          if (!qrCode && !qrLoading) {
            fetchQR();
          }
        }
        
        previousStatus = isNowConnected;
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setLoading(false);
      }
    };
    
    // Initial fetch immediately
    checkStatus();
    
    // Poll every 3 seconds for faster updates
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchQR = async () => {
    try {
      setQrLoading(true);
      const data = await whatsappAPI.getQR();
      setQrCode(data.qrCode);
      setQrLoading(false);
    } catch (error) {
      console.error('Failed to fetch QR:', error);
      setQrLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const previousStatus = status?.isConnected;
      const data = await whatsappAPI.getStatus();
      setStatus(data);
      setLoading(false);
      
      if (data.isConnected) {
        setQrCode(null);
        // Show success message if just reconnected
        if (!previousStatus && previousStatus !== undefined) {
          setReconnectSuccess(true);
          setTimeout(() => setReconnectSuccess(false), 5000);
        }
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setQrLoading(true);
      setQrCode(null); // Clear existing QR code
      await whatsappAPI.connect();
      // Wait a bit for QR to generate, then fetch it
      setTimeout(() => {
        fetchQR();
        fetchStatus();
      }, 3000);
    } catch (error: any) {
      console.error('Failed to connect:', error);
      alert(error.message || 'Failed to connect. Please try again.');
      setLoading(false);
      setQrLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await whatsappAPI.disconnect();
      setStatus({ isConnected: false });
      setQrCode(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Connect WhatsApp</h1>

      {reconnectSuccess && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
          <Icon icon="solar:check-circle-bold" className="h-5 w-5 text-green-600" />
          <span className="text-green-800 dark:text-green-200 font-medium">
            WhatsApp reconnected successfully!
          </span>
        </div>
      )}

      {reconnecting && (
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center gap-2">
          <Icon icon="solar:refresh-linear" className="h-5 w-5 text-blue-600 animate-spin" />
          <span className="text-blue-800 dark:text-blue-200 font-medium">
            Reconnecting WhatsApp...
          </span>
        </div>
      )}

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>WhatsApp Connection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status?.isConnected ? (
            <>
              <div className="flex items-center justify-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                <Icon icon="solar:check-circle-linear" className="h-8 w-8 text-green-600 mr-2" />
                <div>
                  <div className="font-semibold text-green-600">Connected</div>
                  <div className="text-sm text-muted-foreground">
                    {status.phoneNumber || 'Connected'}
                  </div>
                  {status.connectedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Connected: {new Date(status.connectedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                  Disconnect
                </Button>
                <Button 
                  onClick={async () => {
                    setReconnecting(true);
                    await fetchStatus();
                    setTimeout(() => setReconnecting(false), 1000);
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  <Icon icon="solar:refresh-linear" className="h-4 w-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </>
          ) : qrLoading || qrCode ? (
            <>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                  {qrLoading ? (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <Icon 
                          icon="solar:qr-code-linear" 
                          className="h-16 w-16 text-primary animate-spin" 
                        />
                        <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                      </div>
                    </div>
                  ) : qrCode ? (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <QRCodeSVG
                        value={qrCode}
                        size={256}
                        level="H"
                        includeMargin={true}
                        className="w-full h-full"
                      />
                    </div>
                  ) : null}
                </div>
                {!qrLoading && qrCode && (
                  <>
                    <p className="text-sm text-center text-muted-foreground">
                      Scan this QR code using your WhatsApp mobile app
                    </p>
                    <div className="flex items-center space-x-2">
                      <Icon icon="solar:clock-circle-linear" className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Waiting for scan...</span>
                    </div>
                  </>
                )}
              </div>
              {!qrLoading && (
                <div className="flex gap-2">
                  <Button 
                    onClick={fetchQR} 
                    variant="outline" 
                    className="flex-1"
                    disabled={qrLoading}
                  >
                    <Icon icon="solar:refresh-linear" className="h-4 w-4 mr-2" />
                    Refresh QR Code
                  </Button>
                  <Button 
                    onClick={handleConnect} 
                    variant="outline" 
                    className="flex-1"
                    disabled={qrLoading}
                  >
                    <Icon icon="solar:qr-code-linear" className="h-4 w-4 mr-2" />
                    Generate New QR
                  </Button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-center p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Icon icon="solar:close-circle-linear" className="h-8 w-8 text-yellow-600 mr-2" />
                <div className="font-semibold text-yellow-600">Not Connected</div>
              </div>
              <Button 
                onClick={handleConnect} 
                className="w-full"
                disabled={qrLoading}
              >
                {qrLoading ? (
                  <>
                    <Icon icon="solar:qr-code-linear" className="h-4 w-4 mr-2 animate-spin" />
                    Generating QR Code...
                  </>
                ) : (
                  'Generate QR Code'
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppConnect;

