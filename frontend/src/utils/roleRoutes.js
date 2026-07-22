export const getDashboardPath = (role) => {
  if (role === "admin") return "/admin-dashboard";
  if (role === "tutor") return "/tutor-dashboard";
  return "/dashboard";
};
