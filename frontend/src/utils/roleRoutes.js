export const getDashboardPath = (role) => {
  if (role === "admin") return "/admin-dashboard";
  return "/dashboard";
};
