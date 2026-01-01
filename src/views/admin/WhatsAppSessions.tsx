import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { Badge } from 'src/components/ui/badge';
import { adminAPI } from 'src/services/api';

const WhatsAppSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const data = await adminAPI.getWhatsAppSessions({ limit: 100 });
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">WhatsApp Sessions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Connected At</TableHead>
                <TableHead>Last Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No sessions found
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map((session) => (
                  <TableRow key={session._id}>
                    <TableCell>{session.userId?.email || 'N/A'}</TableCell>
                    <TableCell>{session.phoneNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'connected' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {session.connectedAt ? new Date(session.connectedAt).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {session.lastActive ? new Date(session.lastActive).toLocaleString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppSessions;

