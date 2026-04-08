import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
// import { bsc } from '@reown/appkit/networks';
import { bsc } from '@reown/appkit/networks';

const projectId = 'f6bef0ea518b8ce04cab9c39ff1d7559';

const networks = [bsc];

const metadata = {
  name: 'Urban RWA',
  description: 'Urban RWA Presale',
  url: 'https://urbanrwa.io' || 'http://localhost:5173',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
}

// 4. Create a AppKit instance
createAppKit({
  adapters: [new EthersAdapter()],
  networks,
  metadata,
  projectId,
  defaultOpen: false,
  allowAutoConnect: false,
  features: {
    analytics: true 
  }
})

export default createAppKit;