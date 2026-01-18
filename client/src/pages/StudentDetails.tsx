import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "wouter";
import { useStudent } from "@/hooks/use-students";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, Calendar, BookOpen, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudentWithMarks } from "@shared/schema";

interface MarkDisplay {
  localId: string;
  id?: number;
  subject: string;
  date: string;
  obtained: string;
  max: number;
}

export default function StudentDetails() {
  const { id } = useParams();
  const studentId = Number(id);
  const { data: studentData, isLoading, error } = useStudent(studentId);
  const student = studentData as StudentWithMarks | undefined;

  const [marks, setMarks] = useState<MarkDisplay[]>([]);

  useEffect(() => {
    if (student) {
      const initialMarks = student.marks.map((m) => ({
        localId: `db-${m.id}`,
        id: m.id,
        subject: m.subject.name || "General",
        date: m.subject.date || new Date().toISOString().split("T")[0],
        obtained: m.obtained,
        max: m.subject.maxMarks,
      }));
      setMarks(initialMarks);
    }
  }, [student]);

  const stats = useMemo(() => {
    const totalObtained = marks.reduce((sum, m) => sum + (parseFloat(m.obtained) || 0), 0);
    const totalMax = marks.reduce((sum, m) => sum + Number(m.max || 0), 0);
    const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    return { totalObtained, totalMax, percentage };
  }, [marks]);

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !student) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20">
           <h2 className="text-xl font-bold text-destructive mb-4">Student not found</h2>
           <Link href="/">
             <Button variant="outline">Go Back Home</Button>
           </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 pb-20">
        <div className="sticky top-24 z-40 bg-white/95 backdrop-blur-md border border-border shadow-md rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
             <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
             </Link>
             <div>
                <h1 className="text-2xl font-heading font-bold text-primary">{student.name}</h1>
                <p className="text-sm text-muted-foreground font-medium">Roll No. {student.rollNo}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-8 border-l border-border pl-8">
            <div className="text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Total Marks</p>
                <p className="text-xl font-bold font-mono text-foreground">{stats.totalObtained} <span className="text-sm text-muted-foreground">/ {stats.totalMax}</span></p>
            </div>
            <div className="text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Percentage</p>
                <div className="flex items-center gap-2">
                    <p className={`text-2xl font-bold tabular-nums ${stats.percentage >= 60 ? 'text-green-600' : stats.percentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {stats.percentage.toFixed(2)}%
                    </p>
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                </div>
            </div>
          </div>
        </div>

        <Card className="overflow-hidden border-border/50 shadow-sm">
          <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between">
            <h2 className="font-heading font-bold flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              Detailed Marksheet
            </h2>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Session 2025-26
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-bold">Subject / Test Name</th>
                  <th className="px-6 py-4 font-bold text-center">Obtained Marks</th>
                  <th className="px-6 py-4 font-bold text-center">Full Marks</th>
                  <th className="px-6 py-4 font-bold text-right">Percentage</th>
                  <th className="px-6 py-4 font-bold text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {marks.map((mark) => {
                  const mObtained = parseFloat(mark.obtained) || 0;
                  const mPercentage = mark.max > 0 ? (mObtained / mark.max) * 100 : 0;
                  const isPass = mPercentage >= 33;
                  
                  return (
                    <tr key={mark.localId} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-semibold text-foreground">
                        {mark.subject}
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold text-primary">
                        {mark.obtained}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-muted-foreground">
                        {mark.max}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={cn("h-full rounded-full", isPass ? "bg-primary" : "bg-destructive")}
                              style={{ width: `${mPercentage}%` }}
                            />
                          </div>
                          <span className="font-bold min-w-[45px]">{mPercentage.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-black uppercase",
                          isPass ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {isPass ? "Pass" : "Fail"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-primary/5 font-bold border-t-2 border-primary/20">
                  <td className="px-6 py-5 text-primary text-base">GRAND TOTAL</td>
                  <td className="px-6 py-5 text-center text-xl text-primary font-black">
                    {stats.totalObtained}
                  </td>
                  <td className="px-6 py-5 text-center text-lg text-muted-foreground font-mono">
                    {stats.totalMax}
                  </td>
                  <td className="px-6 py-5 text-right text-2xl text-primary tabular-nums" colSpan={2}>
                    {stats.percentage.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 opacity-60">
          {marks.map((mark) => (
            <Card key={mark.localId} className="group relative overflow-hidden transition-all hover:shadow-lg border-t-4 border-t-primary/10">
              <div className="p-5 space-y-4">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="font-bold text-base text-primary">
                        {mark.subject}
                    </div>
                 </div>

                 <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {mark.date}
                 </div>

                 <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Obtained</label>
                        <div className="font-mono font-bold text-xl text-primary p-2 bg-primary/5 rounded-md text-center">
                            {mark.obtained}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Max</label>
                         <div className="font-mono text-xl text-muted-foreground p-2 bg-secondary/30 rounded-md text-center">
                            {mark.max}
                        </div>
                    </div>
                 </div>
                 
                 <div className="text-right text-[10px] text-muted-foreground font-medium pt-1">
                    {mark.max > 0 ? (((parseFloat(mark.obtained) || 0) / mark.max) * 100).toFixed(0) : 0}%
                 </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
