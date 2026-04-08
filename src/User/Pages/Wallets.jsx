import { FaWallet } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { appConfig } from '../../config/appConfig';
import { useDemoMode } from '../Contexts/DemoModeContext';
import { getDemoData } from '../Data/demoData';

// 🔹 API function for fetching wallets
const fetchWalletDetails = async () => {
  const token =
    localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const response = await axios.get(`${appConfig.baseURL}/user/wallet`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  

  const { principalWallet, myWallet, emgtWallet, depositWallet, referralWallet } =
    response.data.data;


  return [
    { name: 'Deposit Wallet', balance: depositWallet },
    { name: 'My Wallet', balance: myWallet },
    { name: 'URWA Wallet', balance: emgtWallet },
    // { name: 'Principle Wallet', balance: principalWallet },
    { name: 'Referral Wallet', balance: referralWallet },

  ];
};

const Wallets = () => {
  const { isDemoMode } = useDemoMode();

  const {
    data: wallets,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['wallets'],
    queryFn: fetchWalletDetails,
    staleTime: 1000 * 60 * 2, // cache valid for 2 minutes
    cacheTime: 1000 * 60 * 5, // keep in cache for 5 minutes
    refetchOnWindowFocus: false, // don't refetch on tab switch
    enabled: !isDemoMode, // Disable API call in demo mode
  });

  // Use demo data if demo mode is active
  const displayWallets = isDemoMode ? getDemoData("wallets") : wallets;

  // 🔹 Skeleton placeholder with same style as wallet card
  const SkeletonCard = ({ idx }) => (
    <div className="rounded-xl border border-gradient theme-card-style p-3 space-y-2 animate-pulse">
      <div className="flex flex-col-reverse gap-3 justify-between">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <FaWallet className="text-gray-400" />
          <span className="h-4 w-20 bg-gray-200 rounded"></span>
        </h2>
        <span className="text-xs h-3 w-14 bg-gray-200 rounded"></span>
      </div>
      <div className="text-base text-secondary">
        <div className="h-5 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (isLoading && !isDemoMode) {
    return (
      <>
        {[1, 2, 3, 4, 5].map((i) => (
          <SkeletonCard key={i} idx={i} />
        ))}
      </>

    );
  }

  if (isError && !isDemoMode) {
    return <p className="text-red-600">{error.message}</p>;
  }

  return (
    <>
      {displayWallets?.map((wallet, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-gradient theme-card-style p-3 text-gray-800 space-y-2"
        >
          <div className="flex flex-col-reverse gap-3 justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FaWallet className="text-blue-700" />
              {wallet.name}
            </h2>
            <span className="text-xs text-gray-500">Wallet #{idx + 1}</span>
          </div>

          {wallet.name === 'URWA Wallet' ? (
            <div className="text-sm break-words   text-secondary">
              {wallet.balance.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}

              <span className="text-xs text-gray-500 ml-1">
                ($
                {(wallet.balance * 0.3).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
                )
              </span>
            </div>
          ) : (
            <div className="text-sm break-words text-secondary">
              $ {wallet.balance.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default Wallets;
