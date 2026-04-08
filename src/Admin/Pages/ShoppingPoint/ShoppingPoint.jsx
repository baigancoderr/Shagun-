import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi } from "../../Service/adminApi";

const ShoppingPoint = () => {
  const queryClient = useQueryClient();

  const [walletConnected, setWalletConnected] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchType, setSearchType] = useState("general");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [shoppingPoints, setShoppingPoints] = useState({});     
  const [loyaltyPoints, setLoyaltyPoints] = useState({});       
  const [totalLoyaltyPoints, setTotalLoyaltyPoints] = useState(0);

  const handleConnectWallet = () => {
    setWalletConnected(true);
    toast.success("Wallet Connected ✅");
  };

  // Fetch Users
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getUserData", pagination.pageIndex, pagination.pageSize, searchInput, searchType],
    queryFn: async () => {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const search = searchType === "general" ? searchInput : "";
      const user_id = searchType === "user_id" ? searchInput : "";

      const res = await adminApi.getUserData(page, limit, search, user_id);
      return {
        users: res?.data?.users || [],
        totalPages: res?.data?.totalPages || 1,
      };
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });

  const fetchData = data?.users || [];
  const pageCount = data?.totalPages || 1;

  // Reset pagination on search
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [searchInput, searchType]);

  // Normalize Users
  const normalizedUsers = useMemo(() => {
    return fetchData.map((user, index) => ({
      id: user.user_id || user.id || `URWA${String(10000 + index).padStart(5, "0")}`,
      username: `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "N/A",
      sponsorId: user.sponsor_id || "N/A",
      originalUser: user,
    }));
  }, [fetchData]);

  // Handle Shopping Points Change
  const handleShoppingPointsChange = (userId, value) => {
    setShoppingPoints((prev) => ({ ...prev, [userId]: value }));
  };

  // Send Airdrop
  const handleSendAirdrop = async (user) => {
    const points = shoppingPoints[user.id];

    if (!points || parseFloat(points) <= 0) {
      toast.error("Please enter valid Shopping Points");
      return;
    }

    const earnedLoyalty = parseFloat(points);

    // Save for this user
    setLoyaltyPoints((prev) => ({
      ...prev,
      [user.id]: earnedLoyalty,
    }));

    // Add to Total
    setTotalLoyaltyPoints((prev) => prev + earnedLoyalty);

    try {
      // TODO: Actual API call
      // await adminApi.sendAirdrop({ userId: user.id, shoppingPoints: points, loyaltyPoints: earnedLoyalty });

      toast.success(`✅ Airdrop Sent!\nShopping Points: ${points} | Loyalty Points: ${earnedLoyalty}`);

      // Clear input
      setShoppingPoints((prev) => ({ ...prev, [user.id]: "" }));

    } catch (err) {
      toast.error("Failed to send airdrop");
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading users...</div>;
  if (isError) return <div className="p-6 text-red-600">Error: {error?.message}</div>;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-[#103944]">Airdrop Management</h2>

      {/* Stats Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
          <span className="text-gray-500 text-sm">Total Users</span>
          <span className="text-4xl font-bold text-[#103944] mt-2">
            {normalizedUsers.length}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col">
          <span className="text-gray-500 text-sm">Total Shopping Points</span>
          <span className="text-4xl font-bold text-[#103944] mt-2">
            {totalLoyaltyPoints.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Search & Export */}
      <div className="mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <button
          onClick={() => toast.info("Export functionality coming soon")}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full lg:w-auto"
        >
          Export Excel
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#103944]"
          >
            <option value="general">General Search</option>
            <option value="user_id">Search by User ID</option>
          </select>

          <input
            placeholder={searchType === "user_id" ? "Enter User ID..." : "Search by Username or ID..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#103944] flex-1"
          />

          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
            className="bg-[#103944] hover:bg-[#0e2a33] text-white px-8 py-3 rounded-lg"
          >
            Search
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow border">
        <table className="min-w-full text-sm">
          <thead className="bg-[#103944] text-white">
            <tr>
              <th className="px-6 py-4 text-left">S.No.</th>
              <th className="px-6 py-4 text-left">User ID</th>
              <th className="px-6 py-4 text-left">Username</th>
              <th className="px-6 py-4 text-left">Sponsor ID</th>
              <th className="px-6 py-4 text-left">Shopping Points</th>
              <th className="px-6 py-4 text-left">Loyalty Points</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {normalizedUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{pagination.pageIndex * pagination.pageSize + index + 1}</td>
                <td className="px-6 py-4 font-medium">{user.id}</td>
                <td className="px-6 py-4">{user.username}</td>
                <td className="px-6 py-4 font-medium text-gray-700">{user.sponsorId}</td>

                {/* Shopping Points Input */}
                <td className="px-6 py-4">
                  <input
                    type="number"
                    placeholder="Enter points"
                    value={shoppingPoints[user.id] || ""}
                    onChange={(e) => handleShoppingPointsChange(user.id, e.target.value)}
                    className="w-40 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#103944]"
                  />
                </td>

                {/* Loyalty Points (Saved & Read-only) */}
                <td className="px-6 py-4">
                  <div className="w-40 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-medium">
                    {loyaltyPoints[user.id] !== undefined ? loyaltyPoints[user.id] : "—"}
                  </div>
                </td>

                {/* FIXED Action Button - No Wrapping */}
                <td className="px-6 py-4 text-center">
                  {walletConnected ? (
                    <button
                      onClick={() => handleSendAirdrop(user)}
                      className="bg-[#103944] hover:bg-[#0e2a33] text-white px-8 py-3 rounded-lg font-medium transition-all whitespace-nowrap min-w-[140px]"
                    >
                      Send Airdrop
                    </button>
                  ) : (
                    <button
                      onClick={handleConnectWallet}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap min-w-[140px]"
                    >
                      Connect Wallet
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end mt-6 gap-4">
        <span className="text-sm text-gray-600">
          Page {pagination.pageIndex + 1} of {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: Math.max(prev.pageIndex - 1, 0) }))}
            disabled={pagination.pageIndex === 0}
            className="px-5 py-2 bg-[#103944] text-white rounded disabled:bg-gray-300"
          >
            Prev
          </button>
          <button
            onClick={() => setPagination((prev) => ({ ...prev, pageIndex: prev.pageIndex + 1 }))}
            disabled={pagination.pageIndex + 1 >= pageCount}
            className="px-5 py-2 bg-[#103944] text-white rounded disabled:bg-gray-300"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingPoint;