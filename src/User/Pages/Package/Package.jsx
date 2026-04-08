import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../Service/userApi";

import "../../../web3/connect";
import {
  useAppKit,
  useAppKitAccount,
} from "@reown/appkit/react";

export default function Investments() {
  const { address } = useAppKitAccount();
  const { open } = useAppKit();

  // ================= States =================
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedQty, setSelectedQty] = useState("");

  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    amount: "",
    txHash: "",
    address: "",
  });

  // ================= Buy Now Handler =================
  const handleBuyNow = (plan) => {
    const qty = selectedQty || "1";
    const calculatedAmount = Number(plan.investment_amount) * Number(qty);

    setSelectedPlan(plan);
    setFormData({
      productId: plan.plan_id || "N/A",
      quantity: qty,
      amount: calculatedAmount.toString(),
      txHash: "",
      address: address || "",
    });
    setShowForm(true);
  };

  // ================= Live Amount Calculation =================
  useEffect(() => {
    if (selectedPlan && formData.quantity) {
      const newAmount = Number(selectedPlan.investment_amount) * Number(formData.quantity || 1);
      setFormData((prev) => ({ ...prev, amount: newAmount.toString() }));
    }
  }, [formData.quantity, selectedPlan]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= REAL API CALL - PURCHASE =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.txHash) {
      return toast.error("Transaction Hash is required");
    }

    const toastId = toast.loading("Processing purchase... ⏳");

    try {
      const payload = {
        productId: formData.productId,
        quantity: Number(formData.quantity),
        transactionHash: formData.txHash,
        walletAddress: formData.address || address,
      };

      const result = await userApi.investInPlan(payload);

      if (result.status === "success") {
        toast.success("Purchase successful! 🚀", { id: toastId });

        // Reset form
        setFormData({ productId: "", quantity: "", amount: "", txHash: "", address: "" });
        setSelectedQty("");
        setSelectedPlan(null);
        setShowForm(false);
      } else {
        throw new Error(result.message || "Purchase failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Something went wrong ❌", { id: toastId });
    }
  };

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = showForm ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showForm]);

  // ================= Fetch Plans =================
  const {
    data: plans = [],
    isFetching: plansLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["listedPlans"],
    queryFn: async () => {
      const result = await userApi.getListedPlans();
      if (result.status === "error") throw new Error(result.message || "Access denied");
      return result.data || [];
    },
    refetchOnWindowFocus: false,
  });

  const errorMessage = isError
    ? error?.message === "Access denied"
      ? "Access denied. Please log in with a User account (not Admin)."
      : error?.message || "Failed to load investment packages"
    : "";

  return (
    <div className="space-y-8 dmfont">
      {/* Header */}
      <div>
        <h2 className="text-3xl dmfont font-Medium text-[#FF6000] pb-2">Package Investment</h2>
        <p className="text-[16px] font-Regular dmfont text-[#fff]">Explore packages</p>
      </div>

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-center text-sm">
          {errorMessage}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {plansLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[400px] lg:h-[380px] xl:h-[400px] rounded-2xl bg-white/10 animate-pulse border border-white/10" />
          ))
        ) : plans.length === 0 && !isError ? (
          <div className="col-span-full py-12 text-center text-white/60 text-lg">
            No investment packages available right now.
          </div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan._id || plan.plan_id}
              className="group border-gradient theme-card-style rounded-2xl p-6 h-[400px] lg:h-[380px] xl:h-[400px] flex flex-col text-center transition-all duration-500 overflow-hidden"
            >
              <h3 className="text-[24px] font-bold text-[#FF6000] mb-2">{plan.plan_name}</h3>
              <h2 className="text-[28px] font-extrabold text-white leading-none mb-4">
                ₹{Number(plan.investment_amount).toLocaleString()}
              </h2>

              <div className="relative flex-1 w-full">
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 group-hover:opacity-0 group-hover:-translate-y-3">
                  <img
                    src={plan.image}
                    alt={plan.plan_name}
                    className="max-h-full w-full object-contain"
                    onError={(e) => (e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found")}
                  />
                </div>

                <div className="absolute inset-0 opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 flex flex-col justify-between">
                  <div>
                    <div className="w-full flex items-start gap-3 mb-6">
                      <div className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-5 text-[16px] leading-7 text-white/90">
                        {plan.details}
                      </div>
                    </div>

                    <div className="w-full flex items-center gap-2 mb-1 flex-wrap justify-center">
                      <span className="text-white font-semibold text-[18px]">QTY:</span>
                      {[1, 2, 5, 10].map((qty) => (
                        <button
                          key={qty}
                          onClick={() => setSelectedQty(qty)}
                          className={`w-6 h-6 rounded-md font-bold text-[16px] transition-transform duration-200 ${
                            selectedQty === qty ? "bg-[#FF6000] text-white scale-110" : "bg-white text-black hover:scale-105"
                          }`}
                        >
                          {qty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => (address ? handleBuyNow(plan) : open())}
                    className="group/btn relative overflow-hidden px-6 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-[#FF7A00] via-[#FF6000] to-[#E3090D] border border-[#ffcf99]/30 shadow-[0_8px_0_#a12a00,0_14px_28px_rgba(255,102,0,0.35)] transition-all duration-300 ease-out hover:shadow-[0_6px_0_#a12a00,0_10px_20px_rgba(227,9,13,0.45)] hover:from-[#E3090D] hover:via-[#FF6000] hover:to-[#FF7A00] active:translate-y-[1px]"
                  >
                    <span className="relative z-10">
                      {address ? "Buy Now" : "Connect Wallet"}
                    </span>
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/10 to-white/10"></span>
                    <span className="absolute top-0 left-[-75%] h-full w-1/2 rotate-12 bg-white/20 blur-md transition-all duration-500 group-hover/btn:left-[130%]"></span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= PURCHASE FORM MODAL ================= */}
      {showForm && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="border-gradient theme-card-style rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(255,96,0,0.25)]">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="text-lg sm:text-xl font-bold text-[#ff6000]">Purchase Form</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white">✕</button>
            </div>

            <div className="overflow-y-auto px-5 py-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[12px] text-white mb-1 uppercase tracking-wider">Product ID</label>
                  <input type="text" value={formData.productId} readOnly className="w-full px-4 py-2.5 rounded bg-white/5 border border-white/10 text-white/60 text-sm" />
                </div>

                <div>
                  <label className="block text-[12px] text-white mb-1 uppercase tracking-wider">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded bg-white/5 border border-white/15 text-white text-sm focus:border-[#FF6000]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-white mb-1 uppercase tracking-wider">Amount (USDT)</label>
                  <input
                    type="text"
                    value={`₹${Number(formData.amount).toLocaleString()}`}
                    readOnly
                    className="w-full px-4 py-2.5 rounded bg-white/5 border border-white/10 text-white text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-white mb-1 uppercase tracking-wider">Transaction Hash</label>
                  <input
                    type="text"
                    name="txHash"
                    value={formData.txHash}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded bg-white/5 border border-white/15 text-white text-sm focus:border-[#FF6000]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[12px] text-white mb-1 uppercase tracking-wider">Wallet Address</label>
                  <input type="text" value={address || ""} readOnly className="w-full px-4 py-2.5 rounded bg-white/5 border border-white/10 text-white/60 text-sm" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-[#FF7A00] via-[#FF6000] to-[#E3090D]"
                  >
                    Submit Purchase
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-6 py-2.5 rounded-xl text-white/70 bg-white/5 border border-white/15"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}