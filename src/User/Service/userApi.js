import axiosClient from "../../User/api/axiosClient";

export const userApi = {

    //Investment Plans and reports
  getListedPlans: () => axiosClient.get("/user/plan/listed"),
  investInPlan: (payload) => axiosClient.post('/user/plan/invest', payload),
  getUserInvestments: (page, limit, startDate, endDate) =>
    axiosClient.get(`/user/investments`, {
      params: { page, limit, startDate, endDate },
    }),
};
