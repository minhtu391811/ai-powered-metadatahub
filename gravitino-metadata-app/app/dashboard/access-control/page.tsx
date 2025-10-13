"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction, } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreVertical, Users, Shield, Key, Component, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getGravitinoClient, User, Role, SecurableObject, Group, Privilege } from "@/lib/gravitino-client"
import { set } from "date-fns"

export default function AccessControlPage() {
  const gravitino = getGravitinoClient()
  const [isAddUserOpen, setAddUserOpen] = useState(false)
  const [isAddRoleOpen, setAddRoleOpen] = useState(false)
  const [isAddGroupOpen, setAddGroupOpen] = useState(false)
  const [isChangeUserRoleOpen, setChangeUserRoleOpen] = useState(false)
  const [isChangeGroupRoleOpen, setChangeGroupRoleOpen] = useState(false)
  const [isDeleteUserOpen, setDeleteUserOpen] = useState(false)
  const [isDeleteGroupOpen, setDeleteGroupOpen] = useState(false)
  const [isDeleteRoleOpen, setDeleteRoleOpen] = useState(false)
  const [isGrantPermissionOpen, setGrantPermissionOpen] = useState(false)

  // State for users, roles, permissions
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<SecurableObject[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [owners, setOwners] = useState<Record<string, User | Group | undefined>>({})

  // Form state for adding user/role
  const [newUser, setNewUser] = useState<{ name: string; roles: string[] }>({ name: "", roles: [] })
  const [newRole, setNewRole] = useState<{ name: string; description: string; resource: string; resourceType: string; privileges: Privilege[] }>({
    name: "",
    description: "",
    resource: "",
    resourceType: "METALAKE",
    privileges: [
      {
        name: "CREATE_CATALOG",
        condition: "ALLOW"
      }
    ]
  })
  const [newGroup, setNewGroup] = useState<{ name: string }>({ name: "" })

  // Form state for change role
  const [revokeRoles, setRevokeRoles] = useState<string[]>([]);
  const [grantRoles, setGrantRoles] = useState<string[]>([]);

  // Form state for manage permissions
  const [grantPrivileges, setGrantPrivileges] = useState<Privilege[]>([]);
  const [revokePrivileges, setRevokePrivileges] = useState<Privilege[]>([]);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermissionObject, setSelectedPermissionObject] = useState<SecurableObject | null>(null);

  // Form state for dialogs
  const [selectedUser, setSelectedUser] = useState<{ name: string; roles: string[] }>({ name: "", roles: [] })
  const [selectedGroup, setSelectedGroup] = useState<{ name: string; roles?: string[] }>({ name: "", roles: [] })
  const [selectedRole, setSelectedRole] = useState<{ name: string; description: string; resource: string; resourceType: string; privileges: Privilege[] }>({
    name: "",
    description: "",
    resource: "",
    resourceType: "METALAKE",
    privileges: [
      {
        name: "CREATE_CATALOG",
        condition: "ALLOW"
      }
    ]
  })
  const [selectedType, setSelectedType] = useState<string>("")
  const [selectedName, setSelectedName] = useState<string>("")
  const [objectType, setObjectType] = useState<string>("")
  const [objectName, setObjectName] = useState<string>("")
  const [ownerResult, setOwnerResult] = useState<User | Group | null>(null)
  const [newOwnerName, setNewOwnerName] = useState<string>("")
  const [newOwnerType, setNewOwnerType] = useState<string>("")
  const [ownerSetResult, setOwnerSetResult] = useState<boolean>(false)

  // Form state for grant permission
  const [grantPermissionForm, setGrantPermissionForm] = useState<{
    roleName: string;
    objectType: string;
    objectName: string;
    privileges: Privilege[];
  }>({
    roleName: "",
    objectType: "METALAKE",
    objectName: "",
    privileges: [{ name: "CREATE_CATALOG", condition: "ALLOW" }]
  })

  const [userSearch, setUserSearch] = useState<string>("")

  // Handle Enter key for forms
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      action()
    }
  }
  const [groupSearch, setGroupSearch] = useState<string>("")
  const [roleSearch, setRoleSearch] = useState<string>("")
  const [permissionSearch, setPermissionSearch] = useState<string>("")

  const filteredOptions = newOwnerType === "USER" ? users : groups
  const filteredUsers = users.filter(user => {
    const term = userSearch.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      (user.roles || []).some(role => role.toLowerCase().includes(term))
    );
  });

  const filteredGroups = groups.filter(group => {
    const term = groupSearch.toLowerCase();
    return (
      group.name.toLowerCase().includes(term) ||
      (group.roles || []).some(role => role.toLowerCase().includes(term))
    );
  });

  const filteredRoles = roles.filter(role => {
    const term = roleSearch.toLowerCase();
    return (
      role.name.toLowerCase().includes(term) ||
      (role.properties?.description || "").toLowerCase().includes(term) ||
      (role.securableObjects || []).some(so => so.fullName.toLowerCase().includes(term) || (so.privileges || []).some(priv => priv.name.toLowerCase().includes(term)))
    );
  });

  const filteredPermissions = permissions.filter(perm => {
    const term = permissionSearch.toLowerCase();
    return (
      perm.fullName.toLowerCase().includes(term) ||
      perm.type.toLowerCase().includes(term) ||
      (perm.privileges || []).some(priv => priv.name.toLowerCase().includes(term))
    );
  });

  async function handleGetOwner() {
    if (!selectedType || !selectedName) return
    try {
      const owner = await gravitino.getOwner(selectedType, selectedName)
      setOwnerResult(owner)
    } catch {
      setOwnerResult(null)
    }
  }

  async function handleSetOwner() {
    if (!objectType || !setObjectName || !newOwnerName) return
    let ownerObj: User | Group | undefined = users.find(u => u.name === newOwnerName) || groups.find(g => g.name === newOwnerName)
    if (!ownerObj) return
    try {
      const ok = await gravitino.setOwner(objectType, objectName, newOwnerName, newOwnerType)
      setOwnerSetResult(ok)
      setObjectType("")
      setObjectName("")
      setNewOwnerType("")
      setNewOwnerName("")
    } catch {
      setOwnerSetResult(false)
    }
  }

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      const names = await gravitino.listUsers(true)
      const userObjs = await Promise.all(names?.map(name => gravitino.getUser(name)) || []);
      setUsers(userObjs)
    }
    fetchUsers()
  }, [])

  // Fetch roles
  useEffect(() => {
    async function fetchRoles() {
      const names = await gravitino.listRoles()
      const roleObjs = await Promise.all(names.map(name => gravitino.getRole(name)))
      setRoles(roleObjs)
    }
    fetchRoles()
  }, [])

  // Fetch permissions (securable objects from all roles)
  useEffect(() => {
    async function fetchPermissions() {
      let perms: SecurableObject[] = []
      for (const role of roles) {
        perms = perms.concat(role.securableObjects || [])
      }
      setPermissions(perms)
    }
    fetchPermissions()
  }, [roles])

  // Fetch groups
  useEffect(() => {
    async function fetchGroups() {
      const names = await gravitino.listGroups()
      const groupObjs = await Promise.all(names.map(name => gravitino.getGroup(name)))
      setGroups(groupObjs)
    }
    fetchGroups()
  }, [])

  // Fetch owners for permissions
  useEffect(() => {
    async function fetchOwners() {
      const ownerMap: Record<string, User | Group | undefined> = {}
      await Promise.all(
        permissions.map(async (perm) => {
          try {
            const owner = await gravitino.getOwner(perm.type, perm.fullName)
            ownerMap[perm.fullName] = owner
          } catch {
            ownerMap[perm.fullName] = undefined
          }
        })
      )
      setOwners(ownerMap)
    }
    if (permissions.length > 0) fetchOwners()
  }, [permissions])

  // Add user handler
  async function handleCreateUser() {
    if (!newUser.name) return
    await gravitino.addUser(newUser.name)
    if (newUser.roles) {
      await gravitino.grantRoleToUser(newUser.name, newUser.roles)
    }
    setAddUserOpen(false)
    setNewUser({ name: "", roles: [] })
    // Refresh users
    const names = await gravitino.listUsers(true)
    const userObjs = await Promise.all(names?.map(name => gravitino.getUser(name)) || []);
    setUsers(userObjs)
  }

  // Change role handler
  async function handleChangeUserRole(userName: string, grantRoles: string[], revokeRoles: string[]) {
    if (!userName) return;
    try {
      if (grantRoles.length > 0) {
        await gravitino.grantRoleToUser(userName, grantRoles)
      }
      if (revokeRoles.length > 0) {
        await gravitino.revokeRoleFromUser(userName, revokeRoles)
      }
      setSelectedUser({ name: "", roles: [] });
      setChangeUserRoleOpen(false);
      setGrantRoles([]);
      setRevokeRoles([]);
      // Refresh users
      const names = await gravitino.listUsers(true);
      const userObjs = await Promise.all(names?.map(name => gravitino.getUser(name)) || []);
      setUsers(userObjs);
    } catch (err) {
      console.error("Failed to update user roles:", err);
    }
  }

  // Delete user handler
  async function handleDeleteUser(userName: string) {
    if (!userName) return;
    try {
      await gravitino.deleteUser(userName);
      console.log(`User "${userName}" has been deleted.`);
      setSelectedUser({ name: "", roles: [] });
      setDeleteUserOpen(false);
      setUsers(prev => prev.filter(u => u.name !== userName));
    } catch (err) {
      console.error(`Failed to delete user "${userName}":`, err);
    }
  }

  // Add group handler
  async function handleCreateGroup() {
    if (!newGroup.name) return
    await gravitino.addGroup(newGroup.name)
    setAddGroupOpen(false)
    setNewGroup({ name: "" })
    // Refresh groups
    const names = await gravitino.listGroups()
    const groupObjs = await Promise.all(names.map(name => gravitino.getGroup(name)))
    setGroups(groupObjs)
  }

  // Change group role handler
  async function handleChangeGroupRole(groupName: string, grantRoles: string[], revokeRoles: string[]) {
    if (!groupName) return;
    try {
      if (grantRoles.length > 0) {
        await gravitino.grantRoleToGroup(groupName, grantRoles)
      }
      if (revokeRoles.length > 0) {
        await gravitino.revokeRoleFromGroup(groupName, revokeRoles)
      }
      setSelectedGroup({ name: "", roles: [] });
      setChangeGroupRoleOpen(false);
      setGrantRoles([]);
      setRevokeRoles([]);
      // Refresh groups
      const names = await gravitino.listGroups()
      const groupObjs = await Promise.all(names.map(name => gravitino.getGroup(name)))
      setGroups(groupObjs)
    } catch (err) {
      console.error("Failed to update group roles:", err);
    }
  }

  // Delete group handler
  async function handleDeleteGroup(groupName: string) {
    if (!groupName) return;
    try {
      await gravitino.deleteGroup(groupName);
      console.log(`Group "${groupName}" has been deleted.`);
      setSelectedGroup({ name: "", roles: [] });
      setDeleteGroupOpen(false);
      setGroups(prev => prev.filter(g => g.name !== groupName));
    } catch (err) {
      console.error(`Failed to delete group "${groupName}":`, err);
    }
  }

  // Add role handler
  async function handleCreateRole() {
    if (!newRole.name) return
    const allowedPrivileges = ["CREATE_CATALOG", "USE_CATALOG", "CREATE_SCHEMA", "USE_SCHEMA", "CREATE_TABLE" , "MODIFY_TABLE" , "SELECT_TABLE" , "CREATE_FILESET" , "WRITE_FILESET" , "READ_FILESET" , "CREATE_TOPIC" , "PRODUCE_TOPIC" , "CONSUME_TOPIC" , "MANAGE_USERS" , "MANAGE_GROUPS" , "CREATE_ROLE" , "MANAGE_GRANTS"] as const;
    const roleData = {
      name: newRole.name,
      properties: { description: newRole.description },
      securableObjects: [
        {
          fullName: newRole.resource,
          type: newRole.resourceType as SecurableObject["type"],
          privileges: newRole.privileges.filter(priv => allowedPrivileges.includes(priv.name as any))
        }
      ]
    }
    await gravitino.createRole(roleData)
    setAddRoleOpen(false)
    setNewRole(
      {
        name: "",
        description: "", 
        resource: "", 
        resourceType: "CATALOG", 
        privileges: [
          {
            name: "CREATE_CATALOG",
            condition: "ALLOW"
          }
        ]
      }
    )
    // Refresh roles
    const names = await gravitino.listRoles()
    const roleObjs = await Promise.all(names.map(name => gravitino.getRole(name)))
    setRoles(roleObjs)
  }

  async function managerPermissionHandler(roleName: string, object: SecurableObject, grantPrivileges: Privilege[], revokePrivileges: Privilege[]) {
    if (!roleName || !object) return;
    try {
      // Lấy role hiện tại
      const currentRole = await gravitino.getRole(roleName);
      const currentPrivileges = currentRole.securableObjects
        ?.find(obj => obj.fullName === object.fullName)
        ?.privileges || [];

      // Xác định quyền cần revoke / grant
      const privilegesToRevoke = currentPrivileges.filter(p =>
        revokePrivileges.some(rp => rp.name === p.name)
      );

      const privilegesToGrant = grantPrivileges.filter(
        gp => !currentPrivileges.some(cp => cp.name === gp.name)
      );

      // Gọi API song song (chỉ nếu có quyền cần thay đổi)
      await Promise.all([
        privilegesToRevoke.length
          ? gravitino.revokePrivilegeToRole(roleName, object, privilegesToRevoke)
          : null,
        privilegesToGrant.length
          ? gravitino.grantPrivilegeToRole(roleName, object, privilegesToGrant)
          : null
      ]);

      console.log(
        `Updated privileges for role "${roleName}". Granted: [${privilegesToGrant.map(p => p.name).join(', ')}], Revoked: [${privilegesToRevoke.map(p => p.name).join(', ')}]`
      );
      setSelectedRole({
        name: "",
        description: "",
        resource: "",
        resourceType: "METALAKE",
        privileges: [
          {
            name: "CREATE_CATALOG",
            condition: "ALLOW"
          }
        ]
      });
      setGrantPrivileges([]);
      setRevokePrivileges([]);
      setShowPermissionModal(false);
      setSelectedPermissionObject(null);
      // Refresh roles
      const roles = await gravitino.listRoles();
      const roleObjs = await Promise.all(roles.map(r => gravitino.getRole(r)));
      setRoles(roleObjs);

    } catch (err) {
      console.error("Failed to manage permissions:", err);
    }
  }

  // Delete role handler
  async function handleDeleteRole(roleName: string) {
    if (!roleName) return;
    try {
      await gravitino.deleteRole(roleName);
      console.log(`Role "${roleName}" has been deleted.`);
      setSelectedRole({
        name: "",
        description: "",
        resource: "",
        resourceType: "METALAKE",
        privileges: [
          {
            name: "CREATE_CATALOG",
            condition: "ALLOW"
          }
        ]
      });
      setDeleteRoleOpen(false);
      setRoles(prev => prev.filter(r => r.name !== roleName));
    } catch (err) {
      console.error(`Failed to delete role "${roleName}":`, err);
    }
  }

  // Helper function to get valid privileges for object type
  function getValidPrivilegesForObjectType(objectType: string): string[] {
    switch (objectType) {
      case "METALAKE":
        return ["CREATE_CATALOG", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "CATALOG":
        return ["USE_CATALOG", "CREATE_SCHEMA", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "SCHEMA":
        return ["USE_SCHEMA", "CREATE_TABLE", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "TABLE":
        return ["MODIFY_TABLE", "SELECT_TABLE", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "COLUMN":
        return ["SELECT_TABLE", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "FILESET":
        return ["CREATE_FILESET", "WRITE_FILESET", "READ_FILESET", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "TOPIC":
        return ["CREATE_TOPIC", "PRODUCE_TOPIC", "CONSUME_TOPIC", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "MODEL":
        return ["MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "USER":
        return ["MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "GROUP":
        return ["MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      case "ROLE":
        return ["MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
      default:
        return ["MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"];
    }
  }

  // Grant permission handler
  async function handleGrantPermission() {
    if (!grantPermissionForm.roleName || !grantPermissionForm.objectName || grantPermissionForm.privileges.length === 0) return;
    
    try {
      // Filter privileges to only include valid ones for the object type
      const validPrivileges = getValidPrivilegesForObjectType(grantPermissionForm.objectType);
      const filteredPrivileges = grantPermissionForm.privileges.filter(priv => 
        validPrivileges.includes(priv.name)
      );
      
      if (filteredPrivileges.length === 0) {
        console.error(`No valid privileges for object type ${grantPermissionForm.objectType}`);
        return;
      }
      
      const securableObject: SecurableObject = {
        fullName: grantPermissionForm.objectName,
        type: grantPermissionForm.objectType as SecurableObject["type"],
        privileges: filteredPrivileges
      };
      
      await gravitino.grantPrivilegeToRole(grantPermissionForm.roleName, securableObject, filteredPrivileges);
      console.log(`Granted permissions to role "${grantPermissionForm.roleName}" for ${grantPermissionForm.objectType} "${grantPermissionForm.objectName}"`);
      
      setGrantPermissionOpen(false);
      setGrantPermissionForm({
        roleName: "",
        objectType: "METALAKE",
        objectName: "",
        privileges: [{ name: "CREATE_CATALOG", condition: "ALLOW" }]
      });
      
      // Refresh roles
      const names = await gravitino.listRoles();
      const roleObjs = await Promise.all(names.map(name => gravitino.getRole(name)));
      setRoles(roleObjs);
    } catch (err) {
      console.error("Failed to grant permission:", err);
    }
  }

  // Revoke permission handler
  async function handleRevokePermission(permission: SecurableObject) {
    if (!permission) return;
    
    try {
      // Find the role that has this permission
      const roleWithPermission = roles.find(role => 
        role.securableObjects?.some(obj => obj.fullName === permission.fullName)
      );
      
      if (!roleWithPermission) {
        console.error("No role found with this permission");
        return;
      }
      
      await gravitino.revokePrivilegeToRole(roleWithPermission.name, permission, permission.privileges);
      console.log(`Revoked permissions from role "${roleWithPermission.name}"`);
      
      // Refresh roles
      const names = await gravitino.listRoles();
      const roleObjs = await Promise.all(names.map(name => gravitino.getRole(name)));
      setRoles(roleObjs);
    } catch (err) {
      console.error("Failed to revoke permission:", err);
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Access Control</h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {users.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
                <Component className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.length}</div>
                <p className="text-xs text-muted-foreground">
                  {groups.length} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
                <p className="text-xs text-muted-foreground">Custom role definitions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Permissions</CardTitle>
                <Key className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{permissions.length}</div>
                <p className="text-xs text-muted-foreground">Active permission grants</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="roles">Roles</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="owners">Owners</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Users</CardTitle>
                      <CardDescription>Manage user accounts and their roles</CardDescription>
                    </div>
                    <Dialog open={isAddUserOpen} onOpenChange={setAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                          <DialogDescription>Create a new user account with assigned role</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe" 
                            value={newUser.name} 
                            onChange={e => setNewUser(u => ({ ...u, name: e.target.value }))}
                            onKeyDown={e => handleKeyDown(e, handleCreateUser)}
                          />
                          <Label>Assign Roles</Label>
                          {newUser.roles.map((role, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Select
                                value={role}
                                onValueChange={val =>
                                  setNewUser(u => ({
                                    ...u,
                                    roles: u.roles.map((r, i) => (i === idx ? val : r))
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map(r => (
                                    <SelectItem key={r.name} value={r.name}>
                                      {r.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setNewUser(u => ({
                                    ...u,
                                    roles: u.roles.filter((_, i) => i !== idx)
                                  }))
                                }
                              >
                                -
                              </Button>
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setNewUser(u => ({
                                ...u,
                                roles: [...u.roles, roles[0]?.name || ""]
                              }))
                            }
                          >
                            + Add Role
                          </Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAddUserOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateUser}>Create User</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users by name or role..."
                        className="pl-10"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Updated At</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.name}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>
                              {user.roles?.map(role => (
                                <Badge key={role} variant="secondary">{role}</Badge>
                              ))}
                            </TableCell>
                            <TableCell>
                              {user.audit?.createTime
                                ? new Date(user.audit.createTime).toLocaleString()
                                : "--"}
                            </TableCell>
                            <TableCell>
                              {user.audit?.lastModifiedTime
                                ? new Date(user.audit.lastModifiedTime).toLocaleString()
                                : "--"}
                            </TableCell>

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {setSelectedUser({name: user.name, roles: user.roles || [] }), setChangeUserRoleOpen(true)}}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => {setSelectedUser({name: user.name, roles: user.roles || [] }), setDeleteUserOpen(true)}}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <Dialog open={!!selectedUser.name && isChangeUserRoleOpen} onOpenChange={setChangeUserRoleOpen}>
                      {selectedUser.name && (
                        <DialogContent>
                          <DialogTitle>Change Roles for {selectedUser?.name}</DialogTitle>
                          <DialogDescription>
                            Revoke or grant roles for the user.
                          </DialogDescription>  
                          <div className="space-y-6" onKeyDown={e => handleKeyDown(e, () => handleChangeUserRole(selectedUser.name, grantRoles, revokeRoles))}>
                            {/* Revoke Roles */}
                            <div className="space-y-2">
                              <Label>Revoke Roles</Label>
                              {revokeRoles.map((role, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Select
                                    value={role}
                                    onValueChange={val =>
                                      setRevokeRoles(r => r.map((rItem, i) => (i === idx ? val : rItem)))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role to revoke" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedUser.roles?.map(role => (
                                        <SelectItem key={role} value={role}>
                                          {role}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRevokeRoles(r => r.filter((_, i) => i !== idx))}
                                  >
                                    -
                                  </Button>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRevokeRoles(r => [...r, selectedUser.roles?.[0] || ""])}
                              >
                                + Add Role to revoke
                              </Button>
                            </div>

                            {/* Grant Roles */}
                            <div className="space-y-2">
                              <Label>Grant Roles</Label>
                              {grantRoles.map((role, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Select
                                    value={role}
                                    onValueChange={val =>
                                      setGrantRoles(r => r.map((rItem, i) => (i === idx ? val : rItem)))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role to grant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles
                                        .filter(r => !selectedUser.roles?.includes(r.name))
                                        .map(r => (
                                          <SelectItem key={r.name} value={r.name}>
                                            {r.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setGrantRoles(r => r.filter((_, i) => i !== idx))}
                                  >
                                    -
                                  </Button>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setGrantRoles(r => [...r, roles.find(r => !selectedUser.roles?.includes(r.name))?.name || ""])
                                }
                              >
                                + Add Role to grant
                              </Button>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedUser({ name: "", roles: [] })}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleChangeUserRole(selectedUser.name, grantRoles, revokeRoles)}
                            >
                              Apply
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )} 
                    </Dialog>

                    <AlertDialog open={!!selectedUser.name && isDeleteUserOpen} onOpenChange={() => {}}>
                      {selectedUser.name && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user “{selectedUser.name}”?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The user will be permanently removed from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDeleteUser(selectedUser.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Users</CardTitle>
                      <CardDescription>Manage user groups and their roles</CardDescription>
                    </div>
                    <Dialog open={isAddGroupOpen} onOpenChange={setAddGroupOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Group
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Group</DialogTitle>
                          <DialogDescription>Create a new group</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label htmlFor="name">Name</Label>
                          <Input 
                            id="name" 
                            placeholder="Group Name" 
                            value={newGroup.name} 
                            onChange={e => setNewGroup(u => ({ ...u, name: e.target.value }))}
                            onKeyDown={e => handleKeyDown(e, handleCreateGroup)}
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAddGroupOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateGroup}>Create Group</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search groups by name or role..."
                        className="pl-10"
                        value={groupSearch}
                        onChange={(e) => setGroupSearch(e.target.value)}
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Roles</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Updated At</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredGroups.map((group) => (
                          <TableRow key={group.name}>
                            <TableCell className="font-medium">{group.name}</TableCell>
                            <TableCell>
                              {group.roles?.map(role => (
                                <Badge key={role} variant="secondary">{role}</Badge>
                              ))}
                            </TableCell>
                            <TableCell>
                              {group.audit?.createTime
                                ? new Date(group.audit.createTime).toLocaleString()
                                : "--"}
                            </TableCell>
                            <TableCell>
                              {group.audit?.lastModifiedTime
                                ? new Date(group.audit.lastModifiedTime).toLocaleString()
                                : "--"}
                            </TableCell>

                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => {setSelectedGroup({name: group.name, roles: group.roles || [] }), setChangeGroupRoleOpen(true)}}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Change Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive" onClick={() => {setSelectedGroup({name: group.name, roles: group.roles || [] }), setDeleteGroupOpen(true)}}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Group
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Dialog open={!!selectedGroup.name && isChangeGroupRoleOpen} onOpenChange={setChangeGroupRoleOpen}>
                      {selectedGroup.name && (
                        <DialogContent>
                          <DialogTitle>Change Roles for {selectedGroup?.name}</DialogTitle>
                          <DialogDescription>
                            Revoke or grant roles for the group.
                          </DialogDescription>  
                          <div className="space-y-6" onKeyDown={e => handleKeyDown(e, () => handleChangeGroupRole(selectedGroup.name, grantRoles, revokeRoles))}>
                            {/* Revoke Roles */}
                            <div className="space-y-2">
                              <Label>Revoke Roles</Label>
                              {revokeRoles.map((role, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Select
                                    value={role}
                                    onValueChange={val =>
                                      setRevokeRoles(r => r.map((rItem, i) => (i === idx ? val : rItem)))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role to revoke" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {selectedGroup.roles?.map(role => (
                                        <SelectItem key={role} value={role}>
                                          {role}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setRevokeRoles(r => r.filter((_, i) => i !== idx))}
                                  >
                                    -
                                  </Button>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setRevokeRoles(r => [...r, selectedGroup.roles?.[0] || ""])}
                              >
                                + Add Role to revoke
                              </Button>
                            </div>

                            {/* Grant Roles */}
                            <div className="space-y-2">
                              <Label>Grant Roles</Label>
                              {grantRoles.map((role, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                  <Select
                                    value={role}
                                    onValueChange={val =>
                                      setGrantRoles(r => r.map((rItem, i) => (i === idx ? val : rItem)))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role to grant" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles
                                        .filter(r => !selectedGroup.roles?.includes(r.name))
                                        .map(r => (
                                          <SelectItem key={r.name} value={r.name}>
                                            {r.name}
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setGrantRoles(r => r.filter((_, i) => i !== idx))}
                                  >
                                    -
                                  </Button>
                                </div>
                              ))}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setGrantRoles(r => [...r, roles.find(r => !selectedGroup.roles?.includes(r.name))?.name || ""])
                                }
                              >
                                + Add Role to grant
                              </Button>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedGroup({ name: "", roles: [] })}>
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleChangeGroupRole(selectedGroup.name, grantRoles, revokeRoles)}
                            >
                              Apply
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )} 
                    </Dialog>

                    <AlertDialog open={!!selectedGroup.name && isDeleteGroupOpen} onOpenChange={() => {}}>
                      {selectedGroup.name && (
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete user “{selectedGroup.name}”?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The group will be permanently removed from the system.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleDeleteGroup(selectedGroup.name)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      )}
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Roles</CardTitle>
                      <CardDescription>Define roles and their permissions</CardDescription>
                    </div>
                    <Dialog open={isAddRoleOpen} onOpenChange={setAddRoleOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Add Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Role</DialogTitle>
                          <DialogDescription>Define a new role and its permissions</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label>Role Name</Label>
                          <Input
                            placeholder="Role name"
                            value={newRole.name}
                            onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
                            onKeyDown={e => handleKeyDown(e, handleCreateRole)}
                          />
                          <Label>Description</Label>
                          <Input
                            placeholder="Description"
                            value={newRole.description}
                            onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))}
                            onKeyDown={e => handleKeyDown(e, handleCreateRole)}
                          />
                          <Label>Resource</Label>
                          <Input
                            placeholder="Object Name (e.g. catalog.schema.table)"
                            value={newRole.resource}
                            onChange={e => setNewRole(r => ({ ...r, resource: e.target.value }))}
                            onKeyDown={e => handleKeyDown(e, handleCreateRole)}
                          />
                          <Label>Object Type</Label>
                          <Select
                            value={newRole.resourceType}
                            onValueChange={val => setNewRole(r => ({ ...r, resourceType: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Resource Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {["METALAKE", "CATALOG", "SCHEMA", "TABLE", "COLUMN", "FILESET", "TOPIC", "MODEL", "USER", "GROUP", "ROLE"].map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Label>Privileges</Label>
                          {newRole.privileges.map((priv, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Select
                                value={priv.name}
                                onValueChange={val =>
                                  setNewRole(r => ({
                                    ...r,
                                    privileges: r.privileges.map((p, i) => i === idx ? { ...p, name: val as Privilege["name"] } : p)
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Privilege" />
                                </SelectTrigger>
                                <SelectContent>
                                  {["CREATE_CATALOG", "USE_CATALOG", "CREATE_SCHEMA", "USE_SCHEMA", "CREATE_TABLE" , "MODIFY_TABLE" , "SELECT_TABLE" , "CREATE_FILESET" , "WRITE_FILESET" , "READ_FILESET" , "CREATE_TOPIC" , "PRODUCE_TOPIC" , "CONSUME_TOPIC" , "MANAGE_USERS" , "MANAGE_GROUPS" , "CREATE_ROLE" , "MANAGE_GRANTS"].map(privilege => (
                                    <SelectItem key={privilege} value={privilege}>{privilege}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={priv.condition}
                                onValueChange={val =>
                                  setNewRole(r => ({
                                    ...r,
                                    privileges: r.privileges.map((p, i) => i === idx ? { ...p, condition: val as "ALLOW" | "DENY" } : p)
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ALLOW">ALLOW</SelectItem>
                                  <SelectItem value="DENY">DENY</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setNewRole(r => ({
                                    ...r,
                                    privileges: r.privileges.filter((_, i) => i !== idx)
                                  }))
                                }
                              >-</Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setNewRole(r => ({
                                ...r,
                                privileges: [...r.privileges, { name: "CREATE_CATALOG", condition: "ALLOW" }]
                              }))
                            }
                          >+ Add Privilege</Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setAddRoleOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCreateRole}>Create Role</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search roles by name or role..."
                        className="pl-10"
                        value={roleSearch}
                        onChange={(e) => setRoleSearch(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {filteredRoles.map((role) => (
                        <Card key={role.name} className="hover:border-primary/50 transition-colors">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Shield className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{role.name}</CardTitle>
                                  <CardDescription className="text-xs">{role.properties?.description}</CardDescription>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={() => {
                                      setSelectedRole({
                                        name: role.name,
                                        description: role.properties?.description || "",
                                        resource: role.securableObjects?.[0]?.fullName || "",
                                        resourceType: role.securableObjects?.[0]?.type || "METALAKE",
                                        privileges: role.securableObjects?.[0]?.privileges || []
                                      });
                                      setSelectedPermissionObject(role.securableObjects?.[0] || null);
                                      setGrantPrivileges([]);
                                      setRevokePrivileges([]);
                                      setShowPermissionModal(true);
                                    }}
                                  >
                                    <Key className="h-4 w-4 mr-2" />
                                    Manage Permissions
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedRole({
                                        name: role.name,
                                        description: role.properties?.description || "",
                                        resource: role.securableObjects?.[0]?.fullName || "",
                                        resourceType: role.securableObjects?.[0]?.type || "METALAKE",
                                        privileges: role.securableObjects?.[0]?.privileges || []
                                      });
                                      setDeleteRoleOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Role
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">{role.properties?.description}</p>
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Permissions:</p>
                              <div className="flex flex-wrap gap-1">
                                {role.securableObjects?.map(obj =>
                                  obj.privileges.map(perm => (
                                    <Badge key={obj.fullName + perm.name} variant="secondary" className="text-xs">
                                      {perm.name}
                                    </Badge>
                                  ))
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Manage Permission Dialog */}
            <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Manage Permissions for {selectedRole.name}</DialogTitle>
                  <DialogDescription>
                    Grant or revoke privileges for the selected role and object.
                  </DialogDescription>
                </DialogHeader>
                
                {selectedPermissionObject && (
                  <div className="space-y-6" onKeyDown={e => handleKeyDown(e, () => {
                    if (selectedRole.name && selectedPermissionObject) {
                      managerPermissionHandler(selectedRole.name, selectedPermissionObject, grantPrivileges, revokePrivileges);
                    }
                  })}>
                    {/* Object Information */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Object Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Name:</span> {selectedPermissionObject.fullName}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {selectedPermissionObject.type.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Current Privileges */}
                    <div className="space-y-2">
                      <Label>Current Privileges</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPermissionObject.privileges?.map((priv, idx) => (
                          <Badge key={idx} variant="secondary">
                            {priv.name} ({priv.condition})
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Grant Privileges */}
                    <div className="space-y-2">
                      <Label>Grant Privileges</Label>
                      {grantPrivileges.map((priv, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Select
                            value={priv.name}
                            onValueChange={val =>
                              setGrantPrivileges(prev => prev.map((p, i) => 
                                i === idx ? { ...p, name: val as Privilege["name"] } : p
                              ))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select privilege" />
                            </SelectTrigger>
                            <SelectContent>
                              {["CREATE_CATALOG", "USE_CATALOG", "CREATE_SCHEMA", "USE_SCHEMA", "CREATE_TABLE", "MODIFY_TABLE", "SELECT_TABLE", "CREATE_FILESET", "WRITE_FILESET", "READ_FILESET", "CREATE_TOPIC", "PRODUCE_TOPIC", "CONSUME_TOPIC", "MANAGE_USERS", "MANAGE_GROUPS", "CREATE_ROLE", "MANAGE_GRANTS"].map(privilege => (
                                <SelectItem key={privilege} value={privilege}>
                                  {privilege}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={priv.condition}
                            onValueChange={val =>
                              setGrantPrivileges(prev => prev.map((p, i) => 
                                i === idx ? { ...p, condition: val as "ALLOW" | "DENY" } : p
                              ))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALLOW">ALLOW</SelectItem>
                              <SelectItem value="DENY">DENY</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setGrantPrivileges(prev => prev.filter((_, i) => i !== idx))
                            }
                          >
                            -
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setGrantPrivileges(prev => [...prev, { name: "CREATE_CATALOG", condition: "ALLOW" }])
                        }
                      >
                        + Add Privilege to Grant
                      </Button>
                    </div>

                    {/* Revoke Privileges */}
                    <div className="space-y-2">
                      <Label>Revoke Privileges</Label>
                      {revokePrivileges.map((priv, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Select
                            value={priv.name}
                            onValueChange={val =>
                              setRevokePrivileges(prev => prev.map((p, i) => 
                                i === idx ? { ...p, name: val as Privilege["name"] } : p
                              ))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select privilege" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedPermissionObject.privileges?.map(privilege => (
                                <SelectItem key={privilege.name} value={privilege.name}>
                                  {privilege.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setRevokePrivileges(prev => prev.filter((_, i) => i !== idx))
                            }
                          >
                            -
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const firstCurrentPriv = selectedPermissionObject.privileges?.[0];
                          if (firstCurrentPriv) {
                            setRevokePrivileges(prev => [...prev, { name: firstCurrentPriv.name, condition: "ALLOW" }]);
                          }
                        }}
                      >
                        + Add Privilege to Revoke
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPermissionModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedRole.name && selectedPermissionObject) {
                        managerPermissionHandler(selectedRole.name, selectedPermissionObject, grantPrivileges, revokePrivileges);
                      }
                    }}
                  >
                    Apply Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Role Dialog */}
            <AlertDialog open={!!selectedRole.name && isDeleteRoleOpen} onOpenChange={() => {}}>
              {selectedRole.name && (
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete role "{selectedRole.name}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The role will be permanently removed from the system.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDeleteRole(selectedRole.name)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              )}
            </AlertDialog>

            {/* Permissions Tab */}
            <TabsContent value="permissions" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Permissions</CardTitle>
                      <CardDescription>Resource-level access control</CardDescription>
                    </div>
                    <Dialog open={isGrantPermissionOpen} onOpenChange={setGrantPermissionOpen}>
                      <DialogTrigger asChild>
                        <Button className="gap-2">
                          <Plus className="h-4 w-4" />
                          Grant Permission
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Grant Permission</DialogTitle>
                          <DialogDescription>Grant permissions to a role for a specific object</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <Label>Role</Label>
                          <Select
                            value={grantPermissionForm.roleName}
                            onValueChange={val => setGrantPermissionForm(f => ({ ...f, roleName: val }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map(role => (
                                <SelectItem key={role.name} value={role.name}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Label>Object Type</Label>
                          <Select
                            value={grantPermissionForm.objectType}
                            onValueChange={val => {
                              const validPrivileges = getValidPrivilegesForObjectType(val);
                              setGrantPermissionForm(f => ({ 
                                ...f, 
                                objectType: val,
                                privileges: validPrivileges.length > 0 ? [{ name: validPrivileges[0] as Privilege["name"], condition: "ALLOW" }] : []
                              }));
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select object type" />
                            </SelectTrigger>
                            <SelectContent>
                              {["METALAKE", "CATALOG", "SCHEMA", "TABLE", "COLUMN", "FILESET", "TOPIC", "MODEL", "USER", "GROUP", "ROLE"].map(type => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Label>Object Name</Label>
                          <Input
                            placeholder="Object full name (e.g. catalog.schema.table)"
                            value={grantPermissionForm.objectName}
                            onChange={e => setGrantPermissionForm(f => ({ ...f, objectName: e.target.value }))}
                            onKeyDown={e => handleKeyDown(e, handleGrantPermission)}
                          />
                          
                          <Label>Privileges</Label>
                          {grantPermissionForm.privileges.map((priv, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Select
                                value={priv.name}
                                onValueChange={val =>
                                  setGrantPermissionForm(f => ({
                                    ...f,
                                    privileges: f.privileges.map((p, i) => i === idx ? { ...p, name: val as Privilege["name"] } : p)
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Privilege" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getValidPrivilegesForObjectType(grantPermissionForm.objectType).map(privilege => (
                                    <SelectItem key={privilege} value={privilege}>{privilege}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Select
                                value={priv.condition}
                                onValueChange={val =>
                                  setGrantPermissionForm(f => ({
                                    ...f,
                                    privileges: f.privileges.map((p, i) => i === idx ? { ...p, condition: val as "ALLOW" | "DENY" } : p)
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="ALLOW">ALLOW</SelectItem>
                                  <SelectItem value="DENY">DENY</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setGrantPermissionForm(f => ({
                                    ...f,
                                    privileges: f.privileges.filter((_, i) => i !== idx)
                                  }))
                                }
                              >-</Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const validPrivileges = getValidPrivilegesForObjectType(grantPermissionForm.objectType);
                              const firstValidPrivilege = validPrivileges[0];
                              if (firstValidPrivilege) {
                                setGrantPermissionForm(f => ({
                                  ...f,
                                  privileges: [...f.privileges, { name: firstValidPrivilege as Privilege["name"], condition: "ALLOW" }]
                                }));
                              }
                            }}
                          >+ Add Privilege</Button>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setGrantPermissionOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleGrantPermission}>Grant Permission</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search permissions by name or role..."
                        className="pl-10"
                        value={permissionSearch}
                        onChange={(e) => setPermissionSearch(e.target.value)}
                      />
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Resource</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Actions</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPermissions.map((permission, idx) => (
                          <TableRow key={permission.fullName + idx}>
                            <TableCell className="font-medium">{permission.fullName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{permission.type.toUpperCase()}</Badge>
                            </TableCell>
                            <TableCell>
                              {roles.filter(role => role.securableObjects?.some(obj => obj.fullName === permission.fullName)).map(role => (
                                <Badge key={role.name} variant="secondary">{role.name}</Badge>
                              ))}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {permission.privileges.map(action => (
                                  <Badge key={action.name} variant="secondary" className="text-xs">
                                    {action.name}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {owners[permission.fullName]
                                ? (owners[permission.fullName] as User).name || (owners[permission.fullName] as Group).name
                                : "--"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    className="text-destructive"
                                    onClick={() => handleRevokePermission(permission)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Revoke
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Owners Tab */}
            <TabsContent value="owners" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Owners</CardTitle>
                  <CardDescription>Get or set owner for a specific object</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {/* Form to input object type and name */}
                    <div className="flex gap-8 items-end">
                      <div className="space-y-4">
                        <Label htmlFor="objectType">Object Type</Label>
                        <Select
                          value={selectedType || ""}  
                          onValueChange={val => setSelectedType(val)}
                        >
                          <SelectTrigger id="objectType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["METALAKE", "CATALOG", "SCHEMA", "TABLE", "FILESET", "TOPIC", "MODEL"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="objectName">Object Name</Label>
                        <Input
                          id="objectName"
                          placeholder="object full name"
                          value={selectedName}
                          onChange={e => setSelectedName(e.target.value)}
                          onKeyDown={e => handleKeyDown(e, handleGetOwner)}
                        />
                      </div>
                      <Button onClick={handleGetOwner}>Get Owner</Button>
                    </div>
                    {/* Show current owner */}
                    {ownerResult && (
                      <div className="border rounded p-3 relative">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">Current Owner:</div>
                            <div>Object Name: {selectedName}</div>
                            <div>Object Type: {selectedType}</div>
                            <div>Owner Name: {ownerResult.name}</div>
                            <div>Owner Type: {"roles" in ownerResult ? "Group" : "User"}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                            onClick={() => {
                              setOwnerResult(null);
                              setSelectedName("");
                              setSelectedType("");
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Set new owner */}
                    <div className="flex gap-8 items-end">
                      <div className="space-y-4">
                        <Label htmlFor="objectType">Object Type</Label>
                        <Select
                          value={objectType || ""}  
                          onValueChange={val => setObjectType(val)}
                        >
                          <SelectTrigger id="objectType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["METALAKE", "CATALOG", "SCHEMA", "TABLE", "FILESET", "TOPIC", "MODEL"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="objectName">Object Name</Label>
                        <Input
                          id="objectName"
                          placeholder="object full name"
                          value={objectName}
                          onChange={e => setObjectName(e.target.value)}
                          onKeyDown={e => handleKeyDown(e, handleSetOwner)}
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="ownerType">Owner Type</Label>
                        <Select
                          value={newOwnerType}
                          onValueChange={val => setNewOwnerType(val as "USER" | "GROUP")}
                        >
                          <SelectTrigger id="ownerType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="GROUP">Group</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="newOwner">New Owner</Label>
                        <Select
                          value={newOwnerName}
                          onValueChange={val => setNewOwnerName(val)}
                        >
                          <SelectTrigger id="newOwner">
                            <SelectValue placeholder={`Select ${newOwnerType.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredOptions.map(item => (
                              <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button onClick={handleSetOwner}>Set Owner</Button>
                    </div>
                      {ownerSetResult && (
                        <div className="flex items-center justify-between border border-green-300 bg-green-50 text-green-700 rounded-md p-3">
                          <span className="font-medium">Owner set successfully!</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 text-green-700 hover:text-green-900 hover:bg-green-100"
                            onClick={() => setOwnerSetResult(false)}
                          >
                            ✕
                          </Button>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
