import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Switch } from 'src/components/ui/switch';
import { Label } from 'src/components/ui/label';
import { userAPI } from 'src/services/api';
import { Icon } from '@iconify/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';

// Get API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.arhamerp.com/api';

// Toast notifications - using alert for now, can be replaced with toast library
const toast = {
  success: (msg: string) => alert(msg),
  error: (msg: string) => alert(msg),
};

const ApiKeys = () => {
  const [apiKey, setApiKey] = useState<any>(null);
  const [fullKey, setFullKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetchApiKey();
  }, []);

  const fetchApiKey = async () => {
    try {
      const data = await userAPI.getApiKey();
      setApiKey(data.apiKey);
      setFullKey(data.apiKey?.fullKey || null);
    } catch (error) {
      console.error('Failed to fetch API key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const data = await userAPI.generateApiKey();
      setFullKey(data.apiKey);
      setApiKey({ ...apiKey, ...data, fullKey: data.apiKey });
      toast.success('API key generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate API key');
    }
  };

  const handleRegenerate = async () => {
    if (!confirm('Are you sure you want to regenerate your API key? This will invalidate the current key.')) {
      return;
    }
    try {
      const data = await userAPI.regenerateApiKey();
      setFullKey(data.apiKey);
      setApiKey({ ...apiKey, ...data, fullKey: data.apiKey });
      toast.success('API key regenerated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to regenerate API key');
    }
  };

  const handleToggle = async (isActive: boolean) => {
    try {
      await userAPI.toggleApiKey(isActive);
      setApiKey({ ...apiKey, isActive });
      toast.success(`API key ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle API key');
    }
  };

  const handleCopy = () => {
    if (fullKey) {
      navigator.clipboard.writeText(fullKey);
      toast.success('API key copied to clipboard');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">API Key Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your API Key</CardTitle>
            <CardDescription>
              Use this API key to authenticate your requests to the WhatsApp API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fullKey ? (
              <>
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={showKey ? fullKey : fullKey.substring(0, 8) + '...' + fullKey.substring(fullKey.length - 4)}
                      readOnly
                      className="font-mono"
                    />
                    <Button onClick={handleCopy} variant="outline" size="icon">
                      <Icon icon="solar:copy-linear" className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => setShowKey(!showKey)}
                      variant="outline"
                      size="icon"
                    >
                      <Icon icon={showKey ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable API Key</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable to temporarily stop API access
                    </p>
                  </div>
                  <Switch
                    checked={apiKey?.isActive || false}
                    onCheckedChange={handleToggle}
                  />
                </div>

                {apiKey?.lastUsed && (
                  <div className="text-sm text-muted-foreground">
                    Last used: {new Date(apiKey.lastUsed).toLocaleString()}
                  </div>
                )}

                <Button onClick={handleRegenerate} variant="destructive">
                  Regenerate API Key
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Generate an API key to authenticate your requests. Note: WhatsApp must be connected to use the API.
                </p>
                <Button onClick={handleGenerate}>Generate API Key</Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Documentation</CardTitle>
            <CardDescription>
              Learn how to use your API key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curl" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
              </TabsList>

              <TabsContent value="curl" className="mt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`curl -X POST \\
  ${API_BASE_URL}/messages/api/send \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+1234567890",
    "type": "text",
    "content": {
      "text": "Hello!"
    }
  }'`}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="nodejs" className="mt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`const axios = require('axios');

const response = await axios.post(
  '${API_BASE_URL}/messages/api/send',
  {
    to: '+1234567890',
    type: 'text',
    content: { text: 'Hello!' }
  },
  {
    headers: {
      'X-API-Key': 'YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);`}
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="python" className="mt-4">
                <div className="bg-muted p-4 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
{`import requests

response = requests.post(
  '${API_BASE_URL}/messages/api/send',
  json={
    'to': '+1234567890',
    'type': 'text',
    'content': {'text': 'Hello!'}
  },
  headers={'X-API-Key': 'YOUR_API_KEY'}
)`}
                  </pre>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm">
                <strong>Base URL:</strong> {API_BASE_URL}
              </p>
              <p className="text-sm mt-2">
                <strong>Endpoints:</strong>
              </p>
              <ul className="text-sm list-disc list-inside mt-1 space-y-1">
                <li>POST /messages/api/send - Send message</li>
                <li>GET /messages/api/logs - Get message logs</li>
              </ul>
            </div>

            <div className="mt-4">
              <Button
                onClick={async () => {
                  try {
                    await userAPI.downloadApiDocumentation();
                    toast.success('API documentation downloaded successfully!');
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to download documentation');
                  }
                }}
                className="w-full"
                variant="outline"
              >
                <Icon icon="solar:download-linear" className="h-4 w-4 mr-2" />
                Download API Integration Guide (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiKeys;
