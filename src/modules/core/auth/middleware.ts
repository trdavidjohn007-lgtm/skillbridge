import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission, type UserRole } from "./index";

// Middleware to check authentication
export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return { session, user: session.user };
}

// Middleware to check specific permission
export async function requirePermission(
  request: NextRequest,
  permission: string
) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userRole = authResult.user.role as UserRole;

  if (!hasPermission(userRole, permission)) {
    return NextResponse.json(
      { error: "Insufficient permissions", required: permission },
      { status: 403 }
    );
  }

  return authResult;
}

// Middleware to check if user has any of the allowed roles
export async function requireRoles(
  request: NextRequest,
  allowedRoles: UserRole[]
) {
  const authResult = await requireAuth(request);

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const userRole = authResult.user.role as UserRole;

  if (!allowedRoles.includes(userRole)) {
    return NextResponse.json(
      {
        error: "Insufficient role",
        required: allowedRoles,
        current: userRole,
      },
      { status: 403 }
    );
  }

  return authResult;
}

// Helper to get authenticated user for server components
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id as string,
    email: session.user.email as string,
    name: session.user.name as string,
    role: session.user.role as UserRole,
  };
}
