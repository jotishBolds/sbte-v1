"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { FaEdit, FaTrash, FaPlus, FaEllipsisV } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import SBTEUserForm from "./user-creation-form";
import { SBTEUser, UserRole } from "@/types/types";

const SBTEUserList: React.FC = () => {
  const [users, setUsers] = useState<SBTEUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<SBTEUser | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size for responsive design
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/SBTEUserManagement");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/SBTEUserManagement/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast({
        title: "Success",
        description: "User deleted successfully",
      });

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEditClick = async (userId: string) => {
    try {
      const response = await fetch(`/api/SBTEUserManagement/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user details");

      const userData = await response.json();
      setSelectedUser(userData);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Mobile Table Row with Dropdown Actions
  const MobileUserRow = ({ user }: { user: SBTEUser }) => (
    <div className="flex justify-between items-center p-4 border-b ">
      <div>
        <div className="font-semibold">{user.username}</div>
        <div className="text-sm ">{user.email}</div>
        <div className="text-sm ">{user.role.replace("_", " ")}</div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <FaEllipsisV />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => handleEditClick(user.id)}>
            <FaEdit className="mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={() => {
              setSelectedUser(user);
              setIsDeleteDialogOpen(true);
            }}
          >
            <FaTrash className="mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 sm:mb-0">
          SBTE User Management
        </h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
        >
          <FaPlus /> Create New User
        </Button>
      </div>

      {/* Responsive View */}
      {isMobile ? (
        <div className=" rounded-lg shadow">
          {users.map((user) => (
            <MobileUserRow key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role.replace("_", " ")}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(user.id)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(user);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create User Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Create New SBTE User</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <SBTEUserForm
                onSuccess={() => {
                  setIsCreateDialogOpen(false);
                  fetchUsers();
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New SBTE User</DialogTitle>
            </DialogHeader>
            <SBTEUserForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                fetchUsers();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edit SBTE User</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <SBTEUserForm
                initialData={selectedUser}
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  fetchUsers();
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit SBTE User</DialogTitle>
            </DialogHeader>
            <SBTEUserForm
              initialData={selectedUser}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                fetchUsers();
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Are you sure you want to delete this user?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              user and remove their data from our servers.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => selectedUser && handleDelete(selectedUser.id)}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SBTEUserList;
