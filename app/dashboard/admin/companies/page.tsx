"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
  Building,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Users,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { companiesApi, adminApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyManagementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignCAModalOpen, setAssignCAModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    registrationNumber: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [cas, setCAs] = useState<any[]>([]);
  const [selectedCA, setSelectedCA] = useState<string>('');

  useEffect(() => {
    fetchCompanies();
  }, [pagination.page, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCompanies();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getAll({
        page: pagination.page,
        limit: 20,
        search: searchTerm,
        status: statusFilter,
      });

      if (response.success) {
        setCompanies(response.data.companies);
        setPagination({
          page: response.data.pagination?.currentPage || 1,
          totalPages: response.data.pagination?.totalPages || 1,
          total: response.data.pagination?.total || response.data.companies.length,
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchCAs = async () => {
    try {
      const response = await adminApi.getAllCAs({ page: 1, limit: 1000 });
      if (response.success) {
        setCAs(response.data.cas);
      }
    } catch (error) {
      console.error('Failed to fetch CAs');
    }
  };

  const handleCreateCompany = async () => {
    try {
      if (!formData.name) {
        toast.error('Company name is required');
        return;
      }

      const response = await companiesApi.create({
        ...formData,
        status: 'active'
      });

      if (response.success) {
        toast.success('Company created successfully');
        setCreateModalOpen(false);
        setFormData({
          name: '',
          industry: '',
          registrationNumber: '',
          address: '',
          contactEmail: '',
          contactPhone: ''
        });
        fetchCompanies();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create company');
    }
  };

  const handleUpdateCompany = async () => {
    try {
      if (!selectedCompany) return;

      const response = await companiesApi.update(selectedCompany._id, formData);

      if (response.success) {
        toast.success('Company updated successfully');
        setEditModalOpen(false);
        fetchCompanies();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update company');
    }
  };

  const handleDeleteCompany = async () => {
    try {
      if (!selectedCompany) return;

      const response = await companiesApi.delete(selectedCompany._id);
      if (response.success) {
        toast.success('Company deleted successfully');
        setDeleteModalOpen(false);
        fetchCompanies();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete company');
    }
  };

  const handleAssignCA = async () => {
    try {
      if (!selectedCompany || !selectedCA) {
        toast.error('Please select a CA');
        return;
      }

      const response = await adminApi.assignCompanies(selectedCA, [selectedCompany._id]);
      if (response.success) {
        toast.success('CA assigned successfully');
        setAssignCAModalOpen(false);
        setSelectedCA('');
        fetchCompanies();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign CA');
    }
  };

  const openEditModal = (company: any) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      industry: company.industry || '',
      registrationNumber: company.registrationNumber || '',
      address: company.address || '',
      contactEmail: company.contactEmail || '',
      contactPhone: company.contactPhone || ''
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (company: any) => {
    setSelectedCompany(company);
    setDeleteModalOpen(true);
  };

  const openAssignCAModal = (company: any) => {
    setSelectedCompany(company);
    setSelectedCA(company.assignedCA?._id || '');
    fetchCAs();
    setAssignCAModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Companies</h1>
          <p className="text-muted-foreground">Create and manage company accounts</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company Name</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Assigned CA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No companies found
                      </TableCell>
                    </TableRow>
                  ) : (
                    companies.map((company) => (
                      <TableRow key={company._id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.industry || 'N/A'}</TableCell>
                        <TableCell>
                          {company.assignedCA?.name || (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.isActive ? 'default' : 'secondary'}>
                            {company.isActive ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <XCircle className="h-3 w-3 mr-1" />
                            )}
                            {company.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(company.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/companies/${company._id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(company)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Company
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openAssignCAModal(company)}>
                                <Users className="h-4 w-4 mr-2" />
                                Assign CA
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openDeleteModal(company)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Company
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {pagination.totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
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

      {/* Create Company Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Company</DialogTitle>
            <DialogDescription>Add a new company to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology, Finance"
              />
            </div>
            <div>
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                placeholder="Company registration number"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCompany}>Create Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>Update company information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Company Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-industry">Industry</Label>
              <Input
                id="edit-industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-registrationNumber">Registration Number</Label>
              <Input
                id="edit-registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-contactEmail">Contact Email</Label>
              <Input
                id="edit-contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-contactPhone">Contact Phone</Label>
              <Input
                id="edit-contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCompany}>Update Company</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Company</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCompany?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCompany}>
              Delete Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign CA Modal */}
      <Dialog open={assignCAModalOpen} onOpenChange={setAssignCAModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign CA to Company</DialogTitle>
            <DialogDescription>
              Select a CA to assign to {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ca-select">Select CA</Label>
              <Select value={selectedCA} onValueChange={setSelectedCA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a CA" />
                </SelectTrigger>
                <SelectContent>
                  {cas.map((ca) => (
                    <SelectItem key={ca._id} value={ca._id}>
                      {ca.name} ({ca.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignCAModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignCA}>Assign CA</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
