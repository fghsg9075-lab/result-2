import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useCreateStudent } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { z } from "zod";

export function CreateStudentDialog({ classId }: { classId?: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const { toast } = useToast();
  const createMutation = useCreateStudent();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId) return;
    try {
      // Basic validation
      if (!name || !rollNo) return;
      
      const roll = parseInt(rollNo);
      if (isNaN(roll)) throw new Error("Roll number must be a number");

      await createMutation.mutateAsync({
        name,
        rollNo: roll,
        classId,
      });

      toast({
        title: "Success",
        description: "Student created successfully",
      });
      setOpen(false);
      setName("");
      setRollNo("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="shadow-lg shadow-primary/20 rounded-full px-6 font-semibold">
          <Plus className="w-5 h-5 mr-2" /> Add New Student
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Create a new student record for the 2025-26 session.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollNo" className="text-right">
                Roll No.
              </Label>
              <Input
                id="rollNo"
                type="number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="col-span-3"
                placeholder="e.g. 45"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Full Name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
