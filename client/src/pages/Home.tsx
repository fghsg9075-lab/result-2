import { StudentTable } from "@/components/StudentTable";
import { StudentCard } from "@/components/StudentCard";
import { CreateStudentDialog } from "@/components/CreateStudentDialog";
import { CreateSubjectDialog } from "@/components/subjects/CreateSubjectDialog";
import { Layout } from "@/components/Layout";
import { useStudents } from "@/hooks/use-students";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  LayoutGrid, 
  Table as TableIcon, 
  TrendingUp, 
  Users, 
  Award,
  AlertCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Session, Class } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const { user } = useAuth();
  
  const { data: sessions } = useQuery<Session[]>({ 
    queryKey: ["/api/sessions"] 
  });
  
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  useEffect(() => {
    if (sessions?.length) {
        const active = sessions.find(s => s.isActive) || sessions[0];
        if (active && !selectedSessionId) {
            setSelectedSessionId(active.id.toString());
        }
    }
  }, [sessions]);

  const { data: classes } = useQuery<Class[]>({
    queryKey: ["/api/sessions", selectedSessionId, "classes"],
    enabled: !!selectedSessionId
  });

  useEffect(() => {
      // If the selected class is not in the new list of classes, reset it.
      if (classes) {
          if (classes.length > 0) {
              // If current selectedClassId is not found in classes, select the first one
              const exists = classes.find(c => c.id.toString() === selectedClassId);
              if (!exists) {
                  setSelectedClassId(classes[0].id.toString());
              }
          } else {
              setSelectedClassId("");
          }
      }
  }, [classes, selectedClassId]);

  const { data: students, isLoading, error } = useStudents(selectedClassId ? parseInt(selectedClassId) : undefined);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    return students.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toString().includes(search)
    ).map(student => {
      const totalObtained = student.marks.reduce((sum: number, m: any) => sum + parseInt(m.obtained || "0"), 0);
      const totalMax = student.marks.reduce((sum: number, m: any) => sum + m.subject.maxMarks, 0);
      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      return { ...student, percentage };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [students, search]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load students. Please try refreshing the app.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Session and Class Selectors */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                    {sessions?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name} {s.isActive && "(Active)"}</SelectItem>)}
                </SelectContent>
            </Select>

            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                    {classes?.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Students</p>
              <p className="text-2xl font-bold">{students?.length || 0}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Avg. Percentage</p>
              <p className="text-2xl font-bold">
                {filteredStudents.length > 0 
                  ? (filteredStudents.reduce((acc, s) => acc + s.percentage, 0) / filteredStudents.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Top Performer</p>
              <p className="text-xl font-bold truncate max-w-[150px]">
                {filteredStudents[0]?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by name or roll no..." 
              className="pl-10 h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            
            {user && selectedClassId && (
              <div className="flex items-center gap-2">
                <CreateSubjectDialog classId={parseInt(selectedClassId)} />
                <CreateStudentDialog classId={parseInt(selectedClassId)} />
              </div>
            )}

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <Button 
                variant={view === "grid" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("grid")}
                className={`rounded-lg h-9 ${view === "grid" ? "shadow-sm bg-white" : ""}`}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === "table" ? "secondary" : "ghost"} 
                size="sm" 
                onClick={() => setView("table")}
                className={`rounded-lg h-9 ${view === "table" ? "shadow-sm bg-white" : ""}`}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="min-h-[400px]">
          {!selectedClassId ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <h3 className="text-xl font-semibold text-slate-600">Select a Class</h3>
                <p className="text-slate-400">Please select a Session and Class to view students.</p>
              </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
              <Users className="h-16 w-16 mb-4 opacity-10" />
              <h3 className="text-xl font-semibold text-slate-600">No students found</h3>
              <p className="text-slate-400">Try adjusting your search or add a new student.</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredStudents.map((student, idx) => (
                <StudentCard key={student.id} student={student} rank={idx + 1} />
              ))}
            </div>
          ) : (
            <StudentTable students={filteredStudents} />
          )}
        </div>
      </div>
    </Layout>
  );
}
