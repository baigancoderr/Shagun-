# 🚀 Demo Mode - Phase 1 Implementation

## ✅ Completed Structure

### 1. **Demo Mode Context**

**File:** `src/User/Contexts/DemoModeContext.jsx`

- Global context for managing demo mode state
- Syncs with localStorage (`userDemoMode`)
- Provides `isDemoMode` state and `setIsDemoMode` function
- Available throughout the User section

**Usage:**

```jsx
import { useDemoMode } from "../Contexts/DemoModeContext";

const MyComponent = () => {
  const { isDemoMode, setIsDemoMode } = useDemoMode();
  // ...
};
```

---

### 2. **Demo Data File**

**File:** `src/User/Data/demoData.js`

- Centralized structure for all demo data
- Currently contains basic user data
- **Phase 2 will populate complete data for all routes**

**Current Structure:**

```javascript
export const demoData = {
  user: {
    /* Basic user info */
  },
  dashboard: {
    /* TODO: Add in Phase 2 */
  },
  investments: {
    /* TODO: Add in Phase 2 */
  },
  deposits: {
    /* TODO: Add in Phase 2 */
  },
  // ... more routes
};
```

**Helper Functions:**

- `getDemoData(routeName)` - Get demo data for specific route
- `isDemoModeActive()` - Check if demo mode is active

---

### 3. **Login Page Integration**

**File:** `src/User/Auth/LoginPage.jsx`

**Features:**

- Beautiful green gradient checkbox/card for demo mode
- When enabled, skips all validation and API calls
- Sets `userDemoMode` flag in localStorage
- Creates demo auth token
- Redirects directly to dashboard

**How it works:**

1. User enables "Demo Mode Login" checkbox
2. Clicks submit button
3. System sets demo mode flag
4. Navigates to dashboard without server connection

---

### 4. **UserLayout Provider**

**File:** `src/User/Layout/UserLayout.jsx`

**Provider Hierarchy:**

```jsx
<ThemeProvider>
  <DemoModeProvider>
    <SidebarProvider>
      <UserLayout />
    </SidebarProvider>
  </DemoModeProvider>
</ThemeProvider>
```

This makes `useDemoMode()` available in all User pages and components.

---

### 5. **Example Implementation - Dashboard**

**File:** `src/User/Pages/Dashboard.jsx`

**Demonstrates:**

- How to use `useDemoMode()` hook
- Disable API calls when in demo mode
- Show demo data indicator
- Conditional data display

**Pattern:**

```jsx
import { useDemoMode } from "../Contexts/DemoModeContext";
import { getDemoData } from "../Data/demoData";

const Dashboard = () => {
  const { isDemoMode } = useDemoMode();

  const { data } = useQuery({
    // ... query config
    enabled: !isDemoMode, // Key: Disable API in demo mode
  });

  // Use demo data if in demo mode
  const displayData = isDemoMode ? getDemoData("dashboard") : data;

  return (
    <div>
      {isDemoMode && (
        <div className="demo-indicator">🚀 Demo Mode Active - Sample Data</div>
      )}
      {/* Rest of component */}
    </div>
  );
};
```

---

## 📋 Phase 2 TODO

### Next Steps:

1. **Populate Demo Data** (`src/User/Data/demoData.js`)

   - [ ] Dashboard - Complete stats, charts, recent activities
   - [ ] Investments - Investment plans, active investments, history
   - [ ] Deposits - Deposit history, pending deposits
   - [ ] Withdrawals - Withdrawal history, pending requests
   - [ ] Wallets - All wallet balances
   - [ ] Referrals - Referral list, income, structure
   - [ ] Team - Team members, hierarchy, stats
   - [ ] Income Reports - ROI, Level, Referral incomes
   - [ ] Swap - Swap history, available pairs
   - [ ] Analytics - Charts and graphs data
   - [ ] Profile - User profile details
   - [ ] Support - Tickets, chat history
   - [ ] More routes as needed

2. **Implement Demo Mode in All Pages**
   Follow the Dashboard pattern:

   ```jsx
   // 1. Import hooks and data
   import { useDemoMode } from "../Contexts/DemoModeContext";
   import { getDemoData } from "../Data/demoData";

   // 2. Get demo mode state
   const { isDemoMode } = useDemoMode();

   // 3. Disable API calls
   const { data } = useQuery({
     enabled: !isDemoMode,
     // ...
   });

   // 4. Use conditional data
   const displayData = isDemoMode ? getDemoData("routeName") : data;

   // 5. Show indicator
   {
     isDemoMode && <DemoModeIndicator />;
   }
   ```

3. **Create Reusable Demo Indicator Component**
   ```jsx
   // src/User/Components/Comman/DemoModeIndicator.jsx
   const DemoModeIndicator = () => (
     <div className="demo-mode-banner">🚀 Demo Mode Active</div>
   );
   ```

---

## 🎯 How to Use (Current Phase 1)

### For Testing:

1. Go to login page: `/user/login`
2. Check the "🚀 Demo Mode Login" checkbox
3. Click submit button (no credentials needed)
4. You'll be logged in and redirected to dashboard
5. Dashboard shows demo mode indicator

### For Development:

When adding demo mode to a new page:

```jsx
import { useDemoMode } from "../Contexts/DemoModeContext";
import { getDemoData } from "../Data/demoData";

const MyPage = () => {
  const { isDemoMode } = useDemoMode();

  const { data, isLoading } = useQuery({
    queryKey: ["myData"],
    queryFn: fetchMyData,
    enabled: !isDemoMode, // Important!
  });

  const displayData = isDemoMode ? getDemoData("myPage") : data;

  // Handle loading state
  if (isLoading && !isDemoMode) {
    return <Loader />;
  }

  return (
    <div>
      {isDemoMode && (
        <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg mb-4">
          🚀 Demo Mode: Showing sample data
        </div>
      )}
      {/* Your component JSX */}
    </div>
  );
};
```

---

## 📝 Technical Details

### LocalStorage Keys:

- `userDemoMode`: "true" when demo mode is active
- `authToken`: Demo token when logged in via demo mode

### Context Structure:

```typescript
{
  isDemoMode: boolean,
  setIsDemoMode: (value: boolean) => void
}
```

### Demo Data Access:

```javascript
// Get specific route data
const dashboardData = getDemoData("dashboard");

// Check if demo mode is active (without hook)
const isDemo = isDemoModeActive();
```

---

## 🎨 UI Elements

### Login Page Demo Mode Card:

- Green gradient background
- Rocket emoji 🚀
- Clear description
- Checkbox for enabling

### Dashboard Demo Indicator:

- Green/blue gradient
- Animated pulse effect
- Clear message about sample data
- Positioned at top of page

---

## ✨ Benefits

1. **No Backend Required** - Work on UI/UX without server
2. **Fast Development** - No API delays during testing
3. **Easy Toggle** - Enable/disable from login page
4. **Proper Structure** - Clean separation of concerns
5. **Scalable** - Easy to add more routes in Phase 2

---

**Next: Phase 2 - Populate all demo data and implement across all routes!** 🚀
