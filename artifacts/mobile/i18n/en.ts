/**
 * English catalogue — the source of truth.
 *
 * `ar.ts` is typed as `Translations`, so a missing Arabic key is a `tsc` failure rather
 * than a runtime `[missing "ar.x" translation]` in front of a user.
 *
 * Namespaced one level deep by screen, plus `common`. Flat is unmanageable past ~60
 * keys; deeper nesting fights the typed-key derivation.
 *
 * NOTE: nothing here may be resolved at module-evaluation time — see
 * `constants/services.ts`, which stores *keys* and calls `t()` at render. The locale is
 * not known when modules evaluate.
 */
export const en = {
  common: {
    retry: 'Retry',
    cancel: 'Cancel',
    ok: 'OK',
    notSet: 'Not set',
    somethingWentWrong: 'Something went wrong',
    or: 'or',
    comingSoon: 'More features are coming soon',
  },

  settings: {
    title: 'Settings',
    preferences: 'Preferences',
    language: 'Language',
    legal: 'Legal',
    logOut: 'Log out',
  },

  language: {
    english: 'English',
    arabic: 'العربية',
    applyNotice: 'Applies everywhere in the app, straight away.',
  },

  legal: {
    privacy: 'Privacy Policy',
    refund: 'Refund Policy',
    terms: 'Terms of Use',
    lastUpdated: 'Last updated',
  },

  profile: {
    account: 'Account',
    phone: 'Phone',
    memberSince: 'Member since',
    myCars: 'My Cars',
    addCar: '+ Add car',
    settings: 'Settings',
    addFirstCar: 'Add your first car',
    addFirstCarSubtitle: 'Create a QR code and stay connected',
    viewCarDetails: 'View car details',
    loadingCars: 'Loading your cars…',
    couldNotRefresh: 'Could not refresh your profile',
    fallbackName: 'Qar driver',
  },

  home: {
    greeting: 'Good morning',
    tagline: 'Your car, connected',
    findTitle: 'Find a Qar car',
    findSubtitle: 'Reach an owner or look up a vehicle',
    scanQr: 'Scan QR',
    scanQrHint: 'Use your camera',
    carNumber: 'Car Number',
    carNumberHint: 'Search by plate',
    services: 'Services',
    servicesCaption: 'Everything for your car',
    openProfile: 'Open your profile',
  },

  /** Keyed by the stable service id — `home.tsx` and `constants/services.ts` share these. */
  services: {
    maintenanceLabel: 'Maintenance',
    maintenanceSubtitle: 'Keep your car running',
    maintenanceDescription: 'Keep your car safe, reliable, and ready for the road.',
    accessoriesLabel: 'Accessories',
    accessoriesSubtitle: 'Upgrade your drive',
    accessoriesDescription: 'Discover accessories that make every drive better.',
    marketplaceLabel: 'Buy & Sell',
    marketplaceSubtitle: 'Find your next car',
    marketplaceDescription: 'Buy your next car or list your current one.',
    notificationsLabel: 'Notifications',
    notificationsSubtitle: 'Your Qar updates',
    notificationsDescription: 'Stay updated about your cars and alerts.',
    remindersLabel: 'Reminders',
    remindersSubtitle: 'Never miss a date',
    remindersDescription: 'Keep track of maintenance, renewals, and important dates.',
    sosLabel: 'SOS',
    sosSubtitle: 'Get help fast',
    sosDescription: 'Get help quickly when you need it.',
  },

  /** Replaces `humanizeActivity()`, which derived English from an API slug. */
  activity: {
    car_wash: 'Car wash',
    maintenance: 'Maintenance',
    fuel_station: 'Fuel station',
    accessories: 'Accessories',
    other: 'Other',
  },

  auth: {
    welcomeTagline: 'Smart QR management for your car',
    getStarted: 'Get started',
    continueWithGoogle: 'Continue with Google',
    signIn: 'Sign In',
    signInSubtitle: 'With email & password',
    createAccount: 'Create Account',
    createAccountSubtitle: 'Sign up with email & password',
    phoneNeverShared: 'Your phone number is never shared with anyone',
    welcomeBack: 'Welcome back to Qar',
    joinQar: 'Join Qar and protect your car',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    emailPlaceholderSignup: 'your@email.com',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    choosePassword: 'Choose a password',
    confirmPassword: 'Confirm Password',
    repeatPassword: 'Repeat your password',
    fullName: 'Full Name',
    fullNamePlaceholder: 'Your full name',
    phoneNumber: 'Phone Number',
    phonePlaceholder: '10X XXX XXXX',
    phoneHint: 'We never show your number to anyone who scans your car.',
    noAccount: "Don't have an account? ",
    createOne: 'Create one',
    haveAccount: 'Already have an account? ',
    signInLink: 'Sign in',
    agreeTo: 'I agree to the ',
    termsOfUse: 'Terms of Use',
    googleNotConfigured: 'Google sign-in is not configured yet',
    googleCancelled: 'Google sign-in was not completed',
    googleNoToken: 'Google did not return a valid identity token',
    googleEmailTaken: 'This email already has a Qar account. Sign in with your existing method first.',
    googleFailed: 'Google sign-in failed. Please try again.',
    signInFailed: 'Sign in failed',
  },

  otp: {
    title: 'Verification Code',
    subtitle: 'We sent a 4-digit code to',
    confirm: 'Confirm',
    resend: 'Resend code',
    resendIn: 'Resend code in %{seconds}s',
    verificationFailed: 'Verification failed',
    resendFailed: 'Failed to resend',
  },
  phoneAuth: {
    tagline: 'Get there in seconds',
    signIn: 'Sign In',
    newAccount: 'New Account',
    send: 'Send Verification Code',
    note: "We'll send a verification code to your number via SMS",
    invalid: 'Please enter a valid phone number',
    sendFailed: 'Failed to send code',
  },
  passwordStrength: {
    tooShort: 'Too short',
    weak: 'Weak',
    fair: 'Fair',
    strong: 'Strong',
    veryStrong: 'Very strong',
  },

  addCar: {
    title: 'Add Car',
    photo: 'Car Photo (optional)',
    change: 'Change',
    gallery: 'Gallery',
    camera: 'Camera',
    plate: 'License Plate *',
    platePlaceholder: 'e.g. ABC 1234',
    make: 'Make (Brand)',
    makePlaceholder: 'e.g. Toyota, Kia, Hyundai',
    model: 'Model',
    modelPlaceholder: 'e.g. Corolla, Sportage, i10',
    color: 'Color (optional)',
    generate: 'Generate QR Code',
    galleryPermission: 'Gallery permission is required',
    cameraPermission: 'Camera permission is required',
    plateRequired: 'License plate is required',
    createFailed: 'Failed to create car',
  },

  /** Display labels only — the value POSTed to the API is the stable `id`. */
  colors: {
    white: 'White',
    black: 'Black',
    silver: 'Silver',
    gray: 'Gray',
    red: 'Red',
    blue: 'Blue',
    green: 'Green',
    brown: 'Brown',
    yellow: 'Yellow',
    orange: 'Orange',
  },

  qr: {
    title: 'QR Code',
    licensePlate: 'License Plate',
    notAvailable: 'QR code not available',
    attachHint: 'Attach this code to your car to receive anonymous alerts',
    download: 'Download QR',
    share: 'Share',
    privacyNote:
      'When someone scans this code they can send you an alert — your phone number stays completely hidden',
    backHome: 'Back to Home',
    shareTitle: 'Share QR',
    shareBody: 'Download & share coming in the next update.',
    downloadTitle: 'Download QR',
    downloadBody: 'Download & print coming in the next update.',
  },

  scanner: {
    title: 'Scan QR Code',
    permissionTitle: 'Camera Access Required',
    permissionBody: 'We need camera access to scan QR codes',
    allow: 'Allow Access',
    looking: 'Looking up car…',
    aim: 'Point the camera at a Qar QR code',
    scanAgain: 'Scan Again',
    unreadable: 'Could not read this QR code',
  },

  searchCar: {
    title: 'Search by Car Number',
    heading: 'Find a Qar car',
    body: 'Enter the license plate number to search.',
    placeholder: 'e.g. ABC 1234',
    action: 'Search Car',
    note: 'Public car-number search will be available when enabled by the Qar server.',
  },

  scanAlert: {
    heading: 'Need to reach the car owner?',
    choose: 'Choose an alert type',
    sent: 'Alert sent successfully',
    privacy: 'Phone number is fully protected — it will never be revealed',
    failed: 'Failed to send alert',
    doubleParkedLabel: 'Blocking My Car',
    doubleParkedDescription: 'This car is blocking me in',
    lightsOnLabel: 'Lights Are On',
    lightsOnDescription: 'Car headlights are still on',
    dangerLabel: 'Danger Nearby',
    dangerDescription: 'There is a hazard near this car',
  },

  serviceBrowser: {
    menu: 'Menu',
    merchants: 'Merchants',
    noServicesTitle: 'No services yet',
    /** Complete sentence per category — never a noun injected into an English frame. */
    noServicesMaintenance: 'No maintenance shops have published a menu in your area.',
    noServicesAccessories: 'No accessories shops have published a menu in your area.',
    noShopsTitle: 'No shops yet',
    noShopsSubtitle: "We're adding partners in your area. Check back soon.",
    unavailable: 'Unavailable',
    service: 'Service',
    shop: 'Shop',
    noMenuTitle: 'No services listed',
    noMenuSubtitle: "This shop hasn't published its menu yet.",
    viewAllServices: 'View all services',
    servicesCount: 'services',
    directoryUnreachable: 'Could not reach the services directory',
    shopUnavailable: 'This shop is no longer available.',
  },

  months: {
    '1': 'January', '2': 'February', '3': 'March', '4': 'April',
    '5': 'May', '6': 'June', '7': 'July', '8': 'August',
    '9': 'September', '10': 'October', '11': 'November', '12': 'December',
  },
  format: {
    minutes: 'min',
    hours: 'h',
    currency: 'EGP',
  },

  errors: {
    emailRequired: 'Email is required',
    emailInvalid: 'Enter a valid email address',
    passwordRequired: 'Password is required',
    nameRequired: 'Name is required',
    nameTooShort: 'Name must be at least 2 characters',
    phoneRequired: 'Phone number is required',
    phoneInvalid: 'Enter a 10-digit mobile number',
    passwordTooShort: 'Password must be at least 8 characters',
    confirmRequired: 'Confirm your password',
    passwordsDoNotMatch: 'Passwords do not match',
    acceptTerms: 'Please accept the Terms of Use to continue',
  },
};

/** The catalogue shape with string values widened, so `ar.ts` can hold Arabic while
 *  still failing `tsc` on a missing or misspelled key. */
export type Translations = {
  [K in keyof typeof en]: { [P in keyof (typeof en)[K]]: string };
};
