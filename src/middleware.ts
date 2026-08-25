import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/competencies/:path*",
    "/learning/:path*",
    "/assessments/:path*",
    "/analytics/:path*",
    "/settings/:path*",
    "/api/competencies/:path*",
    "/api/learners/:path*",
    "/api/learning-paths/:path*",
    "/api/assessments/:path*",
    "/api/analytics/:path*",
    "/api/courses/:path*",
  ],
};
