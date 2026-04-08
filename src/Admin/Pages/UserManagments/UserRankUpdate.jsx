import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../Service/adminApi"; // Adjust the import path as needed

const UserRankUpdate = () => {
  const [formData, setFormData] = useState({
    userId: "",
    newRank: "",
  });
  const [errors, setErrors] = useState({});

  const { mutate: updateRank, isPending } = useMutation({
    mutationFn: (data) => adminApi.updateUserRank(data), // Assuming adminApi has an updateUserRank method; adjust if needed (e.g., to updateUserProfile)
    onSuccess: (res) => {
      toast.success(res?.data?.message || "User rank updated successfully!");
      setFormData({ userId: "", newRank: "" });
      setErrors({});
    },
    onError: (err) => {
      const message =
        err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Failed to update user rank.";
      toast.error(message);
    },
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.userId.trim()) {
      newErrors.userId = "User ID is required";
    }
    if (!formData.newRank.trim()) {
      newErrors.newRank = "New Rank is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateRank({
        user_id: formData.userId.trim(),
        new_rank: formData.newRank.trim(),
      });
    }
  };

  const ranks = ["Starter", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Crown/Royal"];

  return (
    <div className="min-h-screen bg-[#fff] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Update User Rank
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="userId"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              User ID
            </label>
            <input
              id="userId"
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`w-full border ${errors.userId ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              placeholder="Enter User ID (e.g., URWA00004)"
              aria-invalid={!!errors.userId}
              aria-describedby={errors.userId ? "userId-error" : undefined}
            />
            {errors.userId && (
              <p id="userId-error" className="text-red-500 text-xs mt-1">
                {errors.userId}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newRank"
              className="block text-[16px] font-medium text-[#103944] mb-1"
            >
              New Rank
            </label>
            <select
              id="newRank"
              name="newRank"
              value={formData.newRank}
              onChange={handleChange}
              className={`w-full border ${errors.newRank ? "border-red-500" : "border-gray-300"
                } px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 shadow-sm hover:shadow-md`}
              disabled={isPending}
              required
              aria-invalid={!!errors.newRank}
              aria-describedby={errors.newRank ? "newRank-error" : undefined}
            >
              <option value="">Select Rank</option>
              {ranks.map((rank) => (
                <option key={rank} value={rank}>
                  {rank}
                </option>
              ))}
            </select>
            {errors.newRank && (
              <p id="newRank-error" className="text-red-500 text-xs mt-1">
                {errors.newRank}
              </p>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="w-[160px] mt-4 bg-[#103944] hover:bg-[#0e9d52] text-white font-medium py-2 px-4 rounded-md transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:scale-100"
              disabled={isPending}
              aria-label="Submit update"
            >
              {isPending ? "Submitting..." : "Update Rank"}
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
};

export default UserRankUpdate;