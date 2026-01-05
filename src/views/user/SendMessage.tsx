import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Textarea } from 'src/components/ui/textarea';
import { Label } from 'src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select';
import { Progress } from 'src/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from 'src/components/ui/dialog';
import { messageAPI, userAPI } from 'src/services/api';

interface MessageItem {
  type: 'text' | 'image' | 'document';
  text: string;
  mediaUrl: string;
  fileName: string;
}

const SendMessage = () => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [csvs, setCsvs] = useState<any[]>([]);
  const [selectedCSV, setSelectedCSV] = useState<string>('');
  const [bulkMessages, setBulkMessages] = useState<MessageItem[]>([]);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkProgress, setBulkProgress] = useState({
    show: false,
    current: 0,
    total: 0,
    percentage: 0,
    status: '',
  });
  const [formData, setFormData] = useState({
    to: '',
    type: 'text',
    content: {
      text: '',
      mediaUrl: '',
      fileName: '',
      recipients: [] as string[],
      messages: [] as MessageItem[],
    },
  });

  useEffect(() => {
    fetchCSVs();
  }, []);

  const fetchCSVs = async () => {
    try {
      const response = await userAPI.getCSVList({ page: 1, limit: 100 });
      setCsvs(response.csvs || []);
    } catch (error) {
      console.error('Failed to fetch CSVs:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData({
        ...formData,
        content: { ...formData.content, fileName: file.name, mediaUrl: '' },
      });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFormData({
      ...formData,
      content: { ...formData.content, fileName: '', mediaUrl: '' },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Calculate total for bulk messages
    let totalMessages = 0;
    let isBulk = false;
    
    if (formData.type === 'bulk' && selectedCSV) {
      const selectedCsvData = csvs.find(c => c._id === selectedCSV);
      const recipientCount = selectedCsvData?.totalNumbers || 0;
      const messageCount = bulkMessages.length > 0 ? bulkMessages.length : 1;
      totalMessages = recipientCount * messageCount;
      isBulk = true;
    } else if (formData.type === 'bulk' && formData.content.recipients.length > 0) {
      const recipientCount = formData.content.recipients.length;
      const messageCount = bulkMessages.length > 0 ? bulkMessages.length : 1;
      totalMessages = recipientCount * messageCount;
      isBulk = true;
    }

    // Show progress for bulk messages
    let progressInterval: NodeJS.Timeout | null = null;
    if (isBulk && totalMessages > 0) {
      setBulkProgress({
        show: true,
        current: 0,
        total: totalMessages,
        percentage: 0,
        status: 'Starting...',
      });
      
      // Simulate progress updates (estimate: ~2 seconds per message)
      let simulatedProgress = 0;
      const estimatedTimePerMessage = 2000; // 2 seconds
      const updateInterval = 500; // Update every 500ms
      const incrementPerUpdate = (updateInterval / (totalMessages * estimatedTimePerMessage)) * 100;
      
      progressInterval = setInterval(() => {
        simulatedProgress = Math.min(simulatedProgress + incrementPerUpdate, 95); // Cap at 95% until done
        setBulkProgress(prev => ({
          ...prev,
          percentage: simulatedProgress,
          status: `Sending... ${Math.round(simulatedProgress)}%`,
        }));
      }, updateInterval);
    }

    try {
      if (formData.type === 'bulk' && selectedCSV) {
        // Handle bulk message with CSV
        if (bulkMessages.length > 0) {
          // Multiple messages bulk
          const result = await messageAPI.sendBulkMultipleFromCSV({
            csvId: selectedCSV,
            messages: bulkMessages,
            files: bulkFiles,
          });
          if (isBulk && progressInterval) {
            clearInterval(progressInterval);
            setBulkProgress(prev => ({
              ...prev,
              current: prev.total,
              percentage: 100,
              status: `Completed! ${result.successCount || 0} sent, ${result.failCount || 0} failed`,
            }));
            setTimeout(() => {
              setBulkProgress({ show: false, current: 0, total: 0, percentage: 0, status: '' });
            }, 3000);
          }
        } else {
          // Single text message bulk
          const result = await messageAPI.sendBulkFromCSV({
            csvId: selectedCSV,
            type: 'text',
            content: { text: formData.content.text },
          });
          if (isBulk && progressInterval) {
            clearInterval(progressInterval);
            setBulkProgress(prev => ({
              ...prev,
              current: prev.total,
              percentage: 100,
              status: `Completed! ${result.successCount || 0} sent, ${result.failCount || 0} failed`,
            }));
            setTimeout(() => {
              setBulkProgress({ show: false, current: 0, total: 0, percentage: 0, status: '' });
            }, 3000);
          }
        }
      } else if (formData.type === 'multiple') {
        // Handle multiple messages
        await messageAPI.send({
          to: formData.to,
          type: 'multiple',
          content: { messages: formData.content.messages },
          files: multipleFiles,
        } as any);
      } else if (formData.type === 'bulk' && formData.content.recipients.length > 0) {
        // Handle bulk message with manual recipients
        if (bulkMessages.length > 0) {
          // Multiple messages bulk
          const result = await messageAPI.sendBulkMultiple({
            recipients: formData.content.recipients,
            messages: bulkMessages,
            files: bulkFiles,
          });
          if (isBulk && progressInterval) {
            clearInterval(progressInterval);
            setBulkProgress(prev => ({
              ...prev,
              current: prev.total,
              percentage: 100,
              status: `Completed! ${result.successCount || 0} sent, ${result.failCount || 0} failed`,
            }));
            setTimeout(() => {
              setBulkProgress({ show: false, current: 0, total: 0, percentage: 0, status: '' });
            }, 3000);
          }
        } else {
          // Single text message bulk
          const result = await messageAPI.sendBulk({
            recipients: formData.content.recipients,
            type: 'text',
            content: { text: formData.content.text },
          });
          if (isBulk && progressInterval) {
            clearInterval(progressInterval);
            setBulkProgress(prev => ({
              ...prev,
              current: prev.total,
              percentage: 100,
              status: `Completed! ${result.successCount || 0} sent, ${result.failCount || 0} failed`,
            }));
            setTimeout(() => {
              setBulkProgress({ show: false, current: 0, total: 0, percentage: 0, status: '' });
            }, 3000);
          }
        }
      } else {
        // Handle single message (existing logic)
        const content = selectedFile
          ? { ...formData.content, mediaUrl: '' }
          : formData.content;

        if (selectedFile) {
          await messageAPI.send({
            to: formData.to,
            type: formData.type,
            content,
            file: selectedFile,
          });
        } else {
          await messageAPI.send({
            to: formData.to,
            type: formData.type,
            content,
          });
        }
      }
      
      if (!isBulk) {
        alert('Message sent successfully!');
      }
      
      // Reset form
      setFormData({
        to: '',
        type: 'text',
        content: { text: '', mediaUrl: '', fileName: '', recipients: [], messages: [] },
      });
      setSelectedFile(null);
      setFilePreview(null);
      setMultipleFiles([]);
      setSelectedCSV('');
      setBulkMessages([]);
      setBulkFiles([]);
    } catch (error: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setBulkProgress({ show: false, current: 0, total: 0, percentage: 0, status: '' });
      alert(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = () => {
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        messages: [...formData.content.messages, { type: 'text', text: '', mediaUrl: '', fileName: '' }],
      },
    });
  };

  const removeMessage = (index: number) => {
    const newMessages = formData.content.messages.filter((_, i) => i !== index);
    const newFiles = multipleFiles.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      content: {
        ...formData.content,
        messages: newMessages,
      },
    });
    setMultipleFiles(newFiles);
  };

  const updateMessage = (index: number, field: keyof MessageItem, value: string) => {
    const newMessages = [...formData.content.messages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    setFormData({
      ...formData,
      content: { ...formData.content, messages: newMessages },
    });
  };

  const handleMultipleFileChange = (index: number, file: File | null) => {
    const newFiles = [...multipleFiles];
    if (file) {
      newFiles[index] = file;
    } else {
      newFiles.splice(index, 1);
    }
    setMultipleFiles(newFiles);
    
    if (file) {
      updateMessage(index, 'fileName', file.name);
    }
  };

  const addBulkMessage = () => {
    setBulkMessages([...bulkMessages, { type: 'text', text: '', mediaUrl: '', fileName: '' }]);
  };

  const removeBulkMessage = (index: number) => {
    const newMessages = bulkMessages.filter((_, i) => i !== index);
    const newFiles = bulkFiles.filter((_, i) => i !== index);
    setBulkMessages(newMessages);
    setBulkFiles(newFiles);
  };

  const updateBulkMessage = (index: number, field: keyof MessageItem, value: string) => {
    const newMessages = [...bulkMessages];
    newMessages[index] = { ...newMessages[index], [field]: value };
    setBulkMessages(newMessages);
  };

  const handleBulkFileChange = (index: number, file: File | null) => {
    const newFiles = [...bulkFiles];
    if (file) {
      newFiles[index] = file;
    } else {
      newFiles.splice(index, 1);
    }
    setBulkFiles(newFiles);
    
    if (file) {
      updateBulkMessage(index, 'fileName', file.name);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Send Message</h1>

      <Card>
        <CardHeader>
          <CardTitle>Send WhatsApp Message</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
              <TabsTrigger value="document">Document</TabsTrigger>
              <TabsTrigger value="multiple">Multiple</TabsTrigger>
              <TabsTrigger value="bulk">Bulk</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={formData.content.text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, text: e.target.value },
                      })
                    }
                    placeholder="Enter your message"
                    required
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Upload Image or Enter URL</Label>
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-6 px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                      {filePreview && (
                        <div className="mt-2">
                          <img
                            src={filePreview}
                            alt="Preview"
                            className="max-w-xs max-h-48 rounded-lg border"
                          />
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Input
                      value={formData.content.mediaUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: { ...formData.content, mediaUrl: e.target.value },
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                      disabled={!!selectedFile}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile
                      ? 'File selected. URL input is disabled.'
                      : 'Upload an image file or provide an image URL'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Caption (Optional)</Label>
                  <Textarea
                    value={formData.content.text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, text: e.target.value },
                      })
                    }
                    placeholder="Enter caption"
                  />
                </div>
              </TabsContent>

              <TabsContent value="document" className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Upload Document or Enter URL</Label>
                  <div className="space-y-3">
                    <div>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {selectedFile && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{selectedFile.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-6 px-2"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>
                    <Input
                      value={formData.content.mediaUrl}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: { ...formData.content, mediaUrl: e.target.value },
                        })
                      }
                      placeholder="https://example.com/document.pdf"
                      disabled={!!selectedFile}
                    />
                    {!selectedFile && (
                      <Input
                        value={formData.content.fileName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: { ...formData.content, fileName: e.target.value },
                          })
                        }
                        placeholder="document.pdf (required if using URL)"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile
                      ? 'File selected. URL input is disabled.'
                      : 'Upload a document file or provide a document URL'}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Caption (Optional)</Label>
                  <Textarea
                    value={formData.content.text}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: { ...formData.content, text: e.target.value },
                      })
                    }
                    placeholder="Enter caption"
                  />
                </div>
              </TabsContent>

              <TabsContent value="multiple" className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    placeholder="+1234567890"
                    required
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Messages (Send multiple messages in sequence)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addMessage}
                    >
                      + Add Message
                    </Button>
                  </div>
                  
                  {formData.content.messages.map((msg, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium">Message {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMessage(index)}
                          className="h-6 px-2 text-red-500"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select
                            value={msg.type}
                            onChange={(e) => {
                              const newMessages = [...formData.content.messages];
                              newMessages[index] = { ...newMessages[index], type: e.target.value as 'text' | 'image' | 'document' };
                              setFormData({
                                ...formData,
                                content: { ...formData.content, messages: newMessages },
                              });
                            }}
                            className="w-full p-2 border rounded"
                          >
                            <option value="text">Text</option>
                            <option value="image">Image</option>
                            <option value="document">Document</option>
                          </select>
                        </div>
                        
                        {msg.type === 'text' && (
                          <div className="space-y-2">
                            <Label>Text</Label>
                            <Textarea
                              value={msg.text}
                              onChange={(e) => updateMessage(index, 'text', e.target.value)}
                              placeholder="Enter your message"
                              required
                            />
                          </div>
                        )}
                        
                        {(msg.type === 'image' || msg.type === 'document') && (
                          <>
                            <div className="space-y-2">
                              <Label>Upload File or Enter URL</Label>
                              <div className="space-y-2">
                                <Input
                                  type="file"
                                  accept={msg.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx'}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    handleMultipleFileChange(index, file);
                                  }}
                                  className="cursor-pointer"
                                />
                                <div className="relative">
                                  <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                  </div>
                                  <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                                  </div>
                                </div>
                                <Input
                                  value={msg.mediaUrl}
                                  onChange={(e) => updateMessage(index, 'mediaUrl', e.target.value)}
                                  placeholder={msg.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/document.pdf'}
                                  disabled={!!multipleFiles[index]}
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <Label>Caption (Optional)</Label>
                              <Textarea
                                value={msg.text}
                                onChange={(e) => updateMessage(index, 'text', e.target.value)}
                                placeholder="Enter caption"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ))}
                  
                  {formData.content.messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Click "Add Message" to start creating your message sequence
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="bulk" className="space-y-4">
                <div className="space-y-2">
                  <Label>Select CSV or Enter Recipients Manually</Label>
                  <Select value={selectedCSV || 'manual'} onValueChange={(value) => {
                    if (value === 'manual') {
                      setSelectedCSV('');
                    } else {
                      setSelectedCSV(value);
                      // Clear manual recipients when CSV is selected
                      setFormData({
                        ...formData,
                        content: { ...formData.content, recipients: [] },
                      });
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a CSV file (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">None (Enter manually)</SelectItem>
                      {csvs.map((csv) => (
                        <SelectItem key={csv._id} value={csv._id}>
                          {csv.name} ({csv.totalNumbers} numbers)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {!selectedCSV && (
                  <div className="space-y-2">
                    <Label>Recipients (one per line)</Label>
                    <Textarea
                      value={formData.content.recipients.join('\n')}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          content: {
                            ...formData.content,
                            recipients: e.target.value.split('\n').filter((r) => r.trim()),
                          },
                        })
                      }
                      placeholder="+1234567890&#10;+0987654321"
                      required={!selectedCSV && bulkMessages.length === 0}
                    />
                  </div>
                )}
                
                {selectedCSV && (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Sending to all numbers in selected CSV
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Messages (Send multiple messages in sequence to all recipients)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addBulkMessage}
                    >
                      + Add Message
                    </Button>
                  </div>
                  
                  {bulkMessages.length === 0 ? (
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        value={formData.content.text}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            content: { ...formData.content, text: e.target.value },
                          })
                        }
                        placeholder="Enter your message"
                        required={bulkMessages.length === 0}
                      />
                    </div>
                  ) : (
                    bulkMessages.map((msg, index) => (
                      <Card key={index} className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-sm font-medium">Message {index + 1}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBulkMessage(index)}
                            className="h-6 px-2 text-red-500"
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <select
                              value={msg.type}
                              onChange={(e) => {
                                const newMessages = [...bulkMessages];
                                newMessages[index] = { ...newMessages[index], type: e.target.value as 'text' | 'image' | 'document' };
                                setBulkMessages(newMessages);
                              }}
                              className="w-full p-2 border rounded"
                            >
                              <option value="text">Text</option>
                              <option value="image">Image</option>
                              <option value="document">Document</option>
                            </select>
                          </div>
                          
                          {msg.type === 'text' && (
                            <div className="space-y-2">
                              <Label>Text</Label>
                              <Textarea
                                value={msg.text}
                                onChange={(e) => updateBulkMessage(index, 'text', e.target.value)}
                                placeholder="Enter your message"
                                required
                              />
                            </div>
                          )}
                          
                          {(msg.type === 'image' || msg.type === 'document') && (
                            <>
                              <div className="space-y-2">
                                <Label>Upload File or Enter URL</Label>
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept={msg.type === 'image' ? 'image/*' : '.pdf,.doc,.docx,.xls,.xlsx,.txt,.ppt,.pptx'}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null;
                                      handleBulkFileChange(index, file);
                                    }}
                                    className="cursor-pointer"
                                  />
                                  <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                      <span className="w-full border-t" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                                    </div>
                                  </div>
                                  <Input
                                    value={msg.mediaUrl}
                                    onChange={(e) => updateBulkMessage(index, 'mediaUrl', e.target.value)}
                                    placeholder={msg.type === 'image' ? 'https://example.com/image.jpg' : 'https://example.com/document.pdf'}
                                    disabled={!!bulkFiles[index]}
                                  />
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Caption (Optional)</Label>
                                <Textarea
                                  value={msg.text}
                                  onChange={(e) => updateBulkMessage(index, 'text', e.target.value)}
                                  placeholder="Enter caption"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bulk Progress Dialog */}
      <Dialog open={bulkProgress.show} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sending Bulk Messages</DialogTitle>
            <DialogDescription>
              Please wait while messages are being sent...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {bulkProgress.current} / {bulkProgress.total} messages
                </span>
              </div>
              <Progress value={bulkProgress.percentage} className="h-2" />
              <div className="text-center text-sm text-muted-foreground">
                {Math.round(bulkProgress.percentage)}%
              </div>
            </div>
            {bulkProgress.status && (
              <div className="text-center text-sm font-medium">
                {bulkProgress.status}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SendMessage;

