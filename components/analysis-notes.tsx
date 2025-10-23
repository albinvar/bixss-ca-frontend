"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Lightbulb,
  Flag,
  FileText,
  Lock,
  Globe
} from 'lucide-react';
import { analysisNotesApi } from '@/lib/api';

interface AnalysisNotesProps {
  analysisId: string;
  companyId?: string;
}

export default function AnalysisNotes({ analysisId }: AnalysisNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    noteType: 'general',
    isPrivate: false
  });

  const isCA = user?.role === 'ca';

  useEffect(() => {
    fetchNotes();
  }, [analysisId]);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const response = await analysisNotesApi.getByAnalysis(analysisId);
      if (response.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingNote(null);
    setFormData({
      title: '',
      content: '',
      noteType: 'general',
      isPrivate: false
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setFormData({
      title: note.title || '',
      content: note.content,
      noteType: note.noteType,
      isPrivate: note.isPrivate
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      toast.error('Note content is required');
      return;
    }

    try {
      if (editingNote) {
        await analysisNotesApi.update(editingNote._id, formData);
        toast.success('Note updated successfully');
      } else {
        await analysisNotesApi.create({
          analysisId,
          ...formData
        });
        toast.success('Note created successfully');
      }
      setIsDialogOpen(false);
      fetchNotes();
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await analysisNotesApi.delete(noteId);
      toast.success('Note deleted successfully');
      fetchNotes();
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const getNoteTypeIcon = (type: string) => {
    switch (type) {
      case 'concern':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'highlight':
        return <Flag className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNoteTypeBadgeVariant = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case 'concern':
        return 'destructive';
      case 'recommendation':
        return 'default';
      case 'highlight':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              CA Notes & Commentary
            </CardTitle>
            <CardDescription>
              {isCA
                ? 'Add notes and recommendations for this analysis'
                : 'Notes from your Chartered Accountant'}
            </CardDescription>
          </div>
          {isCA && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {isCA ? 'No notes yet. Add your first note.' : 'No notes available for this analysis.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note._id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getNoteTypeIcon(note.noteType)}
                    {note.title && (
                      <h4 className="font-medium">{note.title}</h4>
                    )}
                    <Badge variant={getNoteTypeBadgeVariant(note.noteType)} className="text-xs">
                      {note.noteType}
                    </Badge>
                    {note.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Private
                      </Badge>
                    )}
                    {!note.isPrivate && (
                      <Badge variant="outline" className="text-xs">
                        <Globe className="h-3 w-3 mr-1" />
                        Visible to Company
                      </Badge>
                    )}
                  </div>
                  {isCA && note.createdBy?._id === user?._id && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(note._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <p className="text-sm whitespace-pre-wrap">{note.content}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>By: {note.createdBy?.name || 'Unknown'}</span>
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  {note.editedAt && (
                    <span>(Edited: {new Date(note.editedAt).toLocaleDateString()})</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNote ? 'Edit Note' : 'Add New Note'}
              </DialogTitle>
              <DialogDescription>
                {formData.isPrivate
                  ? 'This note will only be visible to CAs'
                  : 'This note will be visible to the company'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="noteType">Note Type</Label>
                <Select value={formData.noteType} onValueChange={(value) => setFormData({ ...formData, noteType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Note</SelectItem>
                    <SelectItem value="concern">Concern</SelectItem>
                    <SelectItem value="recommendation">Recommendation</SelectItem>
                    <SelectItem value="highlight">Highlight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Brief title for the note..."
                />
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your note here..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isPrivate"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData({ ...formData, isPrivate: checked })}
                />
                <Label htmlFor="isPrivate" className="cursor-pointer">
                  Private note (only visible to CAs)
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingNote ? 'Update' : 'Create'} Note
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
