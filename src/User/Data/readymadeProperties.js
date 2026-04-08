// src/services/getReadymadeProperties.js

import axios from "axios";
import { appConfig } from "../../config/appConfig";

export const getReadymadeProperties = async () => {
  const token =
    localStorage.getItem("authToken") ||
    sessionStorage.getItem("authToken");

  if (!token) {
    console.error("❌ authToken not found");
    return [];
  }

  try {
    const res = await axios.get(
      `${appConfig.baseURL}/user/properties/listed`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res?.data?.data?.length) return [];

    return res.data.data
      .filter((p) => p.category === "READY_MADE")
      .map((p) => ({
        // Core Info
        backendId: p.property_id,
        id: p.property_id,
        slug: p.slug,
        category: "readymade",

        title: p.title,
        location: p.location,
        description: p.description,

        image: p.image || p.images?.[0] || null,
        gallery: p.gallery?.length ? p.gallery : p.images || [],


        // Pricing & Investment (directly from schema)
        minInvestment: p.min_invest || 0,
        propertyValue: p.property_total_value_usd || 0,
        propertyTotalArea: p.property_total_area || 0,
        property_per_sqft_price_usd: p.property_per_sqft_price_usd || 0,
        property_totalAreaPurchased: p.property_totalAreaPurchased || 0,
        property_totalAvailableArea: p.property_totalAvailableArea || 0,
        tokenPrice: p.tokenPrice || 0,
        tokenValue: p.tokenPrice || 0,

        rental_percentage: p.rental_percentage || 0,

        // Stats
        stats: {
          beds: p.beds ?? 0,
          baths: p.baths ?? 0,
          area: p.area || "N/A",
          listed: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString("en-IN")
            : "N/A",
        },

        // Amenities
        amenities: p.amenities?.length
          ? p.amenities
          : p.overview?.amenities || [],

        // Documents (mapped to component format)
        documents: (p.documents || []).map((d) => ({
          title: d.title || d.name || "Document",
          type: d.type || "PDF",
          url: d.link || d.url || "#",
        })),



        // Financials
        financials: p.financials || { metrics: {}, breakdown: [] },

        // Other fields used in ReadymadeLeft component
        growth: `${p.financials?.metrics?.valueGrowth || 0}%`,
        transferable: "Yes",
        risk: p.risk_level || "Medium Risk",
        deal: p.deal || "Hot Deal",
        rate: "+12%",                    // You can make dynamic later
        progress: "113 / 200 slots",     // Add totalSlots field later if needed

        defaultInvestment: 1,
        monthlyIncome: 0,
        annualIncome: 0,
        sharetobuy: 1,

        partner: p.partner || {},
      }));
  } catch (err) {
    console.error("❌ Readymade fetch failed:", err?.response?.data || err.message);
    return [];
  }
};