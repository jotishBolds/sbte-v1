"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { CertificateType } from "@/types/types";
import SideBarLayout from "@/components/sidebar/layout";

export default function CertificateTypesPage() {
  const [certificateTypes, setCertificateTypes] = useState<CertificateType[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CertificateType | null>(
    null
  );
  const [newTypeName, setNewTypeName] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  // Fetch certificate types
  const fetchCertificateTypes = async () => {
    try {
      const response = await fetch("/api/certificateType");
      if (!response.ok) throw new Error("Failed to fetch certificate types");
      const data = await response.json();
      setCertificateTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch certificate types",
        variant: "destructive",
      });
      setCertificateTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Create certificate type
  const handleCreate = async () => {
    if (!newTypeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Certificate type name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/certificateType", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to create certificate type");

      toast({
        title: "Success",
        description: "Certificate type created successfully",
      });
      setIsAddDialogOpen(false);
      setNewTypeName("");
      router.refresh();
      fetchCertificateTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create certificate type",
        variant: "destructive",
      });
    }
  };

  // Update certificate type
  const handleUpdate = async () => {
    if (!selectedType) return;

    if (!newTypeName.trim()) {
      toast({
        title: "Validation Error",
        description: "Certificate type name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/certificateType/${selectedType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTypeName.trim() }),
      });

      if (!response.ok) throw new Error("Failed to update certificate type");

      toast({
        title: "Success",
        description: "Certificate type updated successfully",
      });
      setIsEditDialogOpen(false);
      setSelectedType(null);
      setNewTypeName("");
      router.refresh();
      fetchCertificateTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update certificate type",
        variant: "destructive",
      });
    }
  };

  // Delete certificate type
  const handleDelete = async () => {
    if (!selectedType) return;

    try {
      const response = await fetch(`/api/certificateType/${selectedType.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete certificate type");

      toast({
        title: "Success",
        description: "Certificate type deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedType(null);
      router.refresh();
      fetchCertificateTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete certificate type",
        variant: "destructive",
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchCertificateTypes();
  }, []);

  return (
    <SideBarLayout>
      <div className="container mx-auto p-4 space-y-6">
        <Card className="w-full">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl sm:text-2xl">
                    Certificate Types
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Manage and organize certificate types
                  </CardDescription>
                </div>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Type
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Certificate Type</DialogTitle>
                    <DialogDescription>
                      Add a new certificate type to your system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={newTypeName}
                        onChange={(e) => setNewTypeName(e.target.value)}
                        placeholder="Enter certificate type name"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={!newTypeName.trim()}
                      className="w-full sm:w-auto"
                    >
                      Create Type
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6 text-muted-foreground">
                Loading certificate types...
              </div>
            ) : certificateTypes.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No certificate types found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Name</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        College
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Certificates Count
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateTypes.map((type) => (
                      <TableRow key={type.id} className="hover:bg-accent">
                        <TableCell className="font-medium flex items-center gap-3">
                          <FileText className="w-5 h-5 text-primary/70 hidden sm:block" />
                          {type.name}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">
                            {type.college?.name || "Unassigned"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">
                            {type.certificates} Certificates
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                      setSelectedType(type);
                                      setNewTypeName(type.name);
                                      setIsEditDialogOpen(true);
                                    }}
                                  >
                                    <Edit2 className="h-4 w-4 " />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Edit Certificate Type
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={() => {
                                      setSelectedType(type);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 " />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Delete Certificate Type
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="w-[95vw] max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Certificate Type</DialogTitle>
              <DialogDescription>
                Make changes to the selected certificate type
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="Enter new certificate type name"
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!newTypeName.trim()}
                className="w-full sm:w-auto"
              >
                Update
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent className="w-[95vw] max-w-[425px]">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                certificate type and remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full sm:w-auto"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SideBarLayout>
  );
}
