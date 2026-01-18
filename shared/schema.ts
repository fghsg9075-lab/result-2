import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === TABLE DEFINITIONS ===

// Admin accounts
export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
});

// Academic Sessions (e.g., 2025-26)
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
});

// Classes within a session
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sessionId: integer("session_id").notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNo: integer("roll_no").notNull(),
  name: text("name").notNull(),
  classId: integer("class_id").notNull(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  date: text("date"),
  maxMarks: integer("max_marks").notNull().default(100),
  classId: integer("class_id").notNull(),
});

export const marks = pgTable("marks", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  obtained: text("obtained").notNull().default("0"),
});

// === RELATIONS ===

export const sessionsRelations = relations(sessions, ({ many }) => ({
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  session: one(sessions, {
    fields: [classes.sessionId],
    references: [sessions.id],
  }),
  students: many(students),
  subjects: many(subjects),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  class: one(classes, {
    fields: [students.classId],
    references: [classes.id],
  }),
  marks: many(marks),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  class: one(classes, {
    fields: [subjects.classId],
    references: [classes.id],
  }),
  marks: many(marks),
}));

export const marksRelations = relations(marks, ({ one }) => ({
  student: one(students, {
    fields: [marks.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [marks.subjectId],
    references: [subjects.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertAdminSchema = createInsertSchema(admins).omit({ id: true });
export const insertSessionSchema = createInsertSchema(sessions).omit({ id: true });
export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export const insertStudentSchema = createInsertSchema(students).omit({ id: true });
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true });
export const insertMarkSchema = createInsertSchema(marks).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Mark = typeof marks.$inferSelect;
export type InsertMark = z.infer<typeof insertMarkSchema>;

export type StudentWithMarks = Student & { 
  marks: (Mark & { subject: Subject })[] 
};

export type ClassWithData = Class & {
  students: StudentWithMarks[];
  subjects: Subject[];
};

export type SessionWithClasses = Session & {
  classes: Class[];
};
