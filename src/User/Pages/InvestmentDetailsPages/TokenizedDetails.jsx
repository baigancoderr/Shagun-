import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getTokenizedProperties } from "../../Data/tokenizedProperties";

import TokenizedLeft from "./components/TokenizedLeft";
import TokenizedSidebar from "./components/TokenizedSidebar";

export default function TokenizedDetails() {
  const { id } = useParams();          // URL se id
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const data = await getTokenizedProperties(); // API call
        // const found = data.find((p) => p.id === id); // id match
        const found = data.find(p => String(p.id) === String(id));


        setProperty(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  /* ---------- STATES ---------- */

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!property) {
    return <div className="p-10 text-center">Property not found</div>;
  }

  /* ---------- UI ---------- */

  return (
    <div className="space-y-8 dmfont">
      <div>
        <h2 className="text-3xl font-Medium text-[#101828] pb-2">
          Investment
        </h2>
        <p className="text-[16px] text-[#4A5565]">
          Explore investment opportunities in real estate
        </p>
      </div>

      <div className="max-w-7xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TokenizedLeft property={property} />
        </div>

        <div className="lg:col-span-1">
          <TokenizedSidebar property={property} />
        </div>
      </div>
    </div>
  );
}

