import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { BiArrowBack } from "react-icons/bi";

import { getReadymadeProperties } from "../../Data/readymadeProperties";   // ← yeh function use karo

import ReadymadeLeft from "./components/ReadymadeLeft";
import ReadymadeSidebar from "./components/ReadymadeSidebar";

export default function ReadymadeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("About Property");


  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const allReadymade = await getReadymadeProperties(); // API call
        const found = allReadymade.find(p => String(p.id) === String(id));

        setProperty(found || null);
      } catch (err) {
        console.error("Error loading readymade property:", err);
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  if (loading) {
    return <div className="p-10 text-center">Loading property details...</div>;
  }

  if (!property) {
    return (
      <div className="p-10 text-center">
        <p>Property not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-1 sm:px-3 lg:px-6 py-8 space-y-6 dmfont">

      {/* Back Button */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 cursor-pointer transition"
      >
        <BiArrowBack className="text-lg" />
        <span>Back to Readymade Projects</span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ReadymadeLeft
            property={property}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        <div className="lg:col-span-1">
          <ReadymadeSidebar
            property={property}
            setActiveTab={setActiveTab}
          />
        </div>
      </div>
    </div>
  );
}

