import { z } from 'zod';
import { insertStudentSchema, insertSubjectSchema, students, subjects, marks } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
};

export const api = {
  students: {
    list: {
      method: 'GET' as const,
      path: '/api/students',
      responses: {
        200: z.array(z.custom<any>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/students/:id',
      responses: {
        200: z.custom<any>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/students',
      input: insertStudentSchema,
      responses: {
        201: z.custom<any>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/students/:id',
      input: z.object({
        name: z.string().optional(),
        rollNo: z.number().optional(),
      }),
      responses: {
        200: z.custom<any>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/students/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  subjects: {
    list: {
      method: 'GET' as const,
      path: '/api/subjects',
      responses: {
        200: z.array(z.custom<typeof subjects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/subjects',
      input: insertSubjectSchema,
      responses: {
        201: z.custom<typeof subjects.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/subjects/:id',
      responses: {
        204: z.void(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/subjects/:id',
      input: z.object({
        name: z.string().optional(),
        maxMarks: z.number().optional(),
      }),
      responses: {
        200: z.custom<typeof subjects.$inferSelect>(),
      },
    },
  },
  marks: {
    update: {
      method: 'POST' as const,
      path: '/api/marks',
      input: z.object({
        studentId: z.number(),
        subjectId: z.number(),
        obtained: z.string(),
      }),
      responses: {
        200: z.custom<typeof marks.$inferSelect>(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
