import React, { useState, useEffect } from 'react';
import { Users, Trash2, Eye, Phone, Mail, MapPin, Calendar, UserCheck, Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:5000/api';

const DODParentManagement = () => {
  const [parents, setParents] = useState([]);
  const [filteredParents, setFilteredParents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParent, setSelectedParent] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [parentDetails, setParentDetails] = useState(null);
  const [stats, setStats] = useState({ total: 0, withChildren: 0, withoutChildren: 0 });

  useEffect(() => {
    loadParents();
  }, []);

  useEffect(() => {
    filterParents();
  }, [parents, searchTerm]);

  const loadParents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/parent-child-linking-advanced/all-parents`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const parentsData = response.data.parents || [];
        setParents(parentsData);
        
        setStats({
          total: parentsData.length,
          withChildren: parentsData.filter(p => p.linked_children_count > 0).length,
          withoutChildren: parentsData.filter(p => p.linked_children_count === 0).length
        });
      }
    } catch (error) {
      console.error('Error loading parents:', error);
      toast.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const filterParents = () => {
    if (!searchTerm) {
      setFilteredParents(parents);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = parents.filter(parent => {
      const fullName = parent.full_name?.toLowerCase() || '';
      const email = parent.email?.toLowerCase() || '';
      const phone = parent.phone?.toLowerCase() || '';
      const username = parent.username?.toLowerCase() || '';
      
      return fullName.includes(term) || email.includes(term) || phone.includes(term) || username.includes(term);
    });

    setFilteredParents(filtered);
  };

  const loadParentDetails = async (parentId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/parent-child-linking-advanced/parent-details/${parentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setParentDetails(response.data);
        setShowDetailsDialog(true);
      }
    } catch (error) {
      console.error('Error loading parent details:', error);
      toast.error('Failed to load parent details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParent = async () => {
    if (!selectedParent) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_BASE}/parent-child-linking-advanced/delete-parent/${selectedParent.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('🗑️ Parent account deleted successfully');
        setShowDeleteDialog(false);
        setSelectedParent(null);
        loadParents();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete parent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-sm opacity-90">Total Parents</div>
              </div>
              <Users className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.withChildren}</div>
                <div className="text-sm opacity-90">With Linked Children</div>
              </div>
              <UserCheck className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">{stats.withoutChildren}</div>
                <div className="text-sm opacity-90">Without Children</div>
              </div>
              <AlertTriangle className="w-12 h-12 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, phone, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={loadParents} variant="outline">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Parents List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading parents...</p>
        </div>
      ) : filteredParents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No parents found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParents.map((parent) => (
            <Card key={parent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    {parent.full_name}
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedParent(parent);
                      setShowDeleteDialog(true);
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    {parent.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{parent.phone}</span>
                      </div>
                    )}
                    {parent.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <span className="text-xs truncate">{parent.email}</span>
                      </div>
                    )}
                    {parent.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-xs">{parent.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="text-lg font-bold text-green-700">{parent.linked_children_count}</div>
                      <div className="text-xs text-green-600">Linked Children</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="text-lg font-bold text-blue-700">{parent.total_applications || 0}</div>
                      <div className="text-xs text-blue-600">Applications</div>
                    </div>
                  </div>

                  {/* Pending Badge */}
                  {parent.pending_applications > 0 && (
                    <Badge className="w-full justify-center bg-orange-500 text-white">
                      {parent.pending_applications} Pending Application{parent.pending_applications > 1 ? 's' : ''}
                    </Badge>
                  )}

                  {/* Actions */}
                  <Button
                    onClick={() => loadParentDetails(parent.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
                    <Calendar className="w-3 h-3" />
                    <span>Joined: {new Date(parent.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Parent Details
            </DialogTitle>
          </DialogHeader>
          {parentDetails && (
            <div className="space-y-4">
              {/* Parent Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-lg">Parent Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold">{parentDetails.parent.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-semibold">{parentDetails.parent.username}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-semibold">{parentDetails.parent.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-semibold text-xs">{parentDetails.parent.email || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-semibold">{parentDetails.parent.address || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Linked Children */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Linked Children ({parentDetails.children.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {parentDetails.children.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No linked children</p>
                  ) : (
                    <div className="space-y-3">
                      {parentDetails.children.map((child) => (
                        <div key={child.id} className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-green-900">
                                {child.first_name} {child.last_name}
                              </p>
                              <p className="text-sm text-green-700">{child.student_code}</p>
                              <p className="text-xs text-green-600">
                                {child.trade_code} Level {child.level_number} • {child.gender}
                              </p>
                            </div>
                            <Badge className="bg-green-600">Active</Badge>
                          </div>
                          <div className="mt-2 text-xs text-gray-600">
                            Linked: {new Date(child.linked_at).toLocaleDateString()} by {child.linked_by_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Applications ({parentDetails.applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {parentDetails.applications.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No applications</p>
                  ) : (
                    <div className="space-y-2">
                      {parentDetails.applications.map((app) => (
                        <div key={app.id} className={`p-3 rounded border ${
                          app.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
                          app.status === 'approved' ? 'bg-green-50 border-green-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold">{app.child_full_name}</p>
                              <p className="text-xs text-gray-600">
                                {app.child_trade_code} Level {app.child_level_number}
                              </p>
                            </div>
                            <Badge className={
                              app.status === 'pending' ? 'bg-yellow-500' :
                              app.status === 'approved' ? 'bg-green-500' :
                              'bg-red-500'
                            }>
                              {app.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Submitted: {new Date(app.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Delete Parent Account
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedParent && (
              <>
                <div className="bg-red-50 p-4 rounded border-2 border-red-300">
                  <p className="font-semibold text-red-900 mb-2">⚠️ Are you sure?</p>
                  <p className="text-sm text-red-700">
                    This will permanently delete the parent account and all associated data:
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm"><strong>Parent:</strong> {selectedParent.full_name}</p>
                    <p className="text-sm"><strong>Email:</strong> {selectedParent.email}</p>
                    <p className="text-sm"><strong>Phone:</strong> {selectedParent.phone}</p>
                    <p className="text-sm"><strong>Linked Children:</strong> {selectedParent.linked_children_count}</p>
                    <p className="text-sm"><strong>Applications:</strong> {selectedParent.total_applications}</p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-3 rounded border border-yellow-300">
                  <p className="text-sm text-yellow-800">
                    ⚠️ This action cannot be undone. All parent-child links and applications will be deleted.
                  </p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDeleteParent}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DODParentManagement;
