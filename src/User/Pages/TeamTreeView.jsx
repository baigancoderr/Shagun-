import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Tree from "react-d3-tree";
import axios from "axios";
import { appConfig } from "../../config/appConfig";
import { useDemoMode } from "../Contexts/DemoModeContext";
import { getDemoData } from "../Data/demoData";

const TeamTreeView = () => {
  const { isDemoMode } = useDemoMode();
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [count, setCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("All");
  const treeContainer = useRef(null);

  // Transform API data to react-d3-tree format
  const transformTreeData = useCallback((apiData) => {
    const root = apiData?.data?.data?.[0];
    if (!root) return [];

    const transformNode = (node) => {
      if (!node) return null;
      const fullName = `${node.firstName || ""} ${node.lastName || ""}`.trim();
      return {
        name: node.user_id || "Unknown",
        attributes: {
          Name: fullName || "Unknown",
          Email: node.email || "N/A",
          Sponsor: node.sponsorId || "Unknown",
          Position: node.position || "N/A",
          Self: `$${node.selfInvestment || 0}`,
          // LeftTeam: `$${node.leftTeamInvestment || 0}`,
          // RightTeam: `$${node.rightTeamInvestment || 0}`,
         Team: `$${node.leftTeamInvestment || 0}`,
          
        },
        children: node.children ? node.children.map(transformNode).filter(Boolean) : [],
      };
    };

    return [transformNode(root)];
  }, []);

  const { data: teamTreeData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["teamTree", count],
    queryFn: async () => {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
      if (!token) throw new Error("No authentication token found. Please log in.");
      const response = await axios.get(`${appConfig.baseURL}/user/team-tree-view?count=${count}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return transformTreeData(response.data);
    },
    refetchOnWindowFocus: false,
    retry: 2,
    enabled: !isDemoMode && (!!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken")),
  });

  const displayTreeData = isDemoMode
    ? transformTreeData({ data: { data: getDemoData("teamTree") } })
    : teamTreeData;

  const filteredDisplayTreeData = useMemo(() => {
    if (!displayTreeData || displayTreeData.length === 0) return [];
    if (!searchTerm && filterPosition === "All") return displayTreeData;

    const matchesSearch = (node) =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.attributes.Name && node.attributes.Name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = (node) =>
      filterPosition === "All" ||
      (node.attributes.Position && node.attributes.Position.toLowerCase() === filterPosition.toLowerCase());

    const filterNode = (node) => {
      const filteredChildren = node.children ? node.children.map(filterNode).filter(Boolean) : [];
      const nodeMatches = (searchTerm ? matchesSearch(node) : true) && matchesFilter(node);
      if (nodeMatches || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    };

    return displayTreeData.map(filterNode).filter(Boolean);
  }, [displayTreeData, searchTerm, filterPosition]);

  useEffect(() => {
    const updateTranslate = () => {
      if (treeContainer.current) {
        const dimensions = treeContainer.current.getBoundingClientRect();
        if (dimensions.width && dimensions.height) {
          setTranslate({
            x: dimensions.width / 2,
            y: dimensions.height / 4,
          });
        }
      }
    };

    updateTranslate();
    window.addEventListener("resize", updateTranslate);
    return () => window.removeEventListener("resize", updateTranslate);
  }, []);

  // ────────────────────────────────────────────────
  //   Custom node with #FF6000 / #E3090D theme
  // ────────────────────────────────────────────────
const renderNodeWithCustomStyles = useCallback(
  ({ nodeDatum, toggleNode }) => (
    <g
      role="button"
      aria-label={`Toggle node for ${nodeDatum.name || "Unknown"}`}
      tabIndex={0}
      onKeyPress={(e) => e.key === "Enter" && toggleNode()}
    >
      {/* Circle */}
      <circle r={22} fill="#FF6000" stroke="#E3090D" strokeWidth={3} />

      {/* Username - Solid White + Bold */}
      <text
        x={34}
        dy="-8"
        fontSize={15}
        fontWeight="bold"
        textAnchor="start"
        fill="#ffffff"           // ← Solid white
        stroke="none"            // ← Yeh line important hai
        paintOrder="stroke"
      >
        {nodeDatum.name || "Unknown"}
      </text>

      {/* Baaki sab texts bhi solid white */}
      {nodeDatum.attributes && (
        <>
          <text
            x={34}
            dy="12"
            fontSize={14}
            fill="#ffffff"          // ← Solid white
            fontWeight={800}
            stroke="none"
          >
            Sponsor: {nodeDatum.attributes.Sponsor || "—"}
          </text>

          <text
            x={34}
            dy="27"
            fontSize={14}
            fill="#ffffff"          // ← Solid white
            fontWeight={800}
            stroke="none"
          >
            Position: {nodeDatum.attributes.Position || "—"}
          </text>

          <text
            x={34}
            dy="42"
            fontSize={14}
            fill="#ffffff"          // ← Solid white
            fontWeight={700}
            stroke="none"
          >
            Self: {nodeDatum.attributes.Self || "$0"}
          </text>

          <text
            x={34}
            dy="57"
            fontSize={14}
            fill="#ffffff"          // ← Solid white
            fontWeight={800}
            stroke="none"
          >
            Team: {nodeDatum.attributes.Team || "$0"}   {/* Yeh bhi update kiya hai */}
          </text>
        </>
      )}

      {/* Collapse/Expand Icon (yeh already theek hai) */}
      {nodeDatum.children && nodeDatum.children.length > 0 && (
        <g onClick={toggleNode} style={{ cursor: "pointer" }}>
          <circle cx={0} cy={30} r={14} fill="#E3090D" />
          <text
            x={0}
            y={38}
            fontSize={22}
            textAnchor="middle"
            fill="white"
            stroke="none"
            pointerEvents="none"
          >
            {nodeDatum._collapsed ? "▶" : "▼"}
          </text>
        </g>
      )}
    </g>
  ),
  []
);
  
  return (
    <div
      ref={treeContainer}
      className="theme-card-style border-gradient"
      style={{ width: "100%", height: "90vh", position: "relative", overflow: "auto" }}
    >
      <style>{`
        .custom-link-path {
          stroke: #FF6000 !important;
          stroke-width: 2.5px !important;
          fill: none !important;
          opacity: 0.9;
        }
        .rd3t-node circle:hover {
          opacity: 0.85;
        }
      `}</style>

      {isDemoMode && (
        <div className="absolute right-4 top-4 bg-gradient-to-r from-[#FF6000] to-[#E3090D] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
          Demo Mode
        </div>
      )}

      <div className="text-xs absolute left-4 top-4 rounded-xl bg-black/80 border-2 border-[#FF6000] p-4 text-[#FFEDD5] shadow-lg w-fit space-y-2 z-10 backdrop-blur-sm">
        <p className="font-bold text-sm text-[#FF6000] mb-1">Fetch Levels</p>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={50}
          className="w-20 bg-gray-900 border border-[#FF6000]/60 text-white rounded px-2 py-1 focus:outline-none focus:border-[#FF6000]"
        />

        <p className="font-bold text-sm text-[#FF6000] mb-1 mt-3">Search User</p>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-40 bg-gray-900 border border-[#FF6000]/60 text-white rounded px-2 py-1 focus:outline-none focus:border-[#FF6000]"
          placeholder="Name or Username"
        />

        {/* Uncomment if you want to use position filter later */}
        {/* <p className="font-bold text-sm text-[#FF6000] mb-1 mt-3">Position</p>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="w-32 bg-gray-900 border border-[#FF6000]/60 text-white rounded px-2 py-1 focus:outline-none focus:border-[#FF6000]"
        >
          <option>All</option>
          <option>Left</option>
          <option>Right</option>
        </select> */}
      </div>

      {isLoading && !isDemoMode && (
        <div className="absolute inset-0 flex items-center justify-center text-[#FF6000] text-lg z-10">
          Loading team structure...
        </div>
      )}

      {isError && !isDemoMode && (
        <div className="absolute inset-0 flex items-center justify-center text-[#E3090D] text-lg z-10">
          <div className="text-center">
            <p>Error: {error?.message || "Failed to load team tree"}</p>
            <button
              className="mt-4 bg-[#FF6000] hover:bg-[#E3090D] text-white px-5 py-2 rounded font-medium transition-colors"
              onClick={() => refetch()}
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {((!isLoading && !isError && filteredDisplayTreeData?.length > 0) || isDemoMode) && (
        <Tree
          data={filteredDisplayTreeData || []}
          translate={translate}
          orientation="vertical"
          pathFunc="diagonal"
          collapsible={true}
          zoomable={true}
          draggable={true}
          renderCustomNodeElement={renderNodeWithCustomStyles}
          separation={{ siblings: 1.6, nonSiblings: 2.2 }}
          enableLegacyTransitions={false}
          shouldCollapseNeighborNodes={false}
          pathClassFunc={() => "custom-link-path"}
          zoom={0.75}
          initialDepth={1}
          scaleExtent={{ min: 0.15, max: 2.2 }}
        />
      )}

      {!isLoading && !isError && !isDemoMode && (!filteredDisplayTreeData || filteredDisplayTreeData.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-[#FF6000] text-lg z-10">
          No team members found
        </div>
      )}
    </div>
  );
};

export default TeamTreeView;