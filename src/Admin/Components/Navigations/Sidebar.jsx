import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSidebar } from "../../Contexts/SidebarContext";
import logo from "../../../assets/adminImages/Logo/logo_lght.png";
import logo1 from "../../../assets/adminImages/Logo/icon3.png";

import {
  FaThLarge,
  FaDollarSign,
  FaWallet,
  FaChartPie,
  FaMoneyCheckAlt,
  FaHandHoldingUsd,
  FaExchangeAlt,
  // FaCog,
  FaHistory,
  // FaSignOutAlt,
  FaUsers,
  FaList,
  FaChevronDown,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";

// MAIN NAVIGATION ITEMS

const navItems = [
  {
    icon: <FaThLarge />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    icon: <FaUsers />,
    name: "User Management",
    subItems: [
      { name: "All User", path: "/admin/user-management", pro: false },
      // {
      //   name: "Set User Rank",
      //   path: "user-management/update-rank",
      //   pro: false,
      // },
      // {
      //   name: "Set User Parent",
      //   path: "user-management/update-sponsor",
      //   pro: false,
      // },
    ],
  },




  // {
  //   icon: <FaWallet />,
  //   name: "Loyalty Points",
  //   subItems: [
  //     { name: "Send LoyaltyPoints", path: "/admin/Airdrop/Airdrop", pro: false },
  //   ],
  // },

  //   {
  //   icon: <FaWallet />,
  //   name: "Shopping Points",
  //   subItems: [
  //     { name: "Send ShoppingPoints", path: "/admin/ShoppingPoint/ShoppingPoint", pro: false },
  //   ],
  // },


  // {
  //   icon: <FaDollarSign />,
  //   name: "Set Token Price",
  //   path: "/admin/set-token-price",
  // },
  // {
  //   icon: <FaChartPie />,
  //   name: "Trade Management",
  //   path: "/admin/trade-management",
  // },
  {
    icon: <FaWallet />,
    name: "Users Deposit",
    subItems: [
      { name: "Deposit", path: "/admin/user-deposit/deposit", pro: false },
      {
        name: "Report",
        path: "/admin/user-deposit/deposit-report",
        pro: false,
      },
    ],
  },
  // {
  //   icon: <FaWallet />,
  //   name: "Users Wallet Update",
  //   subItems: [
  //     { name: "Update", path: "/admin/user-wallet/update", pro: false },
  //     { name: "Report", path: "/admin/user-wallet/update-report", pro: false },
  //   ],
  // },
  {
    icon: <FaChartPie />,
    name: "Product Management",
    subItems: [
      {
        name: "Add Product",
        path: "/admin/property-management/add-property-plan",
        pro: false,
      },
      {
        name: "Report",
        path: "/admin/property-Report/user-property-plans-report",
        pro: false,
      },
      // { name: "Bonanza Plan", path: "/admin/investment-management/bonanza-plan", pro: false },
      // { name: "Level Plan", path: "/admin/property-management/level-plan", pro: false },
      // { name: "Report", path: "/admin/investment-management/report", pro: false },
    ],
  },
  // {
  //   icon: <FaChartPie />,
  //   name: "Property Report",
  //   subItems: [
  //       { name: "User Property Plans Report", path: "/admin/property-Report/user-property-plans-report", pro: false },
  //     // { name: "User Stake Plans Report", path: "/admin/property-Report/user-stake-plans-report", pro: false },
  //   ]
  // },
  {
    icon: <FaMoneyCheckAlt />,
    name: "Payout Management",
    subItems: [
      {
        name: "Withdrawals",
        path: "/admin/payout-management/withdrawals",
        pro: false,
      },
      // { name: "Withdrawal Report", path: "/admin/payout-management/withdrawal-report", pro: false },
    ],
  },
  {
    icon: <FaHandHoldingUsd />,
    name: "Income Management",
    subItems: [
      // {
      //   name: "Daily Roi Income",
      //   path: "/admin/income-management/daily-roi-income",
      //   pro: false,
      // },
      {
        name: "Referral Income",
        path: "/admin/income-management/referrel-income",
        pro: false,
      },
      // {
      //   name: "Level Income Rewards",
      //   path: "/admin/income-management/level-income-rewards",
      //   pro: false,
      // },
      // {
      //   name: "Binary Income Report",
      //   path: "/admin/income-management/binary-income-report",
      //   pro: false,
      // },
      // {
      //   name: "Leadership Share Distribution",
      //   path: "/admin/income-management/leadership-share-report",
      //   pro: false,
      // },
      // {
      //   name: "Leadership Income Report",
      //   path: "/admin/income-management/leadership-income-report",
      //   pro: false,
      // },

      // { name: "Bonanza Rewards", path: "/admin/income-management/bonanza-rewards", pro: false },
    ],
  },

  {
    icon: <FaHistory />,
    name: "Reports",
    subItems: [
      {
        name: "Rank Achievement",
        path: "/admin/reports/rank-achievement-report",
        pro: false,
      },
    ],
  },

  // {
  //   icon: <FaHistory />,
  //   name: "KYC",
  //   subItems: [
  //     {
  //       name: "KYC Report",
  //       path: "/admin/reports/kyc-report",
  //       pro: false,
  //     },
  //   ],
  // },

  // {
  //   icon: <FaExchangeAlt />,
  //   name: "Swap Management",
  //   subItems: [
  //     { name: "Report", path: "/admin/swap-management/report", pro: false },
  //   ],
  // },
  {
    icon: <IoMdSettings />,
    name: "Settings",
    subItems: [
      {
        name: "Set Referral Income",
        path: "/admin/settings/set-referral-income",
        pro: false,
      },
      // { name: "Set Level Income", path: "/admin/settings/set-level-income", pro: false },
    ],
  },
  // {
  //   icon: <FaCog />,
  //   name: "Platform Settings",
  //   path: "/admin/platform-settings",
  // },
  // {
  //   icon: <FaHistory />,
  //   name: "Transaction History",
  //   path: "/admin/transaction-history",
  // },
  {
    icon: <FaList />,
    name: "Session Log",
    path: "/admin/session-log",
  },
  // {
  //   icon: <FaSignOutAlt />,
  //   name: "Logout",
  //   path: "/admin/logout",
  // },
];

const Sidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname],
  );

  useEffect(() => {
    let matched = false;
    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((sub) => {
        if (isActive(sub.path)) {
          setOpenSubmenu({ index });
          matched = true;
        }
      });
    });
    if (!matched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `main-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu((prev) => (prev && prev.index === index ? null : { index }));
  };

  const renderMenuItems = () => (
    <ul className="flex flex-col gap-2">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden 
                ${
                  openSubmenu?.index === index
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                } 
                ${!isExpanded && !isHovered ? " lg:px-[0.9rem]" : " "} lg:justify-start
              `}
            >
              {/* Hover effect background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />

              <span
                className={`relative  z-10 flex-shrink-0 text-lg transition-colors duration-200
                ${
                  openSubmenu?.index === index
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                }`}
              >
                {nav.icon}
              </span>

              {(isExpanded || isHovered || isMobileOpen) && (
                <>
                  <span className="relative z-10 flex-1 text-left font-medium tracking-wide">
                    {nav.name}
                  </span>
                  <FaChevronDown
                    className={`relative z-10 w-4 h-4 transition-all duration-300 flex-shrink-0
                      ${
                        openSubmenu?.index === index
                          ? "rotate-180 text-blue-600 dark:text-blue-400"
                          : "text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                      }`}
                  />
                </>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`flex   items-center gap-4 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group relative overflow-hidden
                  ${
                    isActive(nav.path)
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  }
                  ${!isExpanded && !isHovered ? "  lg:px-[0.9rem]" : " "}lg:justify-start
                `}
              >
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl " />

                <span
                  className={`relative z-10 flex-shrink-0 ml-[-0.1rem] text-lg transition-colors duration-200 
                  ${
                    isActive(nav.path)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400"
                  }`}
                >
                  {nav.icon}
                </span>

                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="relative z-10 font-medium tracking-wide">
                    {nav.name}
                  </span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`main-${index}`] = el;
              }}
              className="overflow-hidden  transition-all duration-300 ease-out"
              style={{
                height:
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`main-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 ml-4 space-y-1 border-l border-gray-200 dark:border-gray-700  ">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`flex items-center justify-between py-1.5 px-3 rounded-lg text-xs font-medium transition-all duration-200 group relative overflow-hidden
                        ${
                          isActive(subItem.path)
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/30 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      {/* Hover effect background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 to-indigo-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />

                      <span className="relative z-10 tracking-wide">
                        {subItem.name}
                      </span>

                      {(subItem.new || subItem.pro) && (
                        <span className="relative z-10 flex gap-1.5 ml-2">
                          {subItem.new && (
                            <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                              NEW
                            </span>
                          )}
                          {subItem.pro && (
                            <span className="bg-gradient-to-r from-purple-500 to-violet-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
                              PRO
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0  left-0 z-50 h-screen bg-white dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200/60 dark:border-gray-700/60 transition-all duration-300 ease-in-out shadow-xl dark:shadow-2xl
        ${
          isExpanded || isMobileOpen
            ? "w-[230px]"
            : isHovered
              ? "w-[230px]"
              : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO SECTION */}
      <div
        className={`py-6 px-6 flex border-b border-gray-100 dark:border-gray-800/50
        ${!isExpanded && !isHovered ? "  lg:px-[0.9rem]" : ""} justify-start`}
      >
        <Link
          to="/"
          className="transition-transform duration-200 hover:scale-105"
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img
                className="dark:hidden drop-shadow-sm"
                src={logo}
                alt="Logo"
                width={140}
                height={36}
              />
              <img
                className="hidden dark:block drop-shadow-sm"
                src={logo}
                alt="Logo"
                width={140}
                height={36}
              />
            </>
          ) : (
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center ">
              <img
                src={logo1}
                alt="Logo"
                width={40}
                height={40}
                className=" "
              />
            </div>
          )}
        </Link>
      </div>

      {/* NAVIGATION SECTION */}
      <div className="flex flex-col h-[90%] overflow-y-auto no-scrollbar scrollbar-hide">
        <nav className="flex-1 px-3 py-6">
          <div className="space-y-8">
            {/* Menu Section */}
            <div>
              <h2
                className={`mb-6 text-xs font-bold uppercase tracking-wider flex leading-5
                ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center text-gray-400 dark:text-gray-500"
                    : "justify-start text-gray-500 dark:text-gray-400"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Navigation"
                ) : (
                  <div className="w-6 h-0.5 mb-3   bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
              </h2>
              {renderMenuItems()}
            </div>
          </div>
        </nav>

        {/* Footer Section */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-800/20">
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">System Online</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
