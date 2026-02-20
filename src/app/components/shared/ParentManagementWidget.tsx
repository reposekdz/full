import React, { useState, useEffect } from 'react';
import { Users, Phone, MessageSquare, UserPlus, RefreshCw, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Badge } from '@/app/components/ui/badge';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { toast } from 'sonner';
import apiService from '@/app/services/apiService';

interface ParentManagementWidgetProps {
  studentId?: number;
  showAllParents?: boolean;
  compact?: boolean;
}

export const ParentManagementWidget: React.FC<ParentManagementWidgetProps> = ({ 
  studentId, 
  showAllParents = false,
  compact = false 
}) => {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '', contact_type: 'sms' });
  const [linkForm, setLinkForm] = useState({ parent_phone: '', parent_name: '', relationship_type: 'guardian' });

  useEffect(() => { loadParents(); }, [studentId, showAllParents]);

  const loadParents = async () => {
    setLoading(true);
    try {
      const res = showAllParents 
        ? await apiService.request('/dod-parent-management/parents', { limit: 100 })
        : await apiService.request(`/dod-parent-management/parents/${studentId}/students`);
      setParents(showAllParents ? (res.parents || []) : (res.students || []));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    if (!contactForm.message.trim()) return toast.error('Enter message');
    try {
      await apiService.request('/dod-parent-management/contact-student-parents', {
        student_id: studentId,
        ...contactForm
      }, 'POST');
      toast.success('Message sent!');
      setShowContactModal(false);
    } catch (error) {
      toast.error('Failed to send');
    }
  };

  const handleLink = async () => {
    if (!linkForm.parent_phone || !linkForm.parent_name) return toast.error('Fill all fields');
    try {
      await apiService.request('/dod-parent-management/auto-link-parent', {
        student_id: studentId,
        ...linkForm
      }, 'POST');
      toast.success('Parent linked!');
      setShowLinkModal(false);
      loadParents();
    } catch (error) {
      toast.error('Failed to link');
    }
  };

  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Parents</CardTitle>
            <Button size="sm" variant="ghost" onClick={loadParents}><RefreshCw className="size-3" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? <p className="text-xs text-muted-foreground">Loading...</p> : 
           parents.length === 0 ? <p className="text-xs text-muted-foreground">No parents</p> :
           parents.slice(0, 3).map((p, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <div>
                <p className="font-medium">{p.first_name} {p.last_name}</p>
                <p className="text-muted-foreground">{p.phone}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setShowContactModal(true)}>
                <MessageSquare className="size-3" />
              </Button>
            </div>
          ))}
          {studentId && <Button size="sm" variant="outline" className="w-full" onClick={() => setShowLinkModal(true)}>
            <UserPlus className="size-3 mr-1" /> Link
          </Button>}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              {showAllParents ? 'All Parents' : 'Linked Parents'}
            </CardTitle>
            <div className="flex gap-2">
              {studentId && <Button size="sm" onClick={() => setShowLinkModal(true)}>
                <UserPlus className="size-4 mr-1" /> Link
              </Button>}
              <Button size="sm" variant="outline" onClick={loadParents}><RefreshCw className="size-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p>Loading...</p> : parents.length === 0 ? <p>No parents</p> :
           parents.map((p, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold">{p.first_name} {p.last_name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-3" />
                      <span>{p.phone}</span>
                    </div>
                    {p.relationship_type && <Badge variant="secondary">{p.relationship_type}</Badge>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setShowContactModal(true)}>
                    <MessageSquare className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Contact Parent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Method</Label>
              <Select value={contactForm.contact_type} onValueChange={(v) => setContactForm({...contactForm, contact_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={contactForm.subject} onChange={(e) => setContactForm({...contactForm, subject: e.target.value})} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={contactForm.message} onChange={(e) => setContactForm({...contactForm, message: e.target.value})} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowContactModal(false)}>Cancel</Button>
            <Button onClick={handleContact}><Send className="size-4 mr-1" /> Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLinkModal} onOpenChange={setShowLinkModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Link Parent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Phone</Label>
              <Input value={linkForm.parent_phone} onChange={(e) => setLinkForm({...linkForm, parent_phone: e.target.value})} placeholder="0788123456" />
            </div>
            <div>
              <Label>Name</Label>
              <Input value={linkForm.parent_name} onChange={(e) => setLinkForm({...linkForm, parent_name: e.target.value})} />
            </div>
            <div>
              <Label>Relationship</Label>
              <Select value={linkForm.relationship_type} onValueChange={(v) => setLinkForm({...linkForm, relationship_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="father">Father</SelectItem>
                  <SelectItem value="mother">Mother</SelectItem>
                  <SelectItem value="guardian">Guardian</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkModal(false)}>Cancel</Button>
            <Button onClick={handleLink}><UserPlus className="size-4 mr-1" /> Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
