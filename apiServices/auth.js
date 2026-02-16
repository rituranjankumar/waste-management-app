import { apiConnector } from "@/lib/apiConnector";

export const signupByCredential = async (payload) => {
  return await apiConnector("POST", "/api/signup", payload);
};
