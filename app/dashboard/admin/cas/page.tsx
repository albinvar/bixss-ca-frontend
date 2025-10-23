"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Building,
  FileText,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { adminApi, companiesApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function CAManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cas, setCas] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedCA, setSelectedCA] = useState<any>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    caLicenseNumber: '',
    registrationYear: '',
    firm: '',
    specialization: [] as string[],
    yearsOfExperience: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  useEffect(() => {
    fetchCAs();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm !== '') {
        fetchCAs();
      } else if (searchTerm === '') {
        fetchCAs();
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchCAs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllCAs({
        page: pagination.page,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
      });

      if (response.success) {
        setCas(response.data.cas);
        setPagination({
          page: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch CAs');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesApi.getAll({ page: 1, limit: 1000 });
      if (response.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Failed to fetch companies');
    }
  };

  const handleCreateCA = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Name, email, and password are required');
        return;
      }

      // Prepare data with proper type conversions
      const caData = {
        ...formData,
        registrationYear: formData.registrationYear ? parseInt(formData.registrationYear) : undefined,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : undefined,
      };

      const response = await adminApi.createCA(caData);
      if (response.success) {
        toast.success('CA created successfully');
        setCreateModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          caLicenseNumber: '',
          registrationYear: '',
          firm: '',
          specialization: [],
          yearsOfExperience: '',
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        });
        fetchCAs();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create CA');
    }
  };

  const handleUpdateCA = async () => {
    try {
      if (!selectedCA) return;

      const response = await adminApi.updateCA(selectedCA._id, {
        name: formData.name,
        email: formData.email,
      });

      if (response.success) {
        toast.success('CA updated successfully');
        setEditModalOpen(false);
        fetchCAs();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update CA');
    }
  };

  const handleDeleteCA = async () => {
    try {
      if (!selectedCA) return;

      const response = await adminApi.deleteCA(selectedCA._id);
      if (response.success) {
        toast.success('CA deleted successfully');
        setDeleteModalOpen(false);
        fetchCAs();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete CA');
    }
  };

  const handleAssignCompanies = async () => {
    try {
      if (!selectedCA || selectedCompanies.length === 0) {
        toast.error('Please select at least one company');
        return;
      }

      const response = await adminApi.assignCompanies(selectedCA._id, selectedCompanies);
      if (response.success) {
        toast.success(`Assigned ${selectedCompanies.length} companies successfully`);
        setAssignModalOpen(false);
        setSelectedCompanies([]);
        fetchCAs();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign companies');
    }
  };

  const openEditModal = (ca: any) => {
    setSelectedCA(ca);
    setFormData({ name: ca.name, email: ca.email, password: '' });
    setEditModalOpen(true);
  };

  const openAssignModal = (ca: any) => {
    setSelectedCA(ca);
    setSelectedCompanies(ca.invitedCompanies?.map((c: any) => c._id) || []);
    fetchCompanies();
    setAssignModalOpen(true);
  };

  const toggleCompanySelection = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CA Management</h1>
          <p className="text-muted-foreground">
            Create and manage Chartered Accountants, assign them to companies
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/dashboard/admin')}>
            Back to Dashboard
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create CA
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* CA List */}
      <Card>
        <CardHeader>
          <CardTitle>All CAs ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Firm</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Companies</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No CAs found
                    </TableCell>
                  </TableRow>
                ) : (
                  cas.map((ca) => (
                    <TableRow key={ca._id}>
                      <TableCell className="font-medium">{ca.name}</TableCell>
                      <TableCell>{ca.email}</TableCell>
                      <TableCell>{ca.firm || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{ca.phone || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>
                        <Badge variant={ca.isActive ? 'default' : 'secondary'}>
                          {ca.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          {ca.stats?.assignedCompanies || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/cas/${ca._id}`)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(ca)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit CA
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignModal(ca)}>
                              <Building className="w-4 h-4 mr-2" />
                              Assign Companies
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedCA(ca);
                                setDeleteModalOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete CA
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create CA Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New CA</DialogTitle>
            <DialogDescription>
              Add a new Chartered Accountant to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name *</label>
                  <Input
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Professional Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">CA License Number</label>
                  <Input
                    placeholder="e.g., 123456"
                    value={formData.caLicenseNumber}
                    onChange={(e) => setFormData({ ...formData, caLicenseNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Registration Year</label>
                  <Input
                    type="number"
                    placeholder="e.g., 2015"
                    value={formData.registrationYear}
                    onChange={(e) => setFormData({ ...formData, registrationYear: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Firm Name</label>
                  <Input
                    placeholder="e.g., ABC & Associates"
                    value={formData.firm}
                    onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Years of Experience</label>
                  <Input
                    type="number"
                    placeholder="e.g., 10"
                    value={formData.yearsOfExperience}
                    onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Address</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Street Address</label>
                  <Input
                    placeholder="123 Main Street"
                    value={formData.address.street}
                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">City</label>
                    <Input
                      placeholder="Mumbai"
                      value={formData.address.city}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">State</label>
                    <Input
                      placeholder="Maharashtra"
                      value={formData.address.state}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">ZIP Code</label>
                    <Input
                      placeholder="400001"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Country</label>
                    <Input
                      placeholder="India"
                      value={formData.address.country}
                      onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold">Account Credentials</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input
                    type="email"
                    placeholder="ca@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Password *</label>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCA}>Create CA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit CA Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit CA</DialogTitle>
            <DialogDescription>Update CA information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <Input
                placeholder="CA Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="ca@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCA}>Update CA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete CA</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedCA?.name}</strong>? 
              This CA must not be assigned to any companies.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCA}>
              Delete CA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Companies Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Companies to {selectedCA?.name}</DialogTitle>
            <DialogDescription>
              Select companies to assign to this CA
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {companies.map((company) => (
              <div
                key={company._id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => toggleCompanySelection(company._id)}
              >
                <div className="flex items-center gap-2">
                  {selectedCompanies.includes(company._id) ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-muted-foreground">{company.industry}</p>
                  </div>
                </div>
                <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                  {company.status}
                </Badge>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignCompanies}>
              Assign {selectedCompanies.length} Companies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
