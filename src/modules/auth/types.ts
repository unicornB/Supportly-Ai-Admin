export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "owner" | "admin" | "agent";
};

export type LoginResponse = {
  token: string;
  tokenType: "Bearer";
  expiresAt: string;
  adminUser: AdminUser;
};
