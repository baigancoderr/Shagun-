// src/services/getTokenizedProperties.js

import axios from "axios";
import { appConfig } from "../../config/appConfig";

export const getTokenizedProperties = async () => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (!token) {
    console.error("❌ authToken not found (user not logged in)");
    return [];
  }

  try {
    const res = await axios.get(`${appConfig.baseURL}/user/properties/listed`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res?.data?.data?.length) return [];

    return res.data.data
      .filter((p) => p.category === "TOKENIZED")
      .map((p) => ({
        id: p.property_id,
        backendId: p.property_id,

        title: p.title,
        slug: p.slug,
        location: p.location,
        description: p.description,

        images: p.images || [],
        image: p.image || p.images?.[0] || null,

        // Blockchain & Token Info
        network: p.overview?.blockchain?.network,
        token_address: p.token_address,
        chain: p.chain,
        transferable: p.overview?.blockchain?.transferable ? "Yes" : "No",

        // Pricing (Important for USD/SQFT)
        minInvestment: p.min_invest || 0,
        propertyValue: p.property_total_value_usd || 0,
        propertyTotalArea: p.property_total_area || 0,
        property_per_sqft_price_usd: p.property_per_sqft_price_usd || 0,
        property_totalAreaPurchased: p.property_totalAreaPurchased || 0,
        property_totalAvailableArea: p.property_totalAvailableArea || 0,
        tokenPrice: p.tokenPrice || 0,
        tokenValue: p.tokenPrice || 0,

        total_tokens_supply: Number(p.total_tokens_supply) || 0,
        available_tokens_supply: Number(p.available_tokens_supply) || 0,
        sold_tokens_supply: Number(p.sold_tokens_supply) || 0,
        

        rental_percentage: p.rental_percentage || 0,

        // Growth from financials
        growth: p.financials?.metrics?.valueGrowth || 0,

        // Token Supply & Availability
        totaltoken: Number(p.overview?.blockchain?.totalSupply) || 0,
        avaitoken: p.property_totalAvailableArea || 0, // fallback
        mininvest: p.min_invest || 25000,

        // Other fields
        tokenHolders: p.totalHolders || 0,
        volume: 0, // not available in current schema
        MarketCap: p.property_total_value_usd || 0,
        initTokePri: p.tokenPrice || 0,

        beds: p.beds || 0,
        baths: p.baths || 0,
        area: p.area || "",

        // Documents (proper mapping)
        documents: (p.documents || []).map((d) => ({
          title: d.title || d.name,
          type: d.type,
          url: d.link || d.url,
        })),

        // Extra useful fields
        financials: p.financials || { metrics: {}, breakdown: [] },
        marketplace: p.marketplace || { listings: [] },
      }));
  } catch (error) {
    console.error(
      "❌ Tokenized fetch failed:",
      error?.response?.status,
      error?.message,
    );
    return [];
  }
};
