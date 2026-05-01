import axiosClient from "../../api/axiosClient";

export const adminApi = {
  // auth
  adminLogin: (data) => axiosClient.post("/admin/auth/login", data),
  forgetPassword: (data) =>
    axiosClient.post("/admin/auth/forgot-password", data),

  resetPassword: (data) => axiosClient.post("/admin/auth/reset-password", data),

  signupOtp: (data) => axiosClient.post("/admin/auth/signup", data),
  signupVarifyOtp: (data) => axiosClient.post("/admin/auth/verify-otp", data),
  resendSignUpOtp: (data) => axiosClient.post("admin/auth/resend-otp", data),

  getUserData: (page, limit,search = '', user_id  ) => axiosClient.get(`/admin/users?page=${page}&limit=${limit}&search=${search}&user_id=${user_id}`),
  adminLoginAsUser: (data) =>
    axiosClient.post("/admin/admin/login-as-user", data),
  updateUserData: (id, data) =>
    axiosClient.put(`/admin/user/update-status/${id}`, data),

  setTokenPrice: (data) => axiosClient.post("/admin/set-price", data),
  setDeposit: (data) => axiosClient.post("/admin/user/deposit", data),
  getDeposit: () => axiosClient.get("/admin/user/deposits"),

  updateUserWalletAddress: (data) => axiosClient.put("/admin/user/update-wallet-address", data),
  getWalletUpdateLogs: () => axiosClient.get("/admin/wallet-update-logs"),

  // reports
  getPerDayIncomeReport: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/history/daily-roi-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
  getReferralIncomeReport: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/history/referral-income-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
  getLevelIncomeReport: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/history/level-income-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
  getBinaryIncomeReport: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/history/binary-income-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
  getLeadershipShareReport: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/history/leadership-share-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
  getLeadershipIncomeReport: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/history/leadership-income-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
    getAdminReport: (swapReportType) =>
    axiosClient.get(`/admin/swap-history`, { params: { type: swapReportType } }),

    //Kyc Report
  getAllKYC: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/kyc/history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),

  verifyKYC: (kycId, status, rejectionReason) => axiosClient.post(`/admin/kyc/verify`, { kycId, status, rejectionReason }),

    //////////
  getBonanzaRewardsReport: () =>
    axiosClient.get("/admin/history/bonanza-reward-history"),
  getSessionLog: () => axiosClient.get("/admin/login-log"),
  getWithdrawals: () => axiosClient.get("/admin/user/withdrawals"),
  postWithdrawalApprovel: (data) =>
    axiosClient.post(`/admin/user/withdrawal/approve`, data),
  updateProfile: (data) =>
    axiosClient.put(`/admin/update-email-password`, data),
  getDashboardData: () => axiosClient.get("/admin/dashboard"),
  getUserStakePlans: () => axiosClient.get("/admin/stake/get-user-investment"),

  // Trade management APIs
  addTradeDeposit: (data) => axiosClient.post("/admin/trade/deposit", data),
  addTradeWithdrawal: (data) =>
    axiosClient.post("/admin/trade/withdrawal", data),
  addTradeProfitWithdrawal: (data) =>
    axiosClient.post("/admin/trade/profit-withdrawal", data),

  // investment plains
  createInvestmentPackages: (data) =>
    axiosClient.post("/admin/package/create", data),
  getInvestmentPackages: () => axiosClient.get("/admin/packages"),
  // updateInvestmentPackages: (id, data) =>
  //   axiosClient.put(`/admin/package/update/${id}`, data),
  deleteInvestmentPackages: (id) =>
    axiosClient.delete(`/admin/package/delete/${id}`),

  /* ================= PROPERTY ================= */
