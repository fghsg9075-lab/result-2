import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Session, Class } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sessions
  const { data: sessions } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  // Classes
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  
  const { data: classes } = useQuery<Class[]>({
    queryKey: ["/api/sessions", selectedSessionId, "classes"],
    enabled: !!selectedSessionId,
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
        const res = await apiRequest("POST", "/api/sessions", data);
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        toast({ title: "Session created" });
    }
  });

  const createClassMutation = useMutation({
    mutationFn: async (data: any) => {
        const res = await apiRequest("POST", "/api/classes", data);
        return res.json();
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sessions", selectedSessionId, "classes"] });
        toast({ title: "Class created" });
    }
  });

  const deleteClassMutation = useMutation({
    mutationFn: async (id: number) => {
        await apiRequest("DELETE", `/api/classes/${id}`);
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/sessions", selectedSessionId, "classes"] });
        toast({ title: "Class deleted" });
    }
  });

  if (!user) return <Layout><div>Not authorized</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        {/* Sessions Management */}
        <Card>
           <CardHeader>
             <CardTitle>Academic Sessions</CardTitle>
             <CardDescription>Select a session to manage classes</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="flex gap-4 mb-4">
                 <SessionDialog onSubmit={(data) => createSessionMutation.mutate(data)} />
              </div>
              <div className="space-y-2">
                 {sessions?.map(s => (
                    <div key={s.id} 
                         className={`p-4 border rounded-xl flex justify-between items-center cursor-pointer transition-colors ${selectedSessionId === s.id ? 'bg-primary/10 border-primary' : 'hover:bg-gray-50'}`}
                         onClick={() => setSelectedSessionId(s.id)}
                    >
                        <span className="font-medium">{s.name} {s.isActive && <span className="text-green-600 text-xs ml-2 border border-green-200 px-2 py-0.5 rounded-full">Active</span>}</span>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>

        {/* Classes Management */}
        {selectedSessionId && (
            <Card>
                <CardHeader>
                    <CardTitle>Classes</CardTitle>
                    <CardDescription>Manage classes for the selected session</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 mb-4">
                        <ClassDialog sessionId={selectedSessionId} onSubmit={(data) => createClassMutation.mutate(data)} />
                    </div>
                    <div className="space-y-2">
                        {classes?.map(c => (
                            <div key={c.id} className="p-4 border rounded-xl flex justify-between items-center hover:bg-gray-50">
                                <span className="font-medium">{c.name}</span>
                                <Button variant="destructive" size="sm" onClick={() => deleteClassMutation.mutate(c.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
    </Layout>
  );
}

function SessionDialog({ onSubmit }: { onSubmit: (data: any) => void }) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>Add Session</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Session</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Session Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="2025-26" />
                    </div>
                    <Button className="w-full" onClick={() => { onSubmit({ name, isActive: false }); setOpen(false); setName(""); }}>Create Session</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ClassDialog({ sessionId, onSubmit }: { sessionId: number, onSubmit: (data: any) => void }) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button>Add Class</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Class Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="10th" />
                    </div>
                    <Button className="w-full" onClick={() => { onSubmit({ name, sessionId }); setOpen(false); setName(""); }}>Create Class</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
