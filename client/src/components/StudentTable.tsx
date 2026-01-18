import { Link } from "wouter";
import { motion } from "framer-motion";
import { Edit2, Trophy, Medal, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDeleteStudent } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { StudentWithMarks } from "@shared/schema";

interface StudentTableProps {
  students: StudentWithMarks[];
}

export function StudentTable({ students }: StudentTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const deleteMutation = useDeleteStudent();

  // Calculate totals and percentages
  const processedStudents = students.map(student => {
    const totalObtained = student.marks.reduce((sum, m) => sum + parseInt(m.obtained || "0"), 0);
    const totalMax = student.marks.reduce((sum, m) => sum + m.subject.maxMarks, 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    
    return {
      ...student,
      totalObtained,
      totalMax,
      percentage
    };
  }).sort((a, b) => b.percentage - a.percentage); // Sort High to Low

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Student deleted" });
    } catch (error) {
      toast({ title: "Error deleting student", variant: "destructive" });
    }
  };

  if (processedStudents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/50 rounded-3xl border border-dashed border-border/60">
        <Trophy className="h-16 w-16 mb-4 opacity-20" />
        <h3 className="text-xl font-semibold">No Students Yet</h3>
        <p>Add a student to start tracking marks.</p>
      </div>
    );
  }

  const getRankStyle = (index: number) => {
    if (index === 0) return "bg-[hsl(var(--rank-1))]/10 border-l-4 border-l-[hsl(var(--rank-1))]";
    if (index === 1) return "bg-[hsl(var(--rank-2))]/10 border-l-4 border-l-[hsl(var(--rank-2))]";
    if (index === 2) return "bg-[hsl(var(--rank-3))]/10 border-l-4 border-l-[hsl(var(--rank-3))]";
    if (index < 10) return "bg-[hsl(var(--rank-top10))]/5 border-l-4 border-l-[hsl(var(--rank-top10))]";
    return "hover:bg-muted/50 border-l-4 border-l-transparent";
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-[hsl(var(--rank-1))]" fill="currentColor" />;
    if (index === 1) return <Medal className="h-5 w-5 text-[hsl(var(--rank-2))]" fill="currentColor" />;
    if (index === 2) return <Medal className="h-5 w-5 text-[hsl(var(--rank-3))]" fill="currentColor" />;
    return <span className="font-mono text-muted-foreground w-5 text-center">{index + 1}</span>;
  };

  return (
    <div className="rounded-2xl border bg-white/80 backdrop-blur shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="w-[80px] text-center">Rank</TableHead>
            <TableHead className="w-[100px]">Roll No</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead className="text-right">Total Marks</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
            <TableHead className="w-[100px] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {processedStudents.map((student, index) => (
            <motion.tr
              key={student.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn("group transition-colors", getRankStyle(index))}
            >
              <TableCell className="font-medium text-center">
                <div className="flex justify-center items-center">
                  {getRankIcon(index)}
                </div>
              </TableCell>
              <TableCell className="font-mono text-muted-foreground">#{student.rollNo}</TableCell>
              <TableCell className="font-semibold text-lg">{student.name}</TableCell>
              <TableCell className="text-right font-mono">
                <span className={cn("font-bold", index < 3 ? "text-primary" : "")}>
                  {student.totalObtained}
                </span>
                <span className="text-muted-foreground text-xs"> / {student.totalMax}</span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full", 
                        index === 0 ? "bg-[hsl(var(--rank-1))]" : 
                        index === 1 ? "bg-[hsl(var(--rank-2))]" :
                        index === 2 ? "bg-[hsl(var(--rank-3))]" :
                        index < 10 ? "bg-[hsl(var(--rank-top10))]" : "bg-primary"
                      )}
                      style={{ width: `${student.percentage}%` }}
                    />
                  </div>
                  <span className="font-bold w-12">{student.percentage.toFixed(1)}%</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                  <Link href={`/student/${student.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary">
                      {user ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </Link>
                  {user && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Student?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This will permanently delete {student.name}'s record.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(student.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
