import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, MessageSquare, ThumbsUp, Share2, BookOpen, Lock, Globe, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Avatar, AvatarFallback } from '@/app/components/ui/avatar';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function CollaborationStudyGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupForm, setGroupForm] = useState({
    name: '', description: '', subject: '', max_members: 50, privacy: 'public'
  });
  const [postForm, setPostForm] = useState({ content: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) fetchPosts();
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_URL}/collaboration/groups`);
      setGroups(res.data.groups || []);
    } catch (err) { console.error(err); }
  };

  const fetchPosts = async () => {
    if (!selectedGroup) return;
    try {
      const res = await axios.get(`${API_URL}/collaboration/groups/${selectedGroup.id}/posts`);
      setPosts(res.data.posts || []);
    } catch (err) { console.error(err); }
  };

  const handleCreateGroup = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(`${API_URL}/collaboration/groups`, { ...groupForm, created_by: user.id });
      setIsCreateGroupOpen(false);
      fetchGroups();
      setGroupForm({ name: '', description: '', subject: '', max_members: 50, privacy: 'public' });
    } catch (err) { console.error(err); }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(`${API_URL}/collaboration/groups/${groupId}/join`, { user_id: user.id });
      fetchGroups();
    } catch (err) { console.error(err); }
  };

  const handleCreatePost = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(`${API_URL}/collaboration/groups/${selectedGroup.id}/posts`, { ...postForm, user_id: user.id });
      setIsCreatePostOpen(false);
      fetchPosts();
      setPostForm({ content: '' });
    } catch (err) { console.error(err); }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      await axios.post(`${API_URL}/collaboration/posts/${postId}/like`, { user_id: user.id });
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const stats = [
    { title: 'Total Groups', value: groups.length, icon: Users, color: 'from-blue-500 to-blue-600' },
    { title: 'Active Members', value: groups.reduce((acc, g) => acc + (g.member_count || 0), 0), icon: Users, color: 'from-green-500 to-green-600' },
    { title: 'Total Posts', value: groups.reduce((acc, g) => acc + (g.post_count || 0), 0), icon: MessageSquare, color: 'from-purple-500 to-purple-600' },
    { title: 'Public Groups', value: groups.filter(g => g.privacy === 'public').length, icon: Globe, color: 'from-yellow-500 to-yellow-600' }
  ];

  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Study Groups & Collaboration</h1>
          <p className="text-gray-600">Social learning and peer collaboration</p>
        </div>
        <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" /> Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Group Name</Label>
                <Input value={groupForm.name} onChange={(e) => setGroupForm({...groupForm, name: e.target.value})} placeholder="e.g., Mathematics Study Group" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={groupForm.description} onChange={(e) => setGroupForm({...groupForm, description: e.target.value})} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Subject</Label>
                  <Input value={groupForm.subject} onChange={(e) => setGroupForm({...groupForm, subject: e.target.value})} placeholder="e.g., Mathematics" />
                </div>
                <div>
                  <Label>Max Members</Label>
                  <Input type="number" value={groupForm.max_members} onChange={(e) => setGroupForm({...groupForm, max_members: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <Label>Privacy</Label>
                <Select value={groupForm.privacy} onValueChange={(v) => setGroupForm({...groupForm, privacy: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateGroup} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">Create Group</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`bg-gradient-to-r ${stat.color} p-6 text-white`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/80 text-sm">{stat.title}</p>
                      <p className="text-3xl font-black mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className="w-10 h-10 opacity-80" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="space-y-3">
              <CardTitle>Study Groups ({groups.length})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input placeholder="Search groups..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              {filteredGroups.map(group => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedGroup?.id === group.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                          {group.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.subject}</p>
                      </div>
                    </div>
                    {group.privacy === 'private' ? <Lock className="w-4 h-4 text-gray-400" /> : <Globe className="w-4 h-4 text-green-500" />}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex gap-3">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {group.member_count || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {group.post_count || 0}</span>
                    </div>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleJoinGroup(group.id); }}>Join</Button>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedGroup ? selectedGroup.name : 'Select a group'}</CardTitle>
              {selectedGroup && (
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <Plus className="w-4 h-4 mr-2" /> New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea value={postForm.content} onChange={(e) => setPostForm({content: e.target.value})} rows={5} placeholder="Share your thoughts..." />
                      <Button onClick={handleCreatePost} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">Post</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedGroup ? (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {posts.map(post => (
                    <Card key={post.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar>
                            <AvatarFallback className="bg-blue-600 text-white">
                              {post.first_name?.charAt(0)}{post.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold">{post.first_name} {post.last_name}</p>
                            <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-3">{post.content}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <Button size="sm" variant="ghost" onClick={() => handleLikePost(post.id)}>
                            <ThumbsUp className="w-4 h-4 mr-1" /> {post.like_count || 0}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MessageSquare className="w-4 h-4 mr-1" /> {post.comment_count || 0}
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Share2 className="w-4 h-4 mr-1" /> Share
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {posts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No posts yet. Be the first to post!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-[600px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No group selected</p>
                  <p className="text-sm">Select a study group to view posts and discussions</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
