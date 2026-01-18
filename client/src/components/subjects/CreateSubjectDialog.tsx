import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { Subject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2, Edit2, Trash2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CreateSubjectDialog({ classId }: { classId?: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editMaxMarks, setEditMaxMarks] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: subjects = [] } = useQuery<Subject[]>({
    queryKey: [api.subjects.list.path, classId],
    queryFn: async () => {
      const url = classId 
        ? `${api.subjects.list.path}?classId=${classId}` 
        : api.subjects.list.path;
      const res = await fetch(url);
      return res.json();
    },
    enabled: !!classId
  });

  const createSubject = useMutation({
    mutationFn: async () => {
      if (!classId) throw new Error("Class ID is required");
      const res = await fetch(api.subjects.create.path, {
        method: api.subjects.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          maxMarks: parseInt(maxMarks),
          date: new Date().toISOString().split('T')[0],
          classId
        }),
      });
      if (!res.ok) throw new Error("Failed to create subject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.students.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] });
      toast({ title: "Success", description: "Subject added for all students" });
      setName("");
      setMaxMarks("100");
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({ id, name, maxMarks }: { id: number; name: string; maxMarks: number }) => {
      const url = buildUrl(api.subjects.update.path, { id });
      const res = await fetch(url, {
        method: api.subjects.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, maxMarks }),
      });
      if (!res.ok) throw new Error("Failed to update subject");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.students.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] });
      toast({ title: "Test renamed successfully" });
      setEditingId(null);
    }
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.subjects.delete.path, { id });
      const res = await fetch(url, { method: api.subjects.delete.method });
      if (!res.ok) throw new Error("Failed to delete subject");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.students.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] });
      toast({ title: "Test deleted successfully" });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Manage Tests
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Annual Test Boxes</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4 items-end bg-muted/30 p-4 rounded-xl">
            <div className="space-y-2">
              <Label>New Subject Name</Label>
              <Input 
                placeholder="e.g. Mathematics" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Full Marks</Label>
              <div className="flex gap-2">
                <Input 
                  type="number" 
                  value={maxMarks} 
                  onChange={(e) => setMaxMarks(e.target.value)} 
                />
                <Button 
                  onClick={() => createSubject.mutate()}
                  disabled={!name || createSubject.isPending}
                >
                  {createSubject.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                </Button>
              </div>
            </div>
          </div>

          <div className="border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead className="w-[100px]">Full Marks</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      {editingId === sub.id ? (
                        <Input 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        sub.name
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === sub.id ? (
                        <Input 
                          type="number"
                          value={editMaxMarks} 
                          onChange={(e) => setEditMaxMarks(e.target.value)}
                          className="h-8"
                        />
                      ) : (
                        sub.maxMarks
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {editingId === sub.id ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-green-600"
                              onClick={() => updateSubject.mutate({ 
                                id: sub.id, 
                                name: editName, 
                                maxMarks: parseInt(editMaxMarks) 
                              })}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-600"
                              onClick={() => setEditingId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setEditingId(sub.id);
                                setEditName(sub.name);
                                setEditMaxMarks(sub.maxMarks.toString());
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                if (confirm("Delete this test and all associated marks?")) {
                                  deleteSubject.mutate(sub.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
