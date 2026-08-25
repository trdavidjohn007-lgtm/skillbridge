import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

// Role-based access control configuration
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  DEPT_ADMIN: "dept_admin",
  TRAINER: "trainer",
  LEARNER: "learner",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// Role permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: [
    "users:read",
    "users:write",
    "users:delete",
    "competencies:read",
    "competencies:write",
    "competencies:delete",
    "assessments:read",
    "assessments:write",
    "assessments:delete",
    "analytics:read",
    "analytics:write",
    "courses:read",
    "courses:write",
    "integration:read",
    "integration:write",
    "content:read",
    "content:write",
    "content:delete",
  ],
  dept_admin: [
    "users:read",
    "competencies:read",
    "assessments:read",
    "assessments:write",
    "analytics:read",
    "courses:read",
    "content:read",
    "content:write",
  ],
  trainer: [
    "competencies:read",
    "assessments:read",
    "assessments:write",
    "courses:read",
    "content:read",
    "content:write",
  ],
  learner: [
    "competencies:read",
    "assessments:read",
    "courses:read",
    "content:read",
  ],
};

// Check if a role has a specific permission
export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// Check if a role has any of the given permissions
export function hasAnyPermission(
  role: UserRole,
  permissions: string[]
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

// Auth options
export const authOptions: NextAuthOptions = {
  providers: [
    // Development credentials provider
    CredentialsProvider({
      name: "Development Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const email = credentials.email;
        const name = email.split("@")[0];

        // Try database first
        try {
          const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (existingUser) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              role: existingUser.role,
            };
          }

          // Create new user in DB
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name,
              role: "learner",
            })
            .returning();

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          };
        } catch (dbError) {
          // Database unavailable — use JWT-only auth (no DB persistence)
          console.warn("DB unavailable, using fallback auth for:", email);
          const fakeId = Buffer.from(email).toString("base64url").slice(0, 36);
          return {
            id: fakeId,
            email,
            name,
            role: "learner",
          };
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

// Helper to get current user from session
export async function getCurrentUser(session: any) {
  if (!session?.user?.id) return null;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user;
}

// Helper to check if user has required role
export function requireRole(allowedRoles: UserRole[]) {
  return (session: any) => {
    const userRole = session?.user?.role as UserRole;
    return allowedRoles.includes(userRole);
  };
}
