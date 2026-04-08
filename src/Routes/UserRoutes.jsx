import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { jwtDecode } from 'jwt-decode'; // Named import

// Layout (static import, NOT lazy)
import UserLayout from '../User/Layout/UserLayout';
import UserLoader from '../User/Components/Comman/UserLoader';
import AuthLayout from '../User/Layout/AuthLayout';
import LoginPage from '../User/Auth/LoginPage';
import SignUpPage from '../User/Auth/SignUpPage';
import VerifyUser from '../User/Auth/VerifyUser';
import ForgotPasswordPage from '../User/Auth/ForgotPasswordPage';
import TeamDownline from '../User/Pages/TeamDownline';
import TeamTreeView from '../User/Pages/TeamTreeView';
import DirectReferral from '../User/Pages/DirectReferral';
import LevelWiseTeam from '../User/Pages/LevelWiseTeam';
import ScrollToTop from '../User/Components/Comman/ScrollToTop';
import LevelIncomeReport from '../User/Pages/IncomeReport/LevelIncomeReport';
import LeadershipShareReport from '../User/Pages/IncomeReport/LeadershipShareReport';
import KycSubmitPage from '../User/Pages/KYC/KycSubmitPage';
import KycSubmitReport from '../User/Pages/KYC/KycSubmitReport';
import LavelRewards from '../User/Pages/LavelRewards';
import Support from '../User/Pages/Support';
import Test from '../User/Pages/Test';
import TokenizedAgreement from '../User/Pages/InvestmentDetailsPages/AgreementPage/TokenizedAgreement';


// import ReadymadeDetails from '../User/Pages/InvestmentDetailsPages/ReadymadeDetails';


// Lazy-loaded pages
const Dashboard = lazy(() => import('../User/Pages/Dashboard'));
const MyProfile = lazy(() => import('../User/Pages/MyProfile'));
const Deposit = lazy(() => import('../User/Pages/Deposit/Deposit'));
const DepositReport = lazy(() => import('../User/Pages/Deposit/DepositReport'));
const Wallets = lazy(() => import('../User/Pages/Wallets'));
const Investments = lazy(() => import('../User/Pages/Package/Package'));
const ReadymadeDetails = lazy(() => import('../User/Pages/InvestmentDetailsPages/ReadymadeDetails'));
const TokenizedPlanDetail = lazy(() => import('../User/Pages/InvestmentDetailsPages/TokenizedDetails'));
const ConstructionDetails = lazy(() => import('../User/Pages/InvestmentDetailsPages/ConstructionDetails'));
const ActivePlans = lazy(() => import('../User/Pages/ActivePlans'));
const InvestmentReport = lazy(() => import('../User/Pages/Package/PackageReport'));
const Swap = lazy(() => import('../User/Pages/Shopping/Shopping'));
const SwapReport = lazy(() => import('../User/Pages/Shopping/ShoppingReport'));
const ReferralIncome = lazy(() => import('../User/Pages/ReferralIncome'));
const ReferralReport = lazy(() => import('../User/Pages/IncomeReport/ReferralReport'));
const StakeIncomeReport = lazy(() => import('../User/Pages/IncomeReport/StakeIncomeReport'));
const BinaryIncomeReport = lazy(() => import('../User/Pages/IncomeReport/BinaryIncomeReport'));
const LeadershipIncomeReport = lazy(() => import('../User/Pages/IncomeReport/LeadershipIncomeReport'));
const RankIncomeReport = lazy(() => import('../User/Pages/IncomeReport/RankIncomeReport'));
const LavelIncomeReport = lazy(() => import('../User/Pages/ReferralIncomeReportGarbage'));
// const BonanzaIncome = lazy(() => import('../User/Pages/BonanzaIncome'));
// const BonanzaRewards = lazy(() => import('../User/Pages/BonanzaRewards'));
const Withdrawals = lazy(() => import('../User/Pages/Withdraw/Withdrawals'));
const WithdrawReport = lazy(() => import('../User/Pages/Withdraw/WithdrawReport'));
const TransactionHistory = lazy(() => import('../User/Pages/TransactionHistory'));

// Trade section lazy-loaded pages
const Arbitrage = lazy(() => import('../User/Pages/Arbitrage'));
const Analytics = lazy(() => import('../User/Pages/Analytics'));
const History = lazy(() => import('../User/Pages/History'));
const Profits = lazy(() => import('../User/Pages/Profits'));

// ProtectedRoute component with expiration check
const ProtectedRoute = () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  if (!token) {
    return <Navigate to="/user/login" replace />;
  }

  // Check if token is expired (assuming JWT)
  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      // Token expired: remove it and redirect to login
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      return <Navigate to="/user/login" replace />;
    }
  } catch (error) {
    // Invalid token: remove it and redirect
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
    return <Navigate to="/user/login" replace />;
  }

  return <Outlet />;
};

const UserRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/user">
          {/* Auth routes with AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="verify-user" element={<VerifyUser />} />
          </Route>
          

          {/* Protected routes with UserLayout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route index element={<Navigate to="dashboard" />} />
              <Route
                path="dashboard"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Dashboard />
                  </Suspense>
                }
              />
              <Route
                path="test"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Test />
                  </Suspense>
                }
              />
              {/* Trade Section Routes */}
              <Route
                path="arbitrage"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Arbitrage />
                  </Suspense>
                }
              />
              <Route
                path="analytics"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Analytics />
                  </Suspense>
                }
              />
              <Route
                path="history"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <History />
                  </Suspense>
                }
              />
              <Route
                path="profits"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Profits />
                  </Suspense>
                }
              />
              {/* End Trade Section Routes */}
              <Route
                path="my-profile"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <MyProfile />
                  </Suspense>
                }
              />
              <Route
                path="deposits"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Deposit />
                  </Suspense>
                }
              />
              <Route
                path="deposit-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <DepositReport />
                  </Suspense>
                }
              />
              <Route
                path="wallets"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Wallets />
                  </Suspense>
                }
              />
              <Route
                path="property-investments"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Investments />
                  </Suspense>
                }
              />
              <Route
                path="property-investments/readymade/:id"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReadymadeDetails />
                  </Suspense>
                }
              />
              <Route
                path="property-investments/tokenized/:id"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TokenizedPlanDetail />
                  </Suspense>
                }
              />
              <Route
                path="property-investments/construction/:id"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ConstructionDetails />
                  </Suspense>
                }
              />
              <Route
                path="active-plan"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ActivePlans />
                  </Suspense>
                }
              />
              <Route
                path="property-investment-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <InvestmentReport />
                  </Suspense>
                }
              />
              <Route
                path="swap"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Swap />
                  </Suspense>
                }
              />
              <Route
                path="swap-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <SwapReport />
                  </Suspense>
                }
              />
              <Route
                path="referral-income"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReferralIncome />
                  </Suspense>
                }
              />
              <Route
                path="referral-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReferralReport />
                  </Suspense>
                }
              />
              <Route
                path="team-downline"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TeamDownline />
                  </Suspense>
                }
              />
              <Route
                path="team-tree-view"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TeamTreeView />
                  </Suspense>
                }
              />
              <Route
                path="direct-referral"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <DirectReferral />
                  </Suspense>
                }
              />
              <Route
                path="level-wise-team"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LevelWiseTeam />
                  </Suspense>
                }
              />
              <Route
                path="Level-rewards"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LavelRewards />
                  </Suspense>
                }
              />
              <Route
                path="level-plan-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    {/* <BonanzaIncome /> */}
                    <LevelIncomeReport/>
                  </Suspense>
                }
              />
              <Route
                path="stake-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <StakeIncomeReport />
                  </Suspense>
                }
              />
              <Route
                path="binary-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <BinaryIncomeReport />
                  </Suspense>
                }
              />

               <Route
                path="leadership-share-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LeadershipShareReport />
                  </Suspense>
                }
              />
              
              <Route
                path="leadership-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LeadershipIncomeReport />
                  </Suspense>
                }
              />
              <Route
                path="referral-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <ReferralReport />
                  </Suspense>
                }
              />
              <Route
                path="lavel-income-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <LevelIncomeReport />
                  </Suspense>
                }
              />
                <Route
                path="kyc-submit"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <KycSubmitPage />
                  </Suspense>
                }
              />

              <Route
                path="kyc-submit-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <KycSubmitReport />
                  </Suspense>
                }
              />
              <Route
                path="withdrawals"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Withdrawals />
                  </Suspense>
                }
              />
              <Route
                path="withdraw-report"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <WithdrawReport />
                  </Suspense>
                }
              />
              <Route
                path="transaction-history"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TransactionHistory />
                  </Suspense>
                }
              />
              <Route
                path="support"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <Support />
                  </Suspense>
                }
              />

              <Route
                path="tokenized-agreement"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <TokenizedAgreement />
                  </Suspense>
                }
              />

              <Route
                path="ul"
                element={
                  <Suspense fallback={<UserLoader />}>
                    <UserLoader />
                  </Suspense>
                }
              />
{/* user routes addes by gouri  */}
{/* <Route
  path="investments/readymade/:id"
  element={
    <Suspense fallback={<UserLoader />}>
      <ReadymadeDetails />
    </Suspense>
  }
/> */}

            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
};

export default UserRoutes;