getAllInvestments: (page, limit, startDate, endDate, user_id) => axiosClient.get(`/admin/history/user-investment-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),

  createProperty: (data) =>
    axiosClient.post("/admin/property/register", data),
  getProperties: () =>
    axiosClient.get("/admin/properties"),
  getPropertyById: (id) =>
    axiosClient.get(`/admin/property/${id}`),
  updateProperty: (id, data) =>
    axiosClient.put(`/admin/property/update/${id}`, data),
  deleteProperty: (id) =>
    axiosClient.delete(`/admin/property/delete/${id}`),

// Package // Plan

getAllInvestments: (page, limit, startDate, endDate, user_id) => axiosClient.get(`/admin/history/user-investment-history?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),
// Inside your adminApi object
updateInvestmentStatus: (investmentId, action, note = "") =>
  axiosClient.put(`/admin/plan/update-investment-status/${investmentId}`, { 
    action, 
    note 
  }),

  createPlan: (data) =>
    axiosClient.post("/admin/plan/create", data),
  getPlans: () =>
    axiosClient.get("/admin/properties"),
  getPlanById: (id) =>
    axiosClient.get(`/admin/plan/${id}`),
  updatePlan: (id, data) =>
    axiosClient.put(`/admin/plan/update/${id}`, data),
  deletePlan: (id) =>
    axiosClient.delete(`/admin/plan/delete/${id}`),


  // user rank and parent update 
  updateUserSponsor: (data) =>
    axiosClient.put("/admin/user/profile/update", data),
  updateUserRank: (data) =>
    axiosClient.put("/admin/user/profile/update", data),


  // Lavel plains
  createLavelPlans: (data) =>
    axiosClient.post("/admin/level-plan/create", data),
  getLevelPlans: (page = 1, limit = 10) =>
    axiosClient.get(`/admin/level-plans?page=${page}&limit=${limit}`),
  updateLavelPlan: (id, data) =>
    axiosClient.put(`/admin/level-plan/update/${id}`, data),
  deleteLavelPlan: (id) => axiosClient.delete(`/admin/level-plan/delete/${id}`),

  // bonanza plains
  createBonanzaPlans: (data) =>
    axiosClient.post("/admin/bonanza-plan/create", data),
  getBonanzaPlans: () => axiosClient.get("/admin/bonanza-plans"),
  updateBonanzaPlan: (id, data) =>
    axiosClient.put(`/admin/bonanza-plan/update/${id}`, data),
  deleteBonanzaPlan: (id) =>
    axiosClient.delete(`/admin/bonanza-plan/delete/${id}`),

  //Reports

  getRankAchievementHistory: (page, limit, startDate, endDate, user_id) =>
    axiosClient.get(`/admin/report/get-rank-achivement-report?page=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&user_id=${user_id}`),

  // getDashboardStats: () => axiosClient.get("/admin/dashboard"),
  // getUsers: () => axiosClient.get("/admin/users"),
  // createUser: (data) => axiosClient.post("/admin/users", data),
  // updateUser: (id, data) => axiosClient.put(`/admin/users/${id}`, data),
  // deleteUser: (id) => axiosClient.delete(`/admin/users/${id}`),
};

// previous

/** ====== READ ====== */
// const { data: users, isLoading, error } = useQuery({
//     queryKey: ["userData"], // Unique cache key
//     queryFn: async () => {
//         const res = await adminApi.getUserData();
//         return res.data; // Axios wraps response in res.data
//     },
//     refetchOnWindowFocus: false, // Optional override
// });

// const { data: users = [],  isLoading,   isError} = useQuery({
//     queryKey: ["userData"],
//     queryFn: async () => {
//         const res = await adminApi.getUserData();
//         return res?.data?.users || [];
//     },
//     onSuccess: (data) => {
//         toast.success(`Fetched ${data.length} users successfully.`);
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to fetch user data.";
//         toast.error(message);
//     },
//     refetchOnWindowFocus: false,
//     staleTime: 5 * 60 * 1000,
// });

// Create bonanza plan
// const { mutate: createBonanza, isPending: isCreating } = useMutation({
//     mutationFn: (data) => adminApi.createBonanzaPlans(data),
//     onSuccess: (res) => {
//         toast.success(res?.data?.message || "Bonanza plan created successfully.");
//         queryClient.invalidateQueries(["bonanzaPlans"]);
//         closeModal();
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to create bonanza plan.";
//         toast.error(message);
//     },
// });

// Update bonanza plan
// const { mutate: updateBonanza, isPending: isUpdating } = useMutation({
//     mutationFn: ({ id, data }) => adminApi.updateBonanzaPlan(id, data),
//     onSuccess: (res) => {
//         toast.success(res?.data?.message || "Bonanza plan updated successfully.");
//         queryClient.invalidateQueries(["bonanzaPlans"]);
//         closeModal();
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to update bonanza plan.";
//         toast.error(message);
//     },
// });

// Delete bonanza plan
// const { mutate: deleteBonanza, isPending: isDeleting } = useMutation({
//     mutationFn: (id) => adminApi.deleteBonanzaPlan(id),
//     onSuccess: (res) => {
//         toast.success(res?.data?.message || "Bonanza plan deleted successfully.");
//         queryClient.invalidateQueries(["bonanzaPlans"]);
//     },
//     onError: (err) => {
//         const message =
//             err?.response?.data?.message ||
//             err?.data?.message ||
//             err?.message ||
//             "Failed to delete bonanza plan.";
//         toast.error(message);
//     },
// });








// src/Admin/Service/adminApi.js
// import axiosClient from "../../api/axiosClient";

// export const adminApi = {
//   /* ================= AUTH ================= */
//   adminLogin: (data) => axiosClient.post("/admin/auth/login", data),
//   forgetPassword: (data) =>
//     axiosClient.post("/admin/auth/forgot-password", data),
//   resetPassword: (data) =>
//     axiosClient.post("/admin/auth/reset-password", data),

//   signupOtp: (data) => axiosClient.post("/admin/auth/signup", data),
//   signupVarifyOtp: (data) =>
//     axiosClient.post("/admin/auth/verify-otp", data),
//   resendSignUpOtp: (data) =>
//     axiosClient.post("/admin/auth/resend-otp", data),

//   /* ================= USERS ================= */
//   getUserData: () => axiosClient.get("/admin/users"),
//   adminLoginAsUser: (data) =>
//     axiosClient.post("/admin/admin/login-as-user", data),
//   updateUserData: (id, data) =>
//     axiosClient.put(`/admin/user/update-status/${id}`, data),

//   /* ================= DASHBOARD ================= */
//   getDashboardData: () => axiosClient.get("/admin/dashboard"),
//   getSessionLog: () => axiosClient.get("/admin/login-log"),

//   /* ================= WALLET ================= */
//   updateUserWalletAddress: (data) =>
//     axiosClient.put("/admin/user/update-wallet-address", data),
//   getWalletUpdateLogs: () =>
//     axiosClient.get("/admin/wallet-update-logs"),

//   /* ================= REPORTS ================= */
//   getAdminReport: (type) =>
//     axiosClient.get("/admin/swap-report", { params: { type } }),
//   getPerDayIncomeReport: () =>
//     axiosClient.get("/admin/history/roi-distribution-history"),
//   getReferralIncomeReport: () =>
//     axiosClient.get("/admin/history/referral-history"),
//   getLevelIncomeReport: (page, limit) =>
//     axiosClient.get(`/admin/level-income-rewards?page=${page}&limit=${limit}`),
//   getBonanzaRewardsReport: () =>
//     axiosClient.get("/admin/history/bonanza-reward-history"),

//   /* ================= WITHDRAW ================= */
//   getWithdrawals: () =>
//     axiosClient.get("/admin/user/withdrawals"),
//   postWithdrawalApprovel: (data) =>
//     axiosClient.post("/admin/user/withdrawal/approve", data),

//   /* ================= TRADE ================= */
//   addTradeDeposit: (data) =>
//     axiosClient.post("/admin/trade/deposit", data),
//   addTradeWithdrawal: (data) =>
//     axiosClient.post("/admin/trade/withdrawal", data),
//   addTradeProfitWithdrawal: (data) =>
//     axiosClient.post("/admin/trade/profit-withdrawal", data),

//   /* ================= PACKAGES ================= */
//   createInvestmentPackages: (data) =>
//     axiosClient.post("/admin/package/create", data),
//   getInvestmentPackages: () =>
//     axiosClient.get("/admin/packages"),
//   deleteInvestmentPackages: (id) =>
//     axiosClient.delete(`/admin/package/delete/${id}`),

//   /* ================= PROPERTY ================= */
//   createProperty: (data) =>
//     axiosClient.post("/admin/property/register", data),
//   getProperties: () =>
//     axiosClient.get("/admin/properties"),
//   getPropertyById: (id) =>
//     axiosClient.get(`/admin/property/${id}`),
//   updateProperty: (id, data) =>
//     axiosClient.put(`/admin/property/update/${id}`, data),
//   deleteProperty: (id) =>
//     axiosClient.delete(`/admin/property/delete/${id}`),

//   /* ================= LEVEL PLANS ================= */
//   createLavelPlans: (data) =>
//     axiosClient.post("/admin/level-plan/create", data),
//   getLevelPlans: (page = 1, limit = 10) =>
//     axiosClient.get(`/admin/level-plans?page=${page}&limit=${limit}`),
//   updateLavelPlan: (id, data) =>
//     axiosClient.put(`/admin/level-plan/update/${id}`, data),
//   deleteLavelPlan: (id) =>
//     axiosClient.delete(`/admin/level-plan/delete/${id}`),

//   /* ================= BONANZA ================= */
//   createBonanzaPlans: (data) =>
//     axiosClient.post("/admin/bonanza-plan/create", data),
//   getBonanzaPlans: () =>
//     axiosClient.get("/admin/bonanza-plans"),
//   updateBonanzaPlan: (id, data) =>
//     axiosClient.put(`/admin/bonanza-plan/update/${id}`, data),
//   deleteBonanzaPlan: (id) =>
//     axiosClient.delete(`/admin/bonanza-plan/delete/${id}`),
// };
