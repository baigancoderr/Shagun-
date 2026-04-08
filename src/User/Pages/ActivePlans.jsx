import { FaCheck } from 'react-icons/fa';

const activePlans = [
    {
        name: 'Gold',
        amount: 500,
        roi: '0.6%',
        stakingDays: '5 days',
        lockPeriod: '90 days',
    },
    {
        name: 'Diamond',
        amount: 5000,
        roi: '0.9%',
        stakingDays: '5 days',
        lockPeriod: '270 days',
    },
    {
        name: 'Platinum',
        amount: 1000,
        roi: '0.7%',
        stakingDays: '5 days',
        lockPeriod: '120 days',
    },
];

const ActivePlans = () => {
    return (
        <>
            <h2 className="text-2xl text-blue-700   font-bold mb-6">My Active Plans</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-gray-800">
                {activePlans.map((plan, index) => (
                    <div
                        key={index}
                        className="relative group p-[1px] border-gradient bg-gradient-to-br from-white to-blue-50 hover:shadow-lg transition-all duration-300"
                    >
                        {/* Inner glass card */}
                        <div className="relative theme-card-style h-full p-6 flex flex-col justify-between">
                            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-all duration-300 bg-gradient-to-br from-gray-200 via-transparent to-transparent" />

                            {/* Tag */}
                            <div className="text-xs uppercase font-semibold bg-gradient-to-r from-[#05CE99] to-[#2298D3] text-white px-3 py-1 rounded-full w-max mb-4">
                                Active Plan
                            </div>

                            {/* Header */}
                            <div className="z-10 space-y-1 mb-6">
                                <h2 className="text-xl uppercase font-semibold tracking-wider text-gray-800">{plan.name}</h2>
                                <p className="text-4xl font-extrabold text-green-600">
                                    ₹{plan.amount.toLocaleString()}
                                </p>
                            </div>

                            {/* Details */}
                            <ul className="text-sm text-gray-600 space-y-1 z-10 mb-6">
                                <li>
                                    Daily ROI: <span className="text-gray-800 text-base font-medium">{plan.roi}</span>
                                </li>
                                <li>
                                    Staking Days: <span className="text-gray-800 font-medium">{plan.stakingDays}</span> (Excl. Sat/Sun)
                                </li>
                                <li>
                                    Locking Period: <span className="text-gray-800 font-medium">{plan.lockPeriod}</span>
                                </li>
                                <li>
                                    Cap: <span className="text-gray-800 font-medium">3x</span>
                                </li>
                            </ul>

                            {/* Bonus Features */}
                            <div className="z-10 mt-5 pt-4 border-t border-gray-200 text-sm space-y-2">
                                {[
                                    'Stable Returns',
                                    'Secure Staking',
                                    'Auto Withdrawals'
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center gap-2 text-gray-700">
                                        <FaCheck className="text-green-600" />
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ActivePlans;
