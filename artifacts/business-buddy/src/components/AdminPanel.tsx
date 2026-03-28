import { useState } from "react";
import { useAuthStore, AppUser } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Shield, Plus, Trash2, Copy, Eye, EyeOff, UserCheck, UserX, KeyRound, Users, Lock, RefreshCw, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = 'users' | 'create' | 'password';

export function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [tab, setTab] = useState<Tab>('users');
  const [newUserName, setNewUserName] = useState("");
  const [newBizName, setNewBizName] = useState("");
  const [newUserPin, setNewUserPin] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);
  const [createdUser, setCreatedUser] = useState<AppUser | null>(null);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [editingPin, setEditingPin] = useState<{ id: string; val: string } | null>(null);

  const { users, currentUserId, adminLogin, adminLogout, createUser, deleteUser, toggleUserActive, changeAdminPassword, updateUserPin } = useAuthStore();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin(adminPass)) {
      setIsAuth(true);
      setAdminPass("");
      toast.success("Admin access granted");
    } else {
      toast.error("Incorrect admin password");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setIsAuth(false);
    setAdminPass("");
    setTab('users');
    setCreatedUser(null);
    adminLogout();
  };

  const handleCreateUser = () => {
    if (!newUserName.trim() || !newBizName.trim()) {
      toast.error("Name and business name are required");
      return;
    }
    if (newUserPin.trim() && newUserPin.trim().length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    const user = createUser(newUserName.trim(), newBizName.trim(), newUserPin.trim() || undefined);
    setCreatedUser(user);
    setNewUserName("");
    setNewBizName("");
    setNewUserPin("");
    toast.success(`Account ${user.id} created!`);
  };

  const handleSavePin = () => {
    if (!editingPin) return;
    if (editingPin.val.trim().length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    updateUserPin(editingPin.id, editingPin.val.trim());
    setEditingPin(null);
    toast.success("Password updated!");
  };

  const handleChangePassword = () => {
    if (newPass !== confirmPass) { toast.error("Passwords don't match"); return; }
    if (newPass.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (changeAdminPassword(oldPass, newPass)) {
      toast.success("Admin password changed!");
      setOldPass(""); setNewPass(""); setConfirmPass("");
    } else {
      toast.error("Old password is incorrect");
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied!`));
  };

  return (
    <>
      {!currentUserId && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl shadow-lg text-xs font-semibold border border-slate-600 transition-all hover:scale-105"
          title="Admin Panel"
        >
          <Shield className="h-3.5 w-3.5 text-blue-400" />
          ADMIN
        </button>
      )}

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Admin Panel
              {isAuth && (
                <span className="ml-auto text-xs font-normal text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Authenticated
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {!isAuth ? (
            <form onSubmit={handleAdminLogin} className="px-6 pb-6 pt-4 space-y-4">
              <p className="text-sm text-muted-foreground">Enter admin password to access user management.</p>
              <div>
                <Label>Admin Password</Label>
                <Input
                  type="password"
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                <Lock className="h-4 w-4 mr-2" />
                Authenticate
              </Button>
            </form>
          ) : (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex border-b px-6">
                {([['users', 'Users', Users], ['create', 'Create', Plus], ['password', 'Password', KeyRound]] as [Tab, string, any][]).map(([t, label, Icon]) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setCreatedUser(null); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 -mb-px transition-colors",
                      tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-auto p-6">
                {tab === 'users' && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground mb-3">{users.length} registered account{users.length !== 1 ? 's' : ''}</p>
                    {users.map(user => (
                      <div key={user.id} className={cn("border rounded-xl p-4 space-y-2", !user.isActive && "opacity-60 bg-muted/30")}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{user.id}</span>
                              <span className={cn("text-xs px-1.5 py-0.5 rounded-full", user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                {user.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-foreground mt-0.5">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.businessName}</p>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => toggleUserActive(user.id)}
                              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                              title={user.isActive ? "Deactivate" : "Activate"}
                            >
                              {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              onClick={() => { if (confirm(`Delete ${user.id}?`)) deleteUser(user.id); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="pt-1 border-t space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground shrink-0">Password:</span>
                            {editingPin?.id === user.id ? (
                              <div className="flex items-center gap-1 flex-1">
                                <Input
                                  value={editingPin.val}
                                  onChange={e => setEditingPin({ id: user.id, val: e.target.value })}
                                  className="h-6 text-xs px-2 py-0 font-mono"
                                  placeholder="New password"
                                  autoFocus
                                  maxLength={20}
                                />
                                <button onClick={handleSavePin} className="text-green-600 hover:text-green-500">
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button onClick={() => setEditingPin(null)} className="text-muted-foreground hover:text-foreground">
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-xs font-mono font-bold">
                                  {showPins[user.id] ? user.pin : '••••'}
                                </span>
                                <button onClick={() => setShowPins(p => ({ ...p, [user.id]: !p[user.id] }))} className="text-muted-foreground hover:text-foreground">
                                  {showPins[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </button>
                                <button
                                  onClick={() => setEditingPin({ id: user.id, val: user.pin })}
                                  className="text-muted-foreground hover:text-blue-600 ml-auto"
                                  title="Change password"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => copyToClipboard(`User ID: ${user.id}\nPassword: ${user.pin}\nBusiness: ${user.businessName}`, "Credentials")}
                            className="text-xs text-blue-600 hover:text-blue-500 flex items-center gap-1"
                          >
                            <Copy className="h-3 w-3" />
                            Copy credentials
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === 'create' && (
                  <div className="space-y-4">
                    {createdUser ? (
                      <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                          <div className="text-green-600 font-semibold mb-1">✓ Account Created!</div>
                          <p className="text-xs text-green-700">Share these credentials with your customer</p>
                        </div>
                        <div className="bg-muted rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">User ID</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold font-mono">{createdUser.id}</span>
                              <button onClick={() => copyToClipboard(createdUser.id, "User ID")}><Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">PIN</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold font-mono">{createdUser.pin}</span>
                              <button onClick={() => copyToClipboard(createdUser.pin, "PIN")}><Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" /></button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Business</span>
                            <span className="text-sm font-medium">{createdUser.businessName}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(`BusinessBuddy Login\nUser ID: ${createdUser.id}\nPIN: ${createdUser.pin}\nBusiness: ${createdUser.businessName}`, "All credentials")}
                          variant="outline"
                          className="w-full"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy All Credentials
                        </Button>
                        <Button onClick={() => setCreatedUser(null)} className="w-full">
                          Create Another Account
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Create a new customer account. The User ID is auto-generated. Set a password or leave blank to auto-generate one.</p>
                        <div>
                          <Label>Customer Name *</Label>
                          <Input value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Full name" className="mt-1" />
                        </div>
                        <div>
                          <Label>Business Name *</Label>
                          <Input value={newBizName} onChange={e => setNewBizName(e.target.value)} placeholder="Shop / Business name" className="mt-1" />
                        </div>
                        <div>
                          <Label className="flex items-center justify-between">
                            <span>Password (PIN)</span>
                            <span className="text-xs text-muted-foreground font-normal">Leave blank to auto-generate</span>
                          </Label>
                          <div className="relative mt-1">
                            <Input
                              type={showNewPin ? "text" : "password"}
                              value={newUserPin}
                              onChange={e => setNewUserPin(e.target.value)}
                              placeholder="Set a custom password (min 4 chars)"
                              className="pr-20"
                              maxLength={20}
                            />
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                              <button
                                type="button"
                                onClick={() => setShowNewPin(v => !v)}
                                className="p-1.5 rounded text-muted-foreground hover:text-foreground"
                              >
                                {showNewPin ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setNewUserPin(String(Math.floor(1000 + Math.random() * 9000)))}
                                className="p-1.5 rounded text-muted-foreground hover:text-blue-600"
                                title="Generate random PIN"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleCreateUser} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Account
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'password' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Change the admin panel password.</p>
                    <div>
                      <Label>Current Password</Label>
                      <Input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} placeholder="Current admin password" className="mt-1" />
                    </div>
                    <div>
                      <Label>New Password</Label>
                      <Input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password (min 6 chars)" className="mt-1" />
                    </div>
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} placeholder="Confirm new password" className="mt-1" />
                    </div>
                    <Button onClick={handleChangePassword} className="w-full">
                      <KeyRound className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
