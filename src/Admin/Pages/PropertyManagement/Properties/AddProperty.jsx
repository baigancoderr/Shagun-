import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { adminApi } from "../../../Service/adminApi";
import { appConfig } from '../../../../config/appConfig';

const PINATA_JWT = appConfig.PINATA_JWT;

export default function AddInvestmentPlan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState({
    plan_name: "",
    slug: "",
    image: null, // string (url) or {preview, file}
    investment_amount: "",
    quantity: "",
    details: "",
  });

  // Helpers
  const generateSlug = (text) =>
    text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

  const onChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const onNameChange = (e) => {
    const plan_name = e.target.value;
    setData((prev) => ({ ...prev, plan_name, slug: generateSlug(plan_name) }));
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData((prev) => ({ ...prev, image: { preview: URL.createObjectURL(file), file } }));
    }
  };

  const removeImage = () => {
    if (data.image?.preview?.startsWith("blob:")) {
      URL.revokeObjectURL(data.image.preview);
    }
    setData((prev) => ({ ...prev, image: null }));
  };

  // Fetch existing plan (edit mode)
  const { data: planRes } = useQuery({
    queryKey: ["plan", id],
    queryFn: () => adminApi.getPlanById(id), // Assuming adminApi.getPlanById
    enabled: !!id,
  });

  useEffect(() => {
    if (!id || !planRes) return;

    const p = planRes?.data?.data || planRes?.data || planRes;

    if (!p) return;

    setData({
      plan_name: p.plan_name || "",
      slug: p.slug || generateSlug(p.plan_name || ""),
      image: p.image || null,
      investment_amount: p.investment_amount || "",
      quantity: p.quantity || "",
      details: p.details || "",
    });
  }, [planRes, id]);

  useEffect(() => {
    return () => {
      if (data.image?.preview?.startsWith("blob:")) {
        URL.revokeObjectURL(data.image.preview);
      }
    };
  }, [data.image]);

  // Save / Publish
  const savePlanMutation = useMutation({
    mutationFn: (payload) =>
      id ? adminApi.updatePlan(id, payload) : adminApi.createPlan(payload), // Assuming adminApi.createPlan and updatePlan
    onSuccess: () => {
      toast.success(id ? "Plan updated!" : "Plan created!");
      navigate("/admin/property-management/add-property-plan");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Something went wrong");
    },
  });

  const isFormValid = () => {
    const name = data.plan_name?.toString().trim();
    return name && data.slug && data.investment_amount && data.quantity && data.details;
  };

  const uploadToPinata = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);
      formData.append("network", "public");
      const res = await fetch("https://uploads.pinata.cloud/v3/files", {
        method: "POST",
        headers: { Authorization: `Bearer ${PINATA_JWT}` },
        body: formData,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const json = await res.json();
      const cid = json.data.cid;
      return `https://gateway.pinata.cloud/ipfs/${cid}`;
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
      return null;
    }
  };

  const handlePublish = async () => {
    if (!isFormValid()) {
      toast.error("Please fill all required fields");
      return;
    }

    let imageUrl = typeof data.image === "string" ? data.image : null;

    if (data.image?.file) {
      imageUrl = await uploadToPinata(data.image.file);
      if (!imageUrl) return;
    }

    const payload = {
      plan_name: data.plan_name.trim(),
      slug: data.slug,
      image: imageUrl,
      investment_amount: Number(data.investment_amount),
      quantity: Number(data.quantity),
      details: data.details,
    };

    console.log("Final Payload for API:", payload); // for debugging
    savePlanMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {id ? "Edit Investment Plan" : "Add Investment Plan"}
        </h1>

        {/* BASIC INFO */}
        <Card title="Basic Info">
          <TwoGrid>
            <Input label="Plan Name" name="plan_name" value={data.plan_name} onChange={onNameChange} required />
            <Input label="Slug" name="slug" value={data.slug} readOnly />
            <Input type="number" label="Investment Amount (USD)" name="investment_amount" value={data.investment_amount} onChange={onChange} min="0" required />
            <Input type="number" label="Quantity" name="quantity" value={data.quantity} onChange={onChange} min="0" required />
          </TwoGrid>
        </Card>

        {/* DESCRIPTION */}
        <Card title="Details">
          <Textarea name="details" value={data.details} onChange={onChange} required />
        </Card>

        {/* MEDIA */}
        <Card title="Image">
          <Upload label="Upload Image" accept="image/*" onChange={onFileChange} />
          {data.image && (
            <div className="mt-4">
              <div className="relative inline-block">
                <img
                  src={typeof data.image === "string" ? data.image : data.image.preview}
                  className="h-48 w-auto rounded border object-cover"
                  alt="Plan Image"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white px-2 py-1 rounded"
                >
                  X
                </button>
              </div>
            </div>
          )}
        </Card>

        {/* ACTIONS */}
        <div className="flex justify-end gap-4">
          <button className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">Save Draft</button>
          <button
            onClick={handlePublish}
            disabled={savePlanMutation.isLoading || !isFormValid()}
            className="px-8 py-3 rounded-lg bg-[#103944] text-white disabled:opacity-50"
          >
            {savePlanMutation.isLoading ? "Saving..." : id ? "Update Plan" : "Publish Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* UI COMPONENTS */
const Card = ({ title, children }) => (
  <div className="bg-white p-6 rounded-xl border space-y-4">
    <h2 className="font-medium text-gray-900">{title}</h2>
    {children}
  </div>
);

const TwoGrid = ({ children }) => <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;

const Input = ({ label, required, ...props }) => (
  <div>
    <label className="text-sm text-gray-700">{label} {required && <span className="text-red-500">*</span>}</label>
    <input className="w-full mt-1 border px-3 py-2 rounded" {...props} />
  </div>
);

const Textarea = (props) => <textarea rows="6" className="w-full border px-3 py-2 rounded" {...props} />;

const Upload = ({ label, ...props }) => (
  <label className="border-2 border-dashed p-6 rounded text-center cursor-pointer block">
    <p className="text-sm">{label}</p>
    <input type="file" className="hidden" {...props} />
  </label>
);