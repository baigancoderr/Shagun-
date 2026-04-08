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
  const [count, setCount] = useState(10); // Default count to 10 as per the example
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("All");
  const treeContainer = useRef(null);

  // Transform API data to match react-d3-tree format
  const transformTreeData = useCallback((apiData) => {
    // apiData is response.data, e.g., {status, message, data: {selfInvestment, leftTeamInvestment, rightTeamInvestment, data: [{...}] }}
    const root = apiData?.data?.data?.[0];
    if (!root) {
      return [];
    }

    const transformNode = (node) => {
      if (!node) return null;
      const fullName = `${node.firstName || ""} ${node.lastName || ""}`.trim();
      return {
        name: node.user_id || "Unknown",
        attributes: {
          Username: node.username || "Unknown",
          Name: fullName || "Unknown",
          Email: node.email || "N/A",
          Sponsor: node.sponsorId || "Unknown", // Fallback to "Unknown" if not present
          Position: node.position || "N/A",
          Self: `$${node.selfInvestment || 0}`,
          LeftTeam: `$${node.leftTeamInvestment || 0}`,
          RightTeam: `$${node.rightTeamInvestment || 0}`,
        },
        children: node.children ? node.children.map(transformNode).filter(Boolean) : [],
      };
    };

    return [transformNode(root)]; // Wrap as array for react-d3-tree; single node if no children
  }, []);

  // Fetch team tree data using useQuery
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
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    retry: 2, // Retry failed requests twice
    enabled: !isDemoMode && (!!localStorage.getItem("authToken") || !!sessionStorage.getItem("authToken")), // Only fetch if token exists and not in demo mode
  });

  // Use demo data if demo mode is active
  const displayTreeData = isDemoMode
    ? transformTreeData({ data: { data: getDemoData("teamTree") } })
    : teamTreeData;

  // Filtered tree data based on search and filter
  const filteredDisplayTreeData = useMemo(() => {
    if (!displayTreeData || displayTreeData.length === 0) return [];
    if (!searchTerm && filterPosition === "All") return displayTreeData;

    const matchesSearch = (node) => node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (node.attributes.Name && node.attributes.Name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (node.attributes.Username && node.attributes.Username.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = (node) => filterPosition === "All" || (node.attributes.Position && node.attributes.Position.toLowerCase() === filterPosition.toLowerCase());

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

  // Update translate on resize
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

  // Custom styled node
  const renderNodeWithCustomStyles = useCallback(
    ({ nodeDatum, toggleNode }) => (
      <g
        role="button"
        aria-label={`Toggle node for ${nodeDatum.name || "Unknown"}`}
        tabIndex={0}
        onKeyPress={(e) => e.key === "Enter" && toggleNode()}
      >
        <circle r={20} fill="#2298D3" stroke="#1e40af" strokeWidth={2} />
        <text
          x={30}
          dy="-10"
          fontSize={14}
          fontWeight="bold"
          textAnchor="start"
          fill="#059669"
          stroke="#ffffff"
          strokeWidth={1}
          paintOrder="stroke"
        >
          {nodeDatum.name || "Unknown"}
        </text>
        {nodeDatum.attributes && (
          <>
            <text
              x={30}
              dy="10"
              fontSize={12}
              fill="#1f2937"
              stroke="#ffffff"
              strokeWidth={1}
              paintOrder="stroke"
            >
              Sponsor: {nodeDatum.attributes.Sponsor || "Unknown"}
            </text>
            <foreignObject x={30} y={15} width={200} height={200}>
              <div xmlns="http://www.w3.org/1999/xhtml" style={{ fontSize: "12px", color: "#1f2937" }}>
                <details>
                  <summary>More Details</summary>
                  <div>Username: {nodeDatum.attributes.Username || "Unknown"}</div>
                  <div>Name: {nodeDatum.attributes.Name || "Unknown"}</div>
                  <div>Email: {nodeDatum.attributes.Email || "N/A"}</div>
                  <div>Position: {nodeDatum.attributes.Position || "N/A"}</div>
                  <div>Self: {nodeDatum.attributes.Self || "$0"}</div>
                  <div>Left Team: {nodeDatum.attributes.LeftTeam || "$0"}</div>
                  <div>Right Team: {nodeDatum.attributes.RightTeam || "$0"}</div>
                </details>
              </div>
            </foreignObject>
          </>
        )}
        {nodeDatum.children && nodeDatum.children.length > 0 && (
          <text
            x={0}
            y={30}
            fontSize={20}
            textAnchor="middle"
            fill="#1e40af"
            style={{ cursor: "pointer" }}
            onClick={toggleNode}
          >
            {nodeDatum._collapsed ? "▶" : "▼"}
          </text>
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
          stroke: #000000 !important;
          stroke-width: 2px !important;
          fill: none !important;
        }
      `}</style>
      {isDemoMode && (
        <div className="absolute right-4 top-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg z-20">
          Demo Mode
        </div>
      )}
      <div className="text-xs absolute left-4 top-4 rounded-xl bg-white border-2 border-gray-300 p-4 text-gray-800 shadow-lg w-fit space-y-1 z-10">
        <p className="font-bold text-sm text-blue-600 mb-1">Fetch Levels</p>
        <input
          type="number"
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          min={1}
          max={50}
          className="w-20 border border-gray-300 rounded px-2 py-1"
        />
        <p className="font-bold text-sm text-blue-600 mb-1">Search User</p>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-32 border border-gray-300 rounded px-2 py-1"
          placeholder="Name or Username"
        />
        <p className="font-bold text-sm text-blue-600 mb-1">Filter Position</p>
        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="w-32 border border-gray-300 rounded px-2 py-1"
        >
          <option>All</option>
          <option>Left</option>
          <option>Right</option>
        </select>
      </div>
     
      {isLoading && !isDemoMode && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 text-lg z-10">
          Loading...
        </div>
      )}
      {isError && !isDemoMode && (
        <div className="absolute inset-0 flex items-center justify-center text-red-600 text-lg z-10">
          <div className="text-center">
            <p>Error: {error?.message || "Failed to fetch team tree data"}</p>
            <button
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={() => refetch()}
              aria-label="Retry fetching team tree data"
            >
              Retry
            </button>
          </div>
        </div>
      )}
      {((!isLoading && !isError && filteredDisplayTreeData && filteredDisplayTreeData.length > 0) || isDemoMode) && (
        <Tree
          data={filteredDisplayTreeData || []}
          translate={translate}
          orientation="vertical"
          pathFunc="diagonal"
          collapsible={true}
          zoomable={true}
          draggable={true}
          renderCustomNodeElement={renderNodeWithCustomStyles}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          enableLegacyTransitions={false}
          shouldCollapseNeighborNodes={false}
          pathClassFunc={() => "custom-link-path"}
          zoom={0.8}
          initialDepth={1}
          scaleExtent={{ min: 0.1, max: 2 }}
        />
      )}
      {!isLoading && !isError && !isDemoMode && (!filteredDisplayTreeData || filteredDisplayTreeData.length === 0) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-800 text-lg z-10">
          No team data available
        </div>
      )}
    </div>
  );
};

export default TeamTreeView;