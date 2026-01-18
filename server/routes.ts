import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertSessionSchema, insertClassSchema } from "@shared/schema";
import { hashPassword } from "./auth";

const SEED_DATA = [
  { rollNo: 1, name: "Aakash Yadav", obtained: 54, max: 80 },
  { rollNo: 2, name: "Aryan Kumar", obtained: 51, max: 80 },
  { rollNo: 3, name: "Rahul Kumar", obtained: 70, max: 80 },
  { rollNo: 4, name: "Aman Kumar", obtained: 46, max: 80 },
  { rollNo: 5, name: "Prince Kumar", obtained: 0, max: 80 },
  { rollNo: 6, name: "Faiz Raza", obtained: 58, max: 80 },
  { rollNo: 7, name: "Meraj Alam", obtained: 0, max: 80 },
  { rollNo: 8, name: "Afroz", obtained: 0, max: 80 },
  { rollNo: 9, name: "Ismail", obtained: 0, max: 80 },
  { rollNo: 10, name: "Khusboo", obtained: 62, max: 80 },
  { rollNo: 11, name: "Salma Parveen", obtained: 0, max: 80 },
  { rollNo: 12, name: "Aaisha Khatoon", obtained: 49, max: 80 },
  { rollNo: 13, name: "Sahima", obtained: 0, max: 80 },
  { rollNo: 14, name: "Aashiya", obtained: 45, max: 80 },
  { rollNo: 15, name: "Shanzida", obtained: 36, max: 80 },
  { rollNo: 16, name: "Maimuna", obtained: 68, max: 80 },
  { rollNo: 17, name: "Soha", obtained: 56, max: 80 },
  { rollNo: 18, name: "Naziya (U)", obtained: 58, max: 80 },
  { rollNo: 19, name: "Jashmin", obtained: 56, max: 80 },
  { rollNo: 20, name: "Usha Kumari", obtained: 38, max: 80 },
  { rollNo: 21, name: "Gungun", obtained: 54, max: 80 },
  { rollNo: 22, name: "Naziya (D)", obtained: 45, max: 80 },
  { rollNo: 23, name: "Shahina Khatoon", obtained: 60, max: 80 },
  { rollNo: 24, name: "Sonam Kumari", obtained: 40, max: 80 },
  { rollNo: 25, name: "Farzana", obtained: 65, max: 80 },
  { rollNo: 26, name: "Muskan Khatoon", obtained: 53, max: 80 },
  { rollNo: 27, name: "Sabina", obtained: 60, max: 80 },
  { rollNo: 28, name: "Farhin", obtained: 0, max: 80 },
  { rollNo: 29, name: "Sanaa Parveen", obtained: 66, max: 80 },
  { rollNo: 30, name: "Rani Parveen", obtained: 56, max: 80 },
  { rollNo: 31, name: "Gulafsa", obtained: 68, max: 80 },
  { rollNo: 32, name: "Sajiya Khatoon", obtained: 54, max: 80 },
  { rollNo: 33, name: "Amarjit Kumar", obtained: 47, max: 80 },
  { rollNo: 34, name: "Prince Yadav", obtained: 21, max: 80 },
  { rollNo: 35, name: "Tabrez", obtained: 41, max: 80 },
  { rollNo: 36, name: "Faiz", obtained: 0, max: 80 },
  { rollNo: 37, name: "Muskan II", obtained: 0, max: 80 },
  { rollNo: 38, name: "Tahir", obtained: 40, max: 80 },
  { rollNo: 39, name: "Anshu Kumari", obtained: 0, max: 80 },
];

