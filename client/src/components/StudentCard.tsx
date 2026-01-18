import { type StudentWithMarks } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, ArrowRight, Trash2, Star, Edit2, Check, X } from "lucide-react";
import { useLocation } from "wouter";
import { useDeleteStudent, useUpdateStudent } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";

interface StudentCardProps {
  student: StudentWithMarks;
  rank: number;
}

export function StudentCard({ student, rank }: StudentCardProps) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteStudent();
  const updateStudentMutation = useUpdateStudent();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(student.name);

  const totalObtained = student.marks.reduce((sum, m) => sum + parseInt(m.obtained || "0"), 0);
  const totalMax = student.marks.reduce((sum, m) => sum + m.subject.maxMarks, 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  const updateMark = useMutation({
    mutationFn: async ({ subjectId, obtained }: { subjectId: number; obtained: number }) => {
      const res = await fetch(api.marks.update.path, {
        method: api.marks.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          subjectId,
          obtained
        }),
      });
      if (!res.ok) throw new Error("Failed to update mark");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.students.list.path] });
    },
  });

  const isTop3 = rank <= 3;
  const isTop10 = rank <= 10;
  
  let rankBadge = null;
  if (rank === 1) rankBadge = <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />;
  else if (rank === 2) rankBadge = <Medal className="w-5 h-5 text-slate-400 fill-slate-400" />;
  else if (rank === 3) rankBadge = <Medal className="w-5 h-5 text-amber-700 fill-amber-700" />;
  else if (isTop10) rankBadge = <Award className="w-5 h-5 text-blue-500" />;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(student.id);
      toast({ title: "Student deleted", description: "Record removed successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Could not delete student.", variant: "destructive" });
    }
  };

  const handleUpdateName = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editedName.trim() === student.name) {
      setIsEditingName(false);
      return;
    }
    try {
      await updateStudentMutation.mutateAsync({ 
        id: student.id, 
        data: { name: editedName.trim() } 
      });
      toast({ title: "Name updated" });
      setIsEditingName(false);
    } catch (error) {
      toast({ title: "Error updating name", variant: "destructive" });
    }
  };

  return (
    <Card 
      className={`
        group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg cursor-pointer
        ${rank === 1 ? 'border-yellow-500/50 shadow-yellow-500/10' : ''}
        ${rank === 2 ? 'border-slate-400/50 shadow-slate-400/10' : ''}
        ${rank === 3 ? 'border-amber-700/50 shadow-amber-700/10' : ''}
        ${rank > 3 && isTop10 ? 'border-blue-200 shadow-blue-500/5' : 'border-border/50'}
      `}
      onClick={() => setLocation(`/student/${student.id}`)}
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full 
        ${rank === 1 ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' : ''}
        ${rank === 2 ? 'bg-gradient-to-b from-slate-300 to-slate-500' : ''}
        ${rank === 3 ? 'bg-gradient-to-b from-amber-600 to-amber-800' : ''}
        ${rank > 3 && isTop10 ? 'bg-blue-500' : 'bg-transparent'}
      `} />

      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row lg:items-center">
          <div className="p-4 sm:p-5 flex items-center gap-4 flex-1">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border
              ${isTop3 ? 'bg-white shadow-inner' : 'bg-muted/50 border-transparent'}
            `}>
              {rankBadge || <span className="text-muted-foreground text-sm">#{rank}</span>}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/50 px-2 py-0.5 rounded">
                  Roll No. {student.rollNo}
                </span>
                {isTop3 && <span className="px-2 py-0.5 text-[8px] font-black bg-red-100 text-red-600 rounded-full uppercase">Top</span>}
              </div>
              {isEditingName && user ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input 
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8 py-1 px-2 text-lg font-bold uppercase"
                    autoFocus
                  />
                  <button onClick={handleUpdateName} className="p-1 text-green-600 hover:bg-green-50 rounded">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setIsEditingName(false); setEditedName(student.name); }} className="p-1 text-red-600 hover:bg-red-50 rounded">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/name">
                  <h3 className="font-heading text-lg font-bold truncate group-hover:text-primary transition-colors uppercase">
                    {student.name}
                  </h3>
                  {user && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditingName(true); }}
                        className="opacity-0 group-hover/name:opacity-100 p-1 text-muted-foreground hover:text-primary transition-all"
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-border/50 p-4 bg-slate-50/30 flex-grow">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex flex-wrap gap-3 flex-1">
                {student.marks.map((m) => (
                  <div key={m.id} className="flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground/70 truncate max-w-[80px]">
                      {m.subject.name}
                    </Label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        className="w-20 h-9 bg-white text-center font-bold text-sm focus:ring-1 disabled:opacity-100 disabled:bg-slate-50"
                        defaultValue={m.obtained}
                        disabled={!user}
                        onBlur={(e) => {
                          if (!user) return;
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== parseInt(m.obtained || "0")) {
                            updateMark.mutate({ subjectId: m.subjectId, obtained: val });
                          }
                        }}
                      />
                      <span className="absolute -top-2 -right-1 bg-primary/10 text-primary text-[8px] font-bold px-1 rounded border border-primary/20">
                        {m.subject.maxMarks}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-6 pl-4 border-l border-border/50 ml-auto">
                <div className="text-right">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Total</div>
                  <div className="text-xl font-black text-primary leading-none">
                    {totalObtained}<span className="text-[10px] text-muted-foreground ml-0.5">/{totalMax}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center">
                  <Badge variant={percentage >= 33 ? "default" : "destructive"} className="text-[10px] font-black px-2 py-0">
                    {percentage.toFixed(1)}%
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  {user && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete {student.name}.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                            Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  )}
                  
                  <div className="p-2 rounded-lg bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
