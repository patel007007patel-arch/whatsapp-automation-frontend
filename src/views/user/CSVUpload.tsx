import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from 'src/components/ui/dialog';
import { Icon } from '@iconify/react';
import { userAPI } from 'src/services/api';
import { Alert, AlertDescription } from 'src/components/ui/alert';

const CSVUpload = () => {
  const [csvs, setCsvs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [csvName, setCsvName] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCSVs();
  }, [page]);

  const fetchCSVs = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getCSVList({ page, limit });
      setCsvs(response.csvs || []);
      setTotal(response.pagination?.total || 0);
      setPages(response.pagination?.pages || 0);
    } catch (error: any) {
      alert(error.message || 'Failed to fetch CSV list');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }
      setCsvFile(file);
    }
  };

  const handleUpload = async () => {
    if (!csvName.trim()) {
      alert('Please enter a name for the CSV');
      return;
    }
    if (!csvFile) {
      alert('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('name', csvName.trim());

      await userAPI.uploadCSV(formData);
      alert('CSV uploaded successfully!');
      setIsDialogOpen(false);
      setCsvName('');
      setCsvFile(null);
      fetchCSVs();
    } catch (error: any) {
      alert(error.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CSV?')) {
      return;
    }

    try {
      setDeletingId(id);
      await userAPI.deleteCSV(id);
      alert('CSV deleted successfully!');
      fetchCSVs();
    } catch (error: any) {
      alert(error.message || 'Failed to delete CSV');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CSV Upload</h1>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Icon icon="solar:document-add-linear" className="h-4 w-4 mr-2" />
          Add CSV
        </Button>
      </div>

      <Alert className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <Icon icon="solar:info-circle-linear" className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>CSV Format:</strong> Your CSV should have columns for phone number and name (optional).
          Supported column names: phone, phoneNumber, number, mobile, Phone, PhoneNumber, Number, Mobile for phone numbers;
          name, Name, contact, Contact for names.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded CSVs</CardTitle>
          <CardDescription>Manage your CSV files for bulk messaging</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : csvs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No CSV files uploaded yet. Click "Add CSV" to upload your first CSV.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>File Name</TableHead>
                      <TableHead>Total Numbers</TableHead>
                      <TableHead>Uploaded At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvs.map((csv) => (
                      <TableRow key={csv._id}>
                        <TableCell className="font-medium">{csv.name}</TableCell>
                        <TableCell className="text-muted-foreground">{csv.fileName}</TableCell>
                        <TableCell>{csv.totalNumbers}</TableCell>
                        <TableCell>{formatDate(csv.uploadedAt || csv.createdAt)}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(csv._id)}
                            disabled={deletingId === csv._id}
                          >
                            {deletingId === csv._id ? (
                              'Deleting...'
                            ) : (
                              <>
                                <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4 mr-1" />
                                Delete
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} CSVs
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={p === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(p)}
                          className="w-10"
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with phone numbers and names for bulk messaging.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-name">CSV Name</Label>
              <Input
                id="csv-name"
                value={csvName}
                onChange={(e) => setCsvName(e.target.value)}
                placeholder="Enter a name for this CSV"
              />
            </div>
            <div>
              <Label htmlFor="csv-file">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
              {csvFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected: {csvFile.name}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploading || !csvName.trim() || !csvFile}>
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CSVUpload;

