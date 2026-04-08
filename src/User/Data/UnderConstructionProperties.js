import axios from "axios";
import { appConfig } from "../../config/appConfig";

export const getUnderConstructionProperties = async () => {
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
      .filter((p) => p.category === "UNDER_CONSTRUCTION")
      .map((p) => ({
        id: p.property_id,
        backendId: p.property_id,
        slug: p.slug,
        category: "construction",

        title: p.title,
        location: p.location,

        // Construction specific fields
        construction:
          p.construction || p.construction_stage || "Under Construction",
        projectCompletion:
          p.projectCompletion || p.construction_stage || "Under Construction",
        risk: p.risk_level || "Medium Risk",
        risklevel: p.status || "AVAILABLE",

        Started: p.StartDate || "N/A",
        EndDate: p.Enddate || "N/A",
        structure: p.structure || p.construction_stage || "N/A",

        images: p.images || p.gallery || [],
        exit: p.exit || "Withdraw after completion",

        minInvestment: p.min_invest || 0,
        propertyValue: p.property_total_value_usd || 0,
        propertyTotalArea: p.property_total_area || 0,
        property_per_sqft_price_usd: p.property_per_sqft_price_usd || 0,
        property_totalAreaPurchased: p.property_totalAreaPurchased || 0,
        property_totalAvailableArea: p.property_totalAvailableArea || 0,
        tokenPrice: p.tokenPrice || 0,
        tokenValue: p.tokenPrice || 0,

        rental_percentage: p.rental_percentage || 0,

        overallprogress: Number(p.overallprogress || p.sidebar?.progress || 0),

        // Sidebar
        sidebar: {
          totalValue:
            p.sidebar?.totalValue ||
            `$${parseInt(p.property_total_value_usd || 0).toLocaleString()}M`,
          minInv: p.sidebar?.minInv || p.min_invest || 0,
          expectedROI:
            p.sidebar?.expectedROI ||
            `${p.financials?.metrics?.valueGrowth || 0}%`,
          duration: p.sidebar?.duration || "N/A",
          completion: p.sidebar?.completion || p.expectedCompletion || "N/A",
          progress: Number(p.sidebar?.progress || p.overallprogress || 0),
          funprogress: Number(p.sidebar?.funprogress || 0),
          investors: p.sidebar?.investors || p.totalHolders || 0,
          raised:
            p.sidebar?.raised ||
            `$${parseInt(p.total_usd_collect || 0).toLocaleString()}M`,
        },

        // Tabs
        tabs: p.tabs || {
          overview: {
            about: p.description || p.overview?.about || "",
            details: {
              beds: p.beds || 0,
              baths: p.baths || 0,
              area: p.area || "N/A",
            },
            team: p.tabs?.overview?.team || [],
            amenities: p.overview?.amenities || p.amenities || [],
          },
          milestones: p.tabs?.milestones || [],
          calculator: {
            minInvestment:
              p.tabs?.calculator?.minInvestment || `$${p.min_invest || 0}`,
            expectedReturn:
              p.tabs?.calculator?.expectedReturn ||
              `${p.financials?.metrics?.valueGrowth || 0}%`,
            lockIn: p.tabs?.calculator?.lockIn || p.sidebar?.duration || "N/A",
          },
          documents: p.tabs?.documents || [],
        },

        // Key Features & Documents
        keyFeatures: p.keyFeatures || [],
        documents: (p.documents || []).map((d) => ({
          title: d.title || d.name || "Document",
          type: d.type || "PDF",
          link: d.link || d.url || "#",
        })),

        // Financials (used in calculator tab)
        financials: p.financials || {
          metrics: {
            annualYield: 0,
            rentalIncome: 0,
            valueGrowth: 0,
          },
          breakdown: [],
        },

        // Extra fields for safety
        pricePerSlot: p.property_per_sqft_price_usd || 0,
        tokenPrice: p.tokenPrice || 0,
      }));
  } catch (error) {
    console.error(
      "❌ Construction fetch failed:",
      error?.response?.status,
      error?.message,
    );
    return [];
  }
};