async function seedDatabase() {
  const sessions = await storage.getSessions();
  let defaultSession = sessions[0];
  
  if (!defaultSession) {
    console.log("Creating default session...");
    defaultSession = await storage.createSession({
        name: "2024-25",
        isActive: true
    });
  }

  const classes = await storage.getClasses();
  let defaultClass = classes[0];
  if (!defaultClass) {
     console.log("Creating default class...");
     defaultClass = await storage.createClass({
        name: "10th",
        sessionId: defaultSession.id
     });
  }

  const admin = await storage.getAdminByUsername("admin");
  if (!admin) {
      console.log("Creating default admin...");
      const hashedPassword = await hashPassword("admin");
      await storage.createAdmin({
          name: "Administrator",
          email: "admin",
          password: hashedPassword,
          isSuperAdmin: true
      });
  }

  const students = await storage.getStudents();
  if (students.length === 0) {
    console.log("Seeding database...");
    
    // Create initial subject first
    const subject = await storage.createSubject({
      name: "Initial Test",
      date: new Date().toISOString().split('T')[0],
      maxMarks: 80,
      classId: defaultClass.id
    });

    for (const data of SEED_DATA) {
      const student = await storage.createStudent({
        rollNo: data.rollNo,
        name: data.name,
        classId: defaultClass.id
      });
      
      // Update mark for this student and subject
      await storage.updateMark(student.id, subject.id, data.obtained.toString());
    }
    console.log("Seeding complete.");
  }
}

function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed data on startup
  seedDatabase();

  // Sessions
  app.get("/api/sessions", async (req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
        const input = insertSessionSchema.parse(req.body);
        const session = await storage.createSession(input);
        res.status(201).json(session);
    } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: e.errors[0].message,
                field: e.errors[0].path.join('.'),
            });
        }
        res.status(400).json(e);
    }
  });

  app.patch("/api/sessions/:id", isAuthenticated, async (req, res) => {
     try {
        const id = Number(req.params.id);
        const input = insertSessionSchema.partial().parse(req.body);
        const updated = await storage.updateSession(id, input);
        res.json(updated);
     } catch (e) {
        res.status(400).json(e);
     }
  });

  // Classes
  app.get("/api/sessions/:sessionId/classes", async (req, res) => {
      const sessionId = Number(req.params.sessionId);
      const classes = await storage.getClassesBySession(sessionId);
      res.json(classes);
  });

  app.post("/api/classes", isAuthenticated, async (req, res) => {
      try {
        const input = insertClassSchema.parse(req.body);
        const cls = await storage.createClass(input);
        res.status(201).json(cls);
      } catch (e) {
        if (e instanceof z.ZodError) {
            return res.status(400).json({
                message: e.errors[0].message,
                field: e.errors[0].path.join('.'),
            });
        }
        res.status(400).json(e);
      }
  });
  
  app.delete("/api/classes/:id", isAuthenticated, async (req, res) => {
      const id = Number(req.params.id);
      await storage.deleteClass(id);
      res.sendStatus(204);
  });

  // Students
  app.get(api.students.list.path, async (req, res) => {
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    const students = await storage.getStudents(classId);
    res.json(students);
  });

  app.get(api.students.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const student = await storage.getStudent(id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  });

  app.post(api.students.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.students.create.input.parse(req.body);
      const student = await storage.createStudent(input);
      res.status(201).json(student);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.students.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.students.update.input.parse(req.body);
      const updated = await storage.updateStudent(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });
  
  app.delete(api.students.delete.path, isAuthenticated, async (req, res) => {
     const id = Number(req.params.id);
     await storage.deleteStudent(id);
     res.status(204).send();
  });

  // Subjects
  app.post(api.subjects.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.subjects.create.input.parse(req.body);
      const subject = await storage.createSubject(input);
      res.status(201).json(subject);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.subjects.list.path, async (req, res) => {
    const classId = req.query.classId ? Number(req.query.classId) : undefined;
    const subjects = await storage.getSubjects(classId);
    res.json(subjects);
  });

  app.patch(api.subjects.update.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const input = api.subjects.update.input.parse(req.body);
    const updated = await storage.updateSubject(id, input);
    res.json(updated);
  });
  
  app.delete(api.subjects.delete.path, isAuthenticated, async (req, res) => {
      const id = Number(req.params.id);
      await storage.deleteSubject(id);
      res.sendStatus(204);
  });

  // Marks
  app.post(api.marks.update.path, isAuthenticated, async (req, res) => {
    try {
      const { studentId, subjectId, obtained } = api.marks.update.input.parse(req.body);
      const updatedMark = await storage.updateMark(studentId, subjectId, obtained);
      res.json(updatedMark);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  return httpServer;
}
