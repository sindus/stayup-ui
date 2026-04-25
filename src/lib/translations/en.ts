import type { Translations } from './fr'

export const en: Translations = {
  landing: {
    header: { signIn: 'Sign in' },
    hero: {
      title: 'Stay up to date,',
      titleHighlight: 'effortlessly',
      subtitle:
        'StayUp aggregates the latest updates from your GitHub projects and YouTube channels into one personalized feed.',
      ctaStart: 'Get started for free',
      ctaSignIn: 'Sign in',
      ctaFeed: 'My feed',
    },
    features: {
      title: 'Two providers, one unified feed',
      changelog: {
        title: 'GitHub Changelog',
        description:
          'Follow releases from your favorite GitHub repositories. Receive release notes as soon as a new version is published.',
      },
      youtube: {
        title: 'YouTube Channels',
        description:
          'Stay informed of the latest videos from your favorite creators. Find the title, description, and link at a glance.',
      },
    },
    cta: {
      title: 'Ready to centralize your watch?',
      subtitleLoggedIn: 'Check your feeds and stay informed in real time.',
      subtitleGuest: 'Create your free account and add your first feed in less than a minute.',
      ctaStart: 'Sign up',
      ctaSignIn: 'Sign in',
      ctaFeed: 'My feed',
    },
    download: {
      title: 'Desktop app',
      subtitle:
        'Install StayUp on your computer to access your feeds without a browser, with system notifications and a fast startup.',
      macNote: 'Apple Silicon & Intel',
      winNote: '64-bit',
      linuxNote: 'AppImage',
      linuxDebNote: 'Debian / Ubuntu',
      allVersions: 'View all releases',
      installTitle: 'How to install',
      uninstallTitle: 'Complete uninstall',
      uninstallSubtitle:
        'To completely remove StayUp, including locally stored data and preferences:',
      platforms: {
        mac: {
          install: [
            'Open the downloaded .dmg file',
            'Drag StayUp to the Applications folder',
            'First launch: right-click → "Open" if macOS blocks the app (Gatekeeper)',
          ],
          uninstall: ['Drag StayUp from Applications to the Trash', 'Delete data and preferences:'],
          paths: [
            '~/Library/Application Support/dev.r-sik.stayup-desktop',
            '~/Library/Preferences/dev.r-sik.stayup-desktop.plist',
          ],
        },
        windows: {
          install: [
            'Run the downloaded .exe file',
            'Follow the installation wizard',
            '"More info" → "Run anyway" if Windows Defender blocks the installer',
          ],
          uninstall: ['Settings → Apps → StayUp → Uninstall', 'Delete residual data:'],
          paths: ['%APPDATA%\\dev.r-sik.stayup-desktop'],
        },
        linux: {
          formats: [
            {
              label: '.deb — Debian / Ubuntu',
              install: ['Download the .deb file', 'Install: sudo dpkg -i StayUp_0.2.0_amd64.deb'],
              uninstall: ['Uninstall: sudo dpkg --purge stay-up', 'Delete data:'],
              paths: [
                '~/.local/share/dev.r-sik.stayup-desktop',
                '~/.config/dev.r-sik.stayup-desktop',
              ],
            },
            {
              label: 'AppImage',
              install: [
                'Make the file executable: chmod +x StayUp*.AppImage',
                'Run it: ./StayUp*.AppImage',
                'Optional: move it to ~/Applications',
              ],
              uninstall: ['Delete the AppImage file', 'Delete data:'],
              paths: [
                '~/.local/share/dev.r-sik.stayup-desktop',
                '~/.config/dev.r-sik.stayup-desktop',
              ],
            },
          ],
        },
      },
    },
  },
  nav: {
    myFeed: 'My feed',
    documentation: 'Documentation',
    scrap: 'Web scraping',
    profile: 'My profile',
    signOut: 'Sign out',
  },
  scrap: {
    title: 'Web scraping',
    subtitle: 'Follow available scraped web feeds',
    subscribe: 'Follow',
    unsubscribe: 'Unfollow',
    noContent: 'No scraping feeds are available yet.',
  },
  documentation: {
    title: 'Documentation',
    subtitle: 'Track updates to technical documentation',
    subscribe: 'Follow',
    unsubscribe: 'Unfollow',
    subscribed: 'Following',
    noContent: 'No documentation is available yet.',
    noContentScrapped: 'Content has not been scraped yet.',
    currentVersion: 'Current version',
    lastUpdated: 'Updated',
    history: 'History',
    viewHistory: 'View history',
    viewContent: 'View content',
    backToDoc: 'Back to document',
    backToList: 'Back to list',
    version: 'Version',
    archivedAt: 'Archived on',
    scrapedAt: 'Scraped on',
    noDiff: 'No changes available for this version.',
    diffTitle: 'Changes — version',
  },
  auth: {
    loginTitle: 'Sign in',
    loginSubtitle: 'Sign in to your StayUp account',
    registerTitle: 'Create an account',
    registerSubtitle: 'Join StayUp to track your updates',
    name: 'Name',
    namePlaceholder: 'Your name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    confirmPassword: 'Confirm password',
    signIn: 'Sign in',
    signingIn: 'Signing in...',
    createAccount: 'Create account',
    creatingAccount: 'Creating account...',
    noAccount: 'No account yet?',
    alreadyAccount: 'Already have an account?',
    signUp: 'Sign up',
    or: 'or',
    continueWithGoogle: 'Continue with Google',
    continueWithGitHub: 'Continue with GitHub',
    emailInvalid: 'Invalid email address',
    passwordRequired: 'Password is required',
    nameTooShort: 'Name too short (min. 2 characters)',
    passwordTooShort: 'Password too short (min. 8 characters)',
    passwordMismatch: 'Passwords do not match',
  },
}
