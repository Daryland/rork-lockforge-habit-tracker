export interface BlockedApp {
  id: string;
  name: string;
  bundleId: string;
  icon: string;
  category: string;
}

export const BLOCKABLE_APPS: BlockedApp[] = [
  { id: '1', name: 'Instagram', bundleId: 'com.burbn.instagram', icon: '📸', category: 'Social' },
  { id: '2', name: 'TikTok', bundleId: 'com.zhiliaoapp.musically', icon: '🎵', category: 'Social' },
  { id: '3', name: 'Twitter / X', bundleId: 'com.atebits.Tweetie2', icon: '🐦', category: 'Social' },
  { id: '4', name: 'Facebook', bundleId: 'com.facebook.Facebook', icon: '👤', category: 'Social' },
  { id: '5', name: 'Snapchat', bundleId: 'com.toyopagroup.picaboo', icon: '👻', category: 'Social' },
  { id: '6', name: 'YouTube', bundleId: 'com.google.ios.youtube', icon: '▶️', category: 'Video' },
  { id: '7', name: 'Netflix', bundleId: 'com.netflix.Netflix', icon: '🎬', category: 'Video' },
  { id: '8', name: 'Reddit', bundleId: 'com.reddit.Reddit', icon: '🤖', category: 'Social' },
  { id: '9', name: 'Discord', bundleId: 'com.hammerandchisel.discord', icon: '💬', category: 'Social' },
  { id: '10', name: 'Clash of Clans', bundleId: 'com.supercell.magic', icon: '⚔️', category: 'Games' },
  { id: '11', name: 'Candy Crush', bundleId: 'com.king.candycrush4', icon: '🍬', category: 'Games' },
  { id: '12', name: 'Roblox', bundleId: 'com.roblox.robloxmobile', icon: '🧱', category: 'Games' },
  { id: '13', name: 'Safari', bundleId: 'com.apple.mobilesafari', icon: '🌐', category: 'Browser' },
  { id: '14', name: 'Chrome', bundleId: 'com.google.chrome.ios', icon: '🔵', category: 'Browser' },
  { id: '15', name: 'Twitch', bundleId: 'tv.twitch', icon: '🟣', category: 'Video' },
];

export const APP_CATEGORIES = ['Social', 'Video', 'Games', 'Browser'];
