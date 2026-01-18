import { db } from "./db";
import {
  admins,
  sessions,
  classes,
  students,
  subjects,
  marks,
  type Admin,
  type Session,
  type Class,
  type Student,
  type Subject,
  type Mark,
  type InsertAdmin,
  type InsertSession,
  type InsertClass,
  type InsertStudent,
  type InsertSubject,
  type StudentWithMarks
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Admin
  getAdmin(id: number): Promise<Admin | undefined>;
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;

  // Session
  getSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<InsertSession>): Promise<Session>;

  // Class
  getClasses(): Promise<Class[]>;
  getClassesBySession(sessionId: number): Promise<Class[]>;
  createClass(cls: InsertClass): Promise<Class>;
  updateClass(id: number, cls: Partial<InsertClass>): Promise<Class>;
  deleteClass(id: number): Promise<void>;

  getStudents(classId?: number): Promise<StudentWithMarks[]>;
  getStudent(id: number): Promise<StudentWithMarks | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, update: Partial<InsertStudent>): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  
  getSubjects(classId?: number): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  updateSubject(id: number, subject: Partial<InsertSubject>): Promise<Subject>;
  deleteSubject(id: number): Promise<void>;
  
  updateMark(studentId: number, subjectId: number, obtained: string): Promise<Mark>;
}

export class DatabaseStorage implements IStorage {
  // Admin Implementation
  async getAdmin(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, username));
    return admin;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db.insert(admins).values(insertAdmin).returning();
    return admin;
  }

  // Session Implementation
  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async updateSession(id: number, update: Partial<InsertSession>): Promise<Session> {
    const [updated] = await db.update(sessions).set(update).where(eq(sessions.id, id)).returning();
    return updated;
  }

  // Class Implementation
  async getClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClassesBySession(sessionId: number): Promise<Class[]> {
    return await db.select().from(classes).where(eq(classes.sessionId, sessionId));
  }

  async createClass(insertClass: InsertClass): Promise<Class> {
    const [cls] = await db.insert(classes).values(insertClass).returning();
    return cls;
  }

  async updateClass(id: number, update: Partial<InsertClass>): Promise<Class> {
    const [updated] = await db.update(classes).set(update).where(eq(classes.id, id)).returning();
    return updated;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Student Implementation
  async getStudents(classId?: number): Promise<StudentWithMarks[]> {
    try {
      let query = db.select().from(students);
      if (classId) {
        query.where(eq(students.classId, classId));
      }
      const allStudents = await query;
      
      let subjectQuery = db.select().from(subjects);
      if (classId) {
        subjectQuery.where(eq(subjects.classId, classId));
      }
      const allSubjects = await subjectQuery;
      
      const allMarks = await db.select().from(marks);

      return allStudents.map(s => {
        const studentMarks = allMarks
          .filter(m => m.studentId === s.id)
          .map(m => {
            const subject = allSubjects.find(sub => sub.id === m.subjectId);
            return {
              ...m,
              subject: subject || { id: 0, name: "Unknown", date: "", maxMarks: 100, classId: 0 }
            };
          });
        return { ...s, marks: studentMarks };
      });
    } catch (error) {
      console.error("Error in getStudents:", error);
      return [];
    }
  }

  async getStudent(id: number): Promise<StudentWithMarks | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    if (!student) return undefined;

    const allSubjects = await db.select().from(subjects);
    const studentMarks = await db.select().from(marks)
      .where(eq(marks.studentId, id));
    
    return {
      ...student,
      marks: studentMarks.map(m => ({
        ...m,
        subject: allSubjects.find(sub => sub.id === m.subjectId)!
      }))
    };
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(insertStudent).returning();
    return student;
  }

  async updateStudent(id: number, update: Partial<InsertStudent>): Promise<Student> {
    const [updated] = await db.update(students)
      .set(update)
      .where(eq(students.id, id))
      .returning();
    return updated;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(marks).where(eq(marks.studentId, id));
    await db.delete(students).where(eq(students.id, id));
  }

  async getSubjects(classId?: number): Promise<Subject[]> {
    if (classId) {
      return await db.select().from(subjects).where(eq(subjects.classId, classId));
    }
    return await db.select().from(subjects);
  }

  async createSubject(insertSubject: InsertSubject): Promise<Subject> {
    const [subject] = await db.insert(subjects).values(insertSubject).returning();
    
    // Auto-create "0" marks for all existing students IN THAT CLASS
    const classStudents = await db.select().from(students).where(eq(students.classId, insertSubject.classId));
    if (classStudents.length > 0) {
      await db.insert(marks).values(
        classStudents.map(s => ({
          studentId: s.id,
          subjectId: subject.id,
          obtained: "0"
        }))
      );
    }
    
    return subject;
  }

  async deleteSubject(id: number): Promise<void> {
    await db.delete(marks).where(eq(marks.subjectId, id));
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  async updateSubject(id: number, update: Partial<InsertSubject>): Promise<Subject> {
    const [updated] = await db.update(subjects)
      .set(update)
      .where(eq(subjects.id, id))
      .returning();
    return updated;
  }

  async updateMark(studentId: number, subjectId: number, obtained: string): Promise<Mark> {
    const [existing] = await db.select().from(marks).where(
      and(eq(marks.studentId, studentId), eq(marks.subjectId, subjectId))
    );

    if (existing) {
      const [updated] = await db.update(marks)
        .set({ obtained })
        .where(eq(marks.id, existing.id))
        .returning();
      return updated;
    } else {
      const [inserted] = await db.insert(marks)
        .values({ studentId, subjectId, obtained })
        .returning();
      return inserted;
    }
  }
}

export const storage = new DatabaseStorage();
