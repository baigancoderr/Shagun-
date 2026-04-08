/**
 * Demo Data Structure for User Routes
 * Complete data for all routes matching API response structure
 */

export const demoData = {
    // User Profile Data
    user: {
        id: "DEMO_USER_001",
        name: "Demo User",
        email: "demo@example.com",
        phone: "+1 234 567 8900",
        referralCode: "DEMO2026",
        walletAddress: "0xDemo1234567890abcdef",
        joinDate: "2025-01-01",
        status: "Active",
    },

    // Dashboard Data - Complete Structure
    dashboard: {
        userName: "Demo User",
        referralCode: "DEMO2026",
        walletAddress: "0xDemo1234567890abcdef",
        userEmail: "demo@example.com",
        referralLink: "https://yoursite.com/user/signup?referral=DEMO2026",

        wallets: {
            myWallet: "15,750",
            depositWallet: "5,000",
            principleWallet: "10,000",
            emgtWallet: "2,500",
            referralWallet: "3,250",
            totalInvestment: "10,000",
            latestLevelRank: "Gold Member",
            totalWalletBalance: "$26,500",
        },

        profitTracker: {
            investment: "$10,000",
            earning: "$8,750",
            earningWithoutCap: "$12,450",
            earningTimes: "0.87X",
        },

        teamBusiness: {
            directBusiness: "$45,000",
            totalTeamBusiness: "$125,750",
            todayTeamBusiness: "$2,350",
        },

        incomes: {
            roiIncome: "$5,250",
            levelIncome: "$2,180",
            totalLevelRewards: "$1,850",
            dailyIncome: "$125",
            monthlyIncome: "$3,750",
        },

        transactions: {
            totalEarning: "$25,430",
            totalWithdraw: "14,680",
        },

        teamStats: {
            totalTeam: 47,
            myDirect: 12,
            indirect: 35,
        },

        tokenOverview: {
            price: "1",
        },
    },

    // Investment Data - Plans and Active Investments
    investments: {
        plans: [
            {
                name: "Silver Plan",
                amount: 1000,
                roi: "8.0%",
                dailyROI: 8.0,
                stakingDays: "5 days",
                lockPeriod: "365 days",
                investment: 1000,
            },
            {
                name: "Gold Plan",
                amount: 5000,
                roi: "10.0%",
                dailyROI: 10.0,
                stakingDays: "5 days",
                lockPeriod: "365 days",
                investment: 5000,
            },
            {
                name: "Platinum Plan",
                amount: 10000,
                roi: "12.0%",
                dailyROI: 12.0,
                stakingDays: "5 days",
                lockPeriod: "365 days",
                investment: 10000,
            },
            {
                name: "Diamond Plan",
                amount: 25000,
                roi: "15.0%",
                dailyROI: 15.0,
                stakingDays: "5 days",
                lockPeriod: "365 days",
                investment: 25000,
            },
        ],
        walletBalance: 5000, // Deposit wallet balance
    },

    // Deposit Data
    deposits: {
        walletAddress: "0xDemo1234567890abcdef",
        usdtBalance: 10000,
        minimumDeposit: 100,
        maximumDeposit: 1000000,
    },

    // Withdrawal Data
    withdrawals: {
        balance: {
            my: 15750,
            principal: 10000,
            deposit: 5000,
            emgt: 2500,
            referral: 3250,
        },
        walletAddress: "0xDemo1234567890abcdef",
        minimumWithdrawal: 5,
    },

    // Wallet Data - Detailed Balance
    wallets: [
        { name: "Deposit Wallet", balance: 5000 },
        { name: "My Wallet", balance: 15750 },
        { name: "Principle Wallet", balance: 10000 },
        { name: "Referral Wallet", balance: 3250 },
    ],

    // Referral Data (Phase 2)
    referrals: {
        // TODO: Add referral list, referral income
    },

    // Team Data (Phase 2)
    team: {
        // TODO: Add team structure, team members
    },

    // Investment Report Data
    investmentReport: [
        {
            stakeId: "STK001",
            planName: "Gold Plan",
            amount: 5000,
            dailyReturn: 500,
            startDate: "2025-11-01 10:30:00",
            endDate: "2026-11-01 10:30:00",
            status: "Locked",
            isSwapped: false,
            isTransferred: false,
            isReinvested: false,
        },
        {
            stakeId: "STK002",
            planName: "Silver Plan",
            amount: 1000,
            dailyReturn: 80,
            startDate: "2025-10-15 14:20:00",
            endDate: "2026-10-15 14:20:00",
            status: "Locked",
            isSwapped: false,
            isTransferred: false,
            isReinvested: false,
        },
        {
            stakeId: "STK003",
            planName: "Platinum Plan",
            amount: 4000,
            dailyReturn: 480,
            startDate: "2026-01-01 09:00:00",
            endDate: "2027-01-01 09:00:00",
            status: "Locked",
            isSwapped: false,
            isTransferred: false,
            isReinvested: false,
        },
    ],

    // Deposit Report Data
    depositReport: [
        {
            transactionHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
            currencyType: "USDT",
            amount: 5000,
            walletType: "Deposit Wallet",
            date: "2025-11-01 10:30:00",
            status: "Confirmed",
        },
        {
            transactionHash: "0x9876543210fedcba0987654321fedcba09876543",
            currencyType: "USDT",
            amount: 1000,
            walletType: "Deposit Wallet",
            date: "2025-10-15 14:20:00",
            status: "Confirmed",
        },
        {
            transactionHash: "0xabcdef1234567890abcdef1234567890abcdef12",
            currencyType: "USDT",
            amount: 4000,
            walletType: "Deposit Wallet",
            date: "2026-01-01 09:00:00",
            status: "Pending",
        },
    ],

    // Withdraw Report Data
    withdrawReport: [
        {
            date: "2025-12-28 16:45:00",
            amount: 750,
            actualPayAmount: 735,
            withdrawalFeePercentage: 2,
            fromWallet: "My Wallet",
            walletAddress: "0xDemo1234567890abcdef",
            transactionHash: "0xwithdraw123456789abcdef",
            status: "Completed",
        },
        {
            date: "2025-12-10 11:20:00",
            amount: 1000,
            actualPayAmount: 980,
            withdrawalFeePercentage: 2,
            fromWallet: "Principal Wallet",
            walletAddress: "0xDemo1234567890abcdef",
            transactionHash: "0xwithdraw987654321fedcba",
            status: "Completed",
        },
        {
            date: "2026-01-02 14:30:00",
            amount: 1250,
            actualPayAmount: 1225,
            withdrawalFeePercentage: 2,
            fromWallet: "My Wallet",
            walletAddress: "0xDemo1234567890abcdef",
            transactionHash: "0xwithdrawpending123",
            status: "Processing",
        },
    ],

    // ROI/Stake Income Report Data
    stakeIncomeReport: [
        {
            date: "2026-01-05 00:00:00",
            packageId: "STK001",
            amount1: 5000,
            roi: 10.0,
            roiAmount: 500,
            status: "Credited",
        },
        {
            date: "2026-01-04 00:00:00",
            packageId: "STK001",
            amount1: 5000,
            roi: 10.0,
            roiAmount: 500,
            status: "Credited",
        },
        {
            date: "2026-01-05 00:00:00",
            packageId: "STK002",
            amount1: 1000,
            roi: 8.0,
            roiAmount: 80,
            status: "Credited",
        },
        {
            date: "2026-01-04 00:00:00",
            packageId: "STK003",
            amount1: 4000,
            roi: 12.0,
            roiAmount: 480,
            status: "Credited",
        },
    ],

    // Referral Report Data
    referralReport: [
        {
            date: "2025-11-05 12:30:00",
            from: "USER001",
            levelIncome: 100,
            level: 1,
            status: "Approved",
        },
        {
            date: "2025-11-12 15:45:00",
            from: "USER002",
            levelIncome: 200,
            level: 1,
            status: "Approved",
        },
        {
            date: "2025-12-01 10:20:00",
            from: "USER003",
            levelIncome: 50,
            level: 2,
            status: "Approved",
        },
        {
            date: "2025-12-15 14:10:00",
            from: "USER004",
            levelIncome: 300,
            level: 1,
            status: "Approved",
        },
    ],

    // Income Reports (Phase 2)
    incomeReports: {
        // TODO: Add ROI income, level income, referral income
    },

    // Arbitrage Trade Data
    arbitrage: [
        {
            tradedAt: Math.floor(Date.now() / 1000) - 120, // 2 minutes ago
            exBuy: "binance",
            buyPrice: 100.25,
            exSell: "coinbase",
            sellPrice: 101.50,
            ticker: "BTC/USDT",
            profit: 1.25,
            profitAfterFees: 1.00,
            profitPercentage: 1.25,
            profitPercentageAfterFees: 1.00,
            arbitragePercentage: 1.25,
            amountBuy: 1000,
            amountSell: 1001.25,
            withdrawalFees: 0.25,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
            exBuy: "kraken",
            buyPrice: 50.10,
            exSell: "binance",
            sellPrice: 50.95,
            ticker: "ETH/USDT",
            profit: 0.85,
            profitAfterFees: 0.70,
            profitPercentage: 1.70,
            profitPercentageAfterFees: 1.40,
            arbitragePercentage: 1.70,
            amountBuy: 500,
            amountSell: 500.85,
            withdrawalFees: 0.15,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 1800, // 30 minutes ago
            exBuy: "coinbase",
            buyPrice: 1.00,
            exSell: "kraken",
            sellPrice: 1.015,
            ticker: "USDC/USDT",
            profit: 0.15,
            profitAfterFees: 0.12,
            profitPercentage: 1.50,
            profitPercentageAfterFees: 1.20,
            arbitragePercentage: 1.50,
            amountBuy: 10000,
            amountSell: 10015,
            withdrawalFees: 0.03,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
            exBuy: "binance",
            buyPrice: 2500.00,
            exSell: "coinbase",
            sellPrice: 2550.00,
            ticker: "BTC/USDT",
            profit: 50.00,
            profitAfterFees: 48.00,
            profitPercentage: 2.00,
            profitPercentageAfterFees: 1.92,
            arbitragePercentage: 2.00,
            amountBuy: 2500,
            amountSell: 2550,
            withdrawalFees: 2.00,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
            exBuy: "kraken",
            buyPrice: 150.00,
            exSell: "binance",
            sellPrice: 152.50,
            ticker: "ETH/USDT",
            profit: 2.50,
            profitAfterFees: 2.25,
            profitPercentage: 1.67,
            profitPercentageAfterFees: 1.50,
            arbitragePercentage: 1.67,
            amountBuy: 150,
            amountSell: 152.50,
            withdrawalFees: 0.25,
        },
    ],

    // Analytics Data (same as arbitrage for now)
    analytics: [
        {
            tradedAt: Math.floor(Date.now() / 1000) - 120,
            exBuy: "binance",
            buyPrice: 100.25,
            exSell: "coinbase",
            sellPrice: 101.50,
            ticker: "BTC/USDT",
            profit: 1.25,
            profitAfterFees: 1.00,
            profitPercentage: 1.25,
            profitPercentageAfterFees: 1.00,
            arbitragePercentage: 1.25,
            amountBuy: 1000,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 300,
            exBuy: "kraken",
            buyPrice: 50.10,
            exSell: "binance",
            sellPrice: 50.95,
            ticker: "ETH/USDT",
            profit: 0.85,
            profitAfterFees: 0.70,
            profitPercentage: 1.70,
            profitPercentageAfterFees: 1.40,
            arbitragePercentage: 1.70,
            amountBuy: 500,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 1800,
            exBuy: "coinbase",
            buyPrice: 1.00,
            exSell: "kraken",
            sellPrice: 1.015,
            ticker: "USDC/USDT",
            profit: 0.15,
            profitAfterFees: 0.12,
            profitPercentage: 1.50,
            profitPercentageAfterFees: 1.20,
            arbitragePercentage: 1.50,
            amountBuy: 10000,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
            exBuy: "binance",
            buyPrice: 2500.00,
            exSell: "coinbase",
            sellPrice: 2550.00,
            ticker: "BTC/USDT",
            profit: 50.00,
            profitAfterFees: 48.00,
            profitPercentage: 2.00,
            profitPercentageAfterFees: 1.92,
            arbitragePercentage: 2.00,
            amountBuy: 2500,
        },
        {
            tradedAt: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
            exBuy: "kraken",
            buyPrice: 150.00,
            exSell: "binance",
            sellPrice: 152.50,
            ticker: "ETH/USDT",
            profit: 2.50,
            profitAfterFees: 2.25,
            profitPercentage: 1.67,
            profitPercentageAfterFees: 1.50,
            arbitragePercentage: 1.67,
            amountBuy: 150,
        },
    ],

    // Balance History Data
    balanceHistory: [
        {
            date: Math.floor(Date.now() / 1000),
            amount: 26500,
            deposit: 0,
            withdrawal: 0,
            profit: 125,
        },
        {
            date: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
            amount: 26375,
            deposit: 0,
            withdrawal: 0,
            profit: 120,
        },
        {
            date: Math.floor(Date.now() / 1000) - 172800, // 2 days ago
            amount: 26255,
            deposit: 5000,
            withdrawal: 0,
            profit: 100,
        },
        {
            date: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
            amount: 21155,
            deposit: 0,
            withdrawal: 750,
            profit: 95,
        },
        {
            date: Math.floor(Date.now() / 1000) - 345600, // 4 days ago
            amount: 21810,
            deposit: 0,
            withdrawal: 0,
            profit: 110,
        },
    ],

    // Profit Withdrawal History Data
    profitHistory: [
        {
            amount: 750,
            date: Math.floor(Date.now() / 1000) - 259200, // 3 days ago
            status: "Completed",
        },
        {
            amount: 1000,
            date: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
            status: "Completed",
        },
        {
            amount: 500,
            date: Math.floor(Date.now() / 1000) - 1209600, // 14 days ago
            status: "Completed",
        },
        {
            amount: 1250,
            date: Math.floor(Date.now() / 1000) - 1814400, // 21 days ago
            status: "Completed",
        },
    ],

    // Team Tree View Demo Data
    teamTree: [
        {
            name: "Demo User",
            username: "demo_user",
            selfInvestment: 10000,
            teamInvestment: 125750,
            children: [
                {
                    name: "Alice Johnson",
                    username: "alice_j",
                    selfInvestment: 5000,
                    teamInvestment: 45000,
                    children: [
                        {
                            name: "Bob Smith",
                            username: "bob_s",
                            selfInvestment: 3000,
                            teamInvestment: 15000,
                            children: [
                                {
                                    name: "Charlie Brown",
                                    username: "charlie_b",
                                    selfInvestment: 2000,
                                    teamInvestment: 5000,
                                    children: []
                                },
                                {
                                    name: "Diana Prince",
                                    username: "diana_p",
                                    selfInvestment: 1500,
                                    teamInvestment: 3500,
                                    children: []
                                }
                            ]
                        },
                        {
                            name: "Eve Davis",
                            username: "eve_d",
                            selfInvestment: 4000,
                            teamInvestment: 12000,
                            children: [
                                {
                                    name: "Frank Miller",
                                    username: "frank_m",
                                    selfInvestment: 2500,
                                    teamInvestment: 6000,
                                    children: []
                                }
                            ]
                        }
                    ]
                },
                {
                    name: "Grace Lee",
                    username: "grace_l",
                    selfInvestment: 7500,
                    teamInvestment: 35000,
                    children: [
                        {
                            name: "Henry Wilson",
                            username: "henry_w",
                            selfInvestment: 5000,
                            teamInvestment: 20000,
                            children: [
                                {
                                    name: "Ivy Chen",
                                    username: "ivy_c",
                                    selfInvestment: 3000,
                                    teamInvestment: 8000,
                                    children: []
                                },
                                {
                                    name: "Jack Taylor",
                                    username: "jack_t",
                                    selfInvestment: 2000,
                                    teamInvestment: 5000,
                                    children: []
                                }
                            ]
                        },
                        {
                            name: "Kate Martinez",
                            username: "kate_m",
                            selfInvestment: 3500,
                            teamInvestment: 9000,
                            children: []
                        }
                    ]
                },
                {
                    name: "Liam Anderson",
                    username: "liam_a",
                    selfInvestment: 6000,
                    teamInvestment: 28000,
                    children: [
                        {
                            name: "Mia Thompson",
                            username: "mia_t",
                            selfInvestment: 4000,
                            teamInvestment: 15000,
                            children: [
                                {
                                    name: "Noah Garcia",
                                    username: "noah_g",
                                    selfInvestment: 2500,
                                    teamInvestment: 7000,
                                    children: []
                                }
                            ]
                        },
                        {
                            name: "Olivia White",
                            username: "olivia_w",
                            selfInvestment: 3000,
                            teamInvestment: 8000,
                            children: []
                        }
                    ]
                }
            ]
        }
    ],

    // Swap Report Data
    swapReport: [
        {
            userId: "DEMO_USER_001",
            emgtAmount: 1000,
            tokenPrice: 2.50,
            walletType: "Deposit Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
            swapDetails: {
                originalAmount: 2500,
                fee: 25,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 500,
            tokenPrice: 2.45,
            walletType: "My Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            swapDetails: {
                originalAmount: 1225,
                fee: 12.25,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 2000,
            tokenPrice: 2.40,
            walletType: "Deposit Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
            swapDetails: {
                originalAmount: 4800,
                fee: 48,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 750,
            tokenPrice: 2.55,
            walletType: "My Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
            swapDetails: {
                originalAmount: 1912.50,
                fee: 19.13,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 1500,
            tokenPrice: 2.48,
            walletType: "Deposit Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
            swapDetails: {
                originalAmount: 3720,
                fee: 37.20,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 300,
            tokenPrice: 2.52,
            walletType: "My Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
            swapDetails: {
                originalAmount: 756,
                fee: 7.56,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 1200,
            tokenPrice: 2.47,
            walletType: "Deposit Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
            swapDetails: {
                originalAmount: 2964,
                fee: 29.64,
            },
        },
        {
            userId: "DEMO_USER_001",
            emgtAmount: 850,
            tokenPrice: 2.43,
            walletType: "My Wallet",
            currencyType: "EMGT",
            status: "Completed",
            createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
            swapDetails: {
                originalAmount: 2065.50,
                fee: 20.66,
            },
        },
    ],

    // Stake Income Report Data
    stakeIncomeReport: [
        {
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Gold Plan",
            packageId: "PKG001",
            amount1: 1000,
            roi: 8.0,
            roiAmount: 80,
            status: "Credited",
        },
        {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Gold Plan",
            packageId: "PKG001",
            amount1: 1000,
            roi: 8.0,
            roiAmount: 80,
            status: "Credited",
        },
        {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Platinum Plan",
            packageId: "PKG002",
            amount1: 5000,
            roi: 10.0,
            roiAmount: 500,
            status: "Credited",
        },
        {
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Gold Plan",
            packageId: "PKG001",
            amount1: 1000,
            roi: 8.0,
            roiAmount: 80,
            status: "Credited",
        },
        {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Diamond Plan",
            packageId: "PKG003",
            amount1: 10000,
            roi: 12.0,
            roiAmount: 1200,
            status: "Credited",
        },
        {
            date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Platinum Plan",
            packageId: "PKG002",
            amount1: 5000,
            roi: 10.0,
            roiAmount: 500,
            status: "Credited",
        },
        {
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            planName: "Gold Plan",
            packageId: "PKG001",
            amount1: 1000,
            roi: 8.0,
            roiAmount: 80,
            status: "Credited",
        },
    ],

    // Level Income Report Data
    levelIncomeReport: {
        selfInvestment: 10000,
        teamInvestment: 125750,
        records: [
            {
                sr: 1,
                rank: "Gold Star",
                rewardAmount: 2500,
                teamTotalRoiRewardDistributed: 8750,
                totalTeamInvestment: 45000,
                stronglegInvestment: 25000,
                weakestLegInvestment: 20000,
                distributionDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Completed",
            },
            {
                sr: 2,
                rank: "Silver Star",
                rewardAmount: 1500,
                teamTotalRoiRewardDistributed: 5250,
                totalTeamInvestment: 28000,
                stronglegInvestment: 15000,
                weakestLegInvestment: 13000,
                distributionDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Completed",
            },
            {
                sr: 3,
                rank: "Bronze Star",
                rewardAmount: 850,
                teamTotalRoiRewardDistributed: 3200,
                totalTeamInvestment: 15750,
                stronglegInvestment: 8500,
                weakestLegInvestment: 7250,
                distributionDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
                status: "Completed",
            },
        ],
    },

    // Referral Report Data
    referralReport: [
        {
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            from: "John Smith",
            deposit: 5000,
            levelIncome: 150,
            level: "1",
            status: "Active",
        },
        {
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            from: "Sarah Johnson",
            deposit: 3000,
            levelIncome: 90,
            level: "1",
            status: "Active",
        },
        {
            date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            from: "Mike Davis",
            deposit: 2500,
            levelIncome: 50,
            level: "2",
            status: "Active",
        },
        {
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            from: "Emily Wilson",
            deposit: 4500,
            levelIncome: 135,
            level: "1",
            status: "Active",
        },
        {
            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            from: "David Brown",
            deposit: 1500,
            levelIncome: 30,
            level: "2",
            status: "Active",
        },
        {
            date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            from: "Lisa Anderson",
            deposit: 3500,
            levelIncome: 35,
            level: "3",
            status: "Active",
        },
    ],

    // Bonanza Income Data
    bonanzaIncome: [
        {
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            from: "Team Achievement",
            teamBusiness: 125750,
            bonanzaIncome: 6287.50,
            status: "Approved",
        },
        {
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            from: "Monthly Target",
            teamBusiness: 98500,
            bonanzaIncome: 4925,
            status: "Approved",
        },
        {
            date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            from: "Quarterly Bonus",
            teamBusiness: 75000,
            bonanzaIncome: 3750,
            status: "Approved",
        },
        {
            date: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            from: "Team Performance",
            teamBusiness: 55000,
            bonanzaIncome: 2750,
            status: "Pending",
        },
    ],

    // Bonanza Plans Data
    bonanzaPlans: [
        {
            _id: "BP001",
            name: "Bronze Bonanza",
            roi: 5,
            minDirect: 5,
            target: 25000,
        },
        {
            _id: "BP002",
            name: "Silver Bonanza",
            roi: 7,
            minDirect: 10,
            target: 50000,
        },
        {
            _id: "BP003",
            name: "Gold Bonanza",
            roi: 10,
            minDirect: 15,
            target: 100000,
        },
        {
            _id: "BP004",
            name: "Platinum Bonanza",
            roi: 12,
            minDirect: 20,
            target: 200000,
        },
        {
            _id: "BP005",
            name: "Diamond Bonanza",
            roi: 15,
            minDirect: 25,
            target: 500000,
        },
    ],

    // Level Rewards Data
    levelRewards: {
        plans: [
            {
                _id: "LR001",
                name: "Starter Reward",
                roi: 3,
                strongLeg: 5000,
                weakLeg: 3000,
                target: 10000,
            },
            {
                _id: "LR002",
                name: "Bronze Reward",
                roi: 5,
                strongLeg: 15000,
                weakLeg: 10000,
                target: 25000,
            },
            {
                _id: "LR003",
                name: "Silver Reward",
                roi: 7,
                strongLeg: 30000,
                weakLeg: 20000,
                target: 50000,
            },
            {
                _id: "LR004",
                name: "Gold Reward",
                roi: 10,
                strongLeg: 60000,
                weakLeg: 40000,
                target: 100000,
            },
            {
                _id: "LR005",
                name: "Platinum Reward",
                roi: 12,
                strongLeg: 120000,
                weakLeg: 80000,
                target: 200000,
            },
            {
                _id: "LR006",
                name: "Diamond Reward",
                roi: 15,
                strongLeg: 300000,
                weakLeg: 200000,
                target: 500000,
            },
        ],
        totalCount: 6,
    },

    // Referral Income Data (Level-wise)
    referralIncome: {
        "1": {
            percentage: 3,
            users: 8,
            income: 2400,
        },
        "2": {
            percentage: 2,
            users: 15,
            income: 1800,
        },
        "3": {
            percentage: 1,
            users: 24,
            income: 960,
        },
    },

    // Level Wise Team Data
    levelWiseTeam: {
        "1": [
            {
                id: "USR001",
                userName: "john_smith",
                plan: "Gold Plan",
                joinDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: "USR002",
                userName: "sarah_j",
                plan: "Platinum Plan",
                joinDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: "USR003",
                userName: "mike_davis",
                plan: "Gold Plan",
                joinDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        "2": [
            {
                id: "USR004",
                userName: "emily_w",
                plan: "Diamond Plan",
                joinDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: "USR005",
                userName: "david_brown",
                plan: "Gold Plan",
                joinDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
        "3": [
            {
                id: "USR006",
                userName: "lisa_a",
                plan: "Platinum Plan",
                joinDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
            },
        ],
    },

    // User Profile Data
    userProfile: {
        email: "demo@example.com",
        walletAddress: "0xDemo1234567890abcdef",
    },

    // Withdrawal Balance Data
    withdrawalBalance: {
        balance: {
            my: 15750,
            principal: 10000,
            deposit: 5000,
            emgt: 2500,
            referral: 3250,
        },
        walletAddress: "0xDemo1234567890abcdef",
    },

    // More routes data will be added in Phase 2
};

/**
 * Get demo data for specific route
 * @param {string} routeName - Name of the route
 * @returns {object} Demo data for the route
 */
export const getDemoData = (routeName) => {
    return demoData[routeName] || null;
};

/**
 * Check if demo mode is active
 * @returns {boolean}
 */
export const isDemoModeActive = () => {
    return localStorage.getItem("userDemoMode") === "true";
};
