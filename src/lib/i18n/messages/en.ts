export const en = {
  nav: {
    dashboard: "Dashboard",
    planning: "Planning",
    accounts: "Accounts",
    goals: "Goals",
    more: "More",
  },
  a11y: {
    mainNavigation: "Main navigation",
    dismiss: "Dismiss",
  },
  auth: {
    fields: {
      email: "Email",
      password: "Password",
      newPassword: "New password",
    },
    login: {
      title: "Welcome back",
      lead: "Sign in to continue managing your wealth.",
      submit: "Sign in",
      submitting: "Signing in…",
      forgotPassword: "Forgot password?",
      noAccount: "Don't have an account?",
      createAccount: "Create account",
    },
    register: {
      title: "Create your account",
      lead: "Start building a clear picture of your financial life.",
      submit: "Create account",
      submitting: "Creating account…",
      passwordHint: "At least 8 characters.",
      hasAccount: "Already have an account?",
      signIn: "Sign in",
    },
    verify: {
      title: "Verify your email",
      lead: "We sent a confirmation link to your inbox. Verify your email to continue.",
      continue: "I've verified my email",
      resend: "Resend confirmation email",
      resendSuccess: "Confirmation email sent.",
      notVerifiedYet: "Email not verified yet. Check your inbox and try again.",
      noEmail: "No email on file",
      signOut: "Sign out",
    },
    forgot: {
      title: "Reset your password",
      lead: "Enter your email and we'll send you a reset link.",
      sent: "If an account exists for that email, a reset link is on its way.",
      submit: "Send reset link",
      submitting: "Sending…",
      remembered: "Remember your password?",
      backToLogin: "Back to sign in",
    },
    reset: {
      title: "Set a new password",
      lead: "Choose a new password for your account.",
      submit: "Update password",
      submitting: "Updating…",
    },
    sessionExpired: "Your session has expired. Please sign in again.",
  },
  common: {
    back: "Back",
    brandName: "NUME",
    loading: "…",
    emptyValue: "—",
    save: "Save",
    cancel: "Cancel",
    retry: "Try again",
    required: "Required",
    optional: "Optional",
    active: "Active",
    currency: {
      code: "EGP",
      zeroPlaceholder: "0",
    },
    time: {
      minutesAgo: "{count}m ago",
      hoursAgo: "{count}h ago",
    },
    discardChanges: {
      title: "Discard changes?",
      description: "Any unsaved changes will be lost.",
      confirm: "Discard",
      cancel: "Keep editing",
    },
    accountCreated: "Account created",
    recordSaved: "Record saved",
    incomeRecorded: "Income recorded",
    expenseRecorded: "Expense recorded",
    adjustmentRecorded: "Adjustment recorded",
  },
  dashboard: {
    title: "Dashboard",
    netWorth: {
      title: "Net worth",
      assets: "Assets",
      liabilities: "Liabilities",
      updated: "Updated {time}",
      justNow: "just now",
      addFirstAccount: "Add your first account",
      error: "Unable to load net worth",
      subline:
        "{assetsLabel} {assets} · {liabilitiesLabel} {liabilities}",
    },
    setup: {
      title: "Add your first account",
      description: "Track your wealth starting here",
      action: "Add",
    },
    widgets: {
      financialHealth: {
        title: "Financial health",
        body: "A simple score based on your emergency fund, savings rate, and debt exposure.",
        hint: "Becomes available as you continue setting up NUME.",
      },
      emergencyFund: {
        title: "Emergency fund",
        body: "See how many months of expenses your designated assets can cover.",
        hint: "Configure your target once accounts and monthly expenses are in place.",
      },
      cashFlow: {
        title: "Cash flow",
        body: "Your monthly income minus expenses — the capacity you have each month.",
        hint: "Set up in Planning when you're ready to model your month.",
      },
      goals: {
        title: "Goals",
        body: "Track progress toward the milestones that matter to you.",
        hint: "Create goals once you understand your current position.",
      },
    },
    activity: {
      title: "Recent activity",
      recordMeta: "{account} · {date}",
    },
  },
  planning: {
    title: "Planning",
    empty: {
      title: "Plan your money with confidence.",
      body: "Planning helps you understand how your monthly income and expenses shape the decisions ahead.",
      linkAccounts: "Start with your accounts",
    },
  },
  goals: {
    title: "Goals",
    empty: {
      title: "Turn your financial goals into a plan.",
      body: "Goals become more meaningful once you understand your current position and monthly capacity.",
      linkAccounts: "Set up your accounts first",
    },
  },
  accounts: {
    title: "Accounts",
    addAccount: "Add account",
    createAccount: "Create account",
    creating: "Creating…",
    sections: {
      money: "Money accounts",
      certificates: "Certificates",
      basic: "Basic information",
      balance: "Balance",
    },
    types: {
      currentAccount: "Current account",
      cash: "Cash",
      wallet: "Wallet",
      savingsAccount: "Savings account",
      certificate: "Certificate",
      gold: "Gold",
      loan: "Loans",
    },
    empty: {
      title: "Your accounts live here",
      description:
        "Add the account you use every day to start tracking where your money is held.",
      action: "Start with your first account",
    },
    list: {
      meta: "{institution} · {type}",
    },
    filters: {
      label: "Account filter",
      active: "Active",
      archived: "Archived",
    },
    status: {
      archived: "Archived",
    },
    archived: {
      empty: {
        title: "No archived accounts",
        description: "Archived accounts appear here and stay out of net worth.",
      },
    },
    edit: {
      title: "Edit account",
      submit: "Save changes",
      saving: "Saving…",
      success: "Account updated",
    },
    add: {
      title: "Add account",
      chooseType: "Account type",
      lead: "Enter the account name and today's balance.",
      certificateLead: "Track a fixed-term deposit with expected returns.",
      balanceHint: "Use the balance you see in your bank app today.",
      comingSoon: "Coming soon",
      firstAccount: {
        title: "Add your first account",
        lead: "Start with one account you use every day. You can add more later.",
        cta: "Continue",
      },
      currentAccount: {
        title: "Add account",
      },
      success: "Account created",
    },
    fields: {
      name: {
        label: "Account name",
        placeholder: "e.g. Main checking",
      },
      institution: {
        label: "Institution",
        placeholder: "Select institution",
        empty: "No institutions added yet",
      },
      balance: {
        label: "Current balance",
      },
      settings: {
        title: "Account settings",
      },
    },
    settings: {
      includeInNetWorth: {
        label: "Include in net worth",
        description: "Contributes to your net worth calculation",
      },
      includeInEmergencyFund: {
        label: "Include in emergency fund",
        description: "Counts toward emergency fund coverage",
      },
    },
    details: {
      settingsTitle: "Settings",
      currentBalance: "Current balance",
      records: {
        title: "Recent records",
        empty: "No records yet. Add a record to track balance changes.",
      },
      addRecord: "Add record",
      edit: "Edit account",
      archiveAccount: "Archive account",
      archiveSuccess: "Account archived",
      restoreAccount: "Restore account",
      restoreRestoring: "Restoring…",
      restoreSuccess: "Account restored",
      archiveConfirm: {
        title: "Archive this account?",
        description:
          "This removes the account from active views and net worth. Records are preserved.",
        confirm: "Archive account",
        archiving: "Archiving…",
        cancel: "Cancel",
      },
      notFound: "Account not found",
      notFoundDescription: "This account may have been removed.",
    },
    validation: {
      nameRequired: "Account name is required",
      balanceRequired: "Current balance is required",
      balanceInvalid: "Enter a valid amount",
      balanceNegative: "Balance cannot be negative",
      institutionRequired: "Institution is required",
    },
  },
  institutions: {
    categories: {
      banks: "Banks",
      financialServices: "Financial services",
    },
    searchPlaceholder: "Search institutions",
    noResults: "No institutions found",
    other: "Other",
    customName: {
      label: "Custom institution name",
      placeholder: "Enter institution name",
    },
    banks: {
      nbe: "National Bank of Egypt",
      banqueMisr: "Banque Misr",
      cib: "Commercial International Bank",
      qnb: "QNB Alahli",
      hsbc: "HSBC Egypt",
      alexBank: "Bank of Alexandria",
      fab: "First Abu Dhabi Bank",
      adib: "Abu Dhabi Islamic Bank",
    },
    financialServices: {
      thndr: "Thndr",
      klivvr: "Klivvr",
      souhoula: "Souhoula",
      valu: "ValU",
      contact: "Contact",
      mntHalan: "MNT-Halan",
      telda: "Telda",
      bokra: "Bokra",
      fawry: "Fawry",
      lucky: "Lucky",
    },
  },
  certificates: {
    create: {
      title: "Add certificate",
      submit: "Create certificate",
      creating: "Creating…",
      success: "Certificate created",
    },
    edit: {
      title: "Edit certificate",
      submit: "Save changes",
      saving: "Saving…",
      success: "Certificate updated",
    },
    fields: {
      name: {
        label: "Certificate name",
        placeholder: "e.g. 12-month CD",
      },
      institution: {
        label: "Institution name",
        placeholder: "Select institution",
      },
      principal: {
        label: "Principal amount",
        hint: "The amount locked in this certificate.",
      },
      rate: {
        label: "Annual interest rate (%)",
        hint: "Fixed annual rate before tax.",
      },
      purchaseDate: {
        label: "Purchase date",
      },
      term: {
        label: "Term",
        custom: "Custom years",
        yearOne: "1 year",
        yearsCount: "{count} years",
      },
      payoutFrequency: {
        label: "Payout frequency",
      },
      interestDestination: {
        label: "Interest destination",
        description: "Where should certificate interest be paid?",
        placeholder: "Select account",
        searchPlaceholder: "Search accounts",
        noResults: "No matching accounts",
        notSelected: "Not selected",
      },
    },
    payoutFrequency: {
      instantly: "Instantly",
      monthly: "Monthly",
      quarterly: "Quarterly",
      semi_annual: "Semi-annual",
      annual: "Annual",
      at_maturity: "At maturity",
    },
    status: {
      active: "Active",
      matured: "Matured",
      archived: "Archived",
    },
    details: {
      summary: "Summary",
      outcomes: "Expected outcomes",
      principal: "Principal",
      rate: "Annual interest rate",
      purchaseDate: "Purchase date",
      maturityDate: "Maturity date",
      remainingDays: "Remaining days",
      remainingDaysCount: "{count} days",
      remainingDayCount: "1 day",
      status: "Status",
      expectedProfit: "Expected profit",
      expectedTotalReturn: "Expected total return",
      nextPayoutDate: "Next payout date",
      upfrontPayout: "Upfront payout",
      payoutFrequency: "Payout frequency",
      interestPayout: {
        title: "Interest payout",
        frequency: "Frequency",
        amount: "Amount",
        destination: "Destination",
        notSelected: "Not selected",
      },
      noNextPayout: "No upcoming payout",
      edit: "Edit certificate",
      archive: "Archive certificate",
      archiveSuccess: "Certificate archived",
      archiveConfirm: {
        title: "Archive this certificate?",
        description:
          "This removes the certificate from your active accounts and net worth.",
        confirm: "Archive certificate",
        archiving: "Archiving…",
        cancel: "Cancel",
      },
      notFound: "Certificate not found",
      notFoundDescription: "This certificate may have been archived or removed.",
    },
    validation: {
      nameRequired: "Certificate name is required",
      principalRequired: "Principal amount is required",
      principalPositive: "Principal must be greater than zero",
      rateRequired: "Annual interest rate is required",
      rateNegative: "Rate cannot be negative",
      rateMax: "Rate cannot exceed 9999%",
      purchaseDateRequired: "Purchase date is required",
      purchaseDateFuture: "Purchase date cannot be in the future",
      termRequired: "Enter a valid term in years",
      termMin: "Term must be at least 1 month",
      termMax: "Term cannot exceed 50 years",
      termYearsMin: "Enter at least 1 year",
      termYearsMax: "Term cannot exceed 50 years",
    },
  },
  records: {
    add: {
      title: "Add record",
      income: {
        title: "Add income",
        description: "Money received into account",
      },
      expense: {
        title: "Add expense",
        description: "Money spent from account",
      },
      adjustment: {
        title: "Adjustment",
        description: "Correct account balance",
      },
      save: "Save record",
      saving: "Saving…",
    },
    fields: {
      amount: "Amount",
      description: {
        label: "Description",
        placeholder: {
          income: "e.g. Salary",
          expense: "e.g. Groceries",
        },
      },
      reason: {
        label: "Reason",
        placeholder: "e.g. Bank reconciliation",
      },
      date: "Date",
      correctBalance: "Correct balance",
    },
    preview: {
      newBalance: "New balance",
      currentBalance: "Current balance",
      adjustment: "Adjustment",
    },
    insufficientBalance:
      "This expense exceeds your current balance. You can still save this record.",
    adjustmentNoChange: "Correct balance matches the current balance.",
    validation: {
      amountRequired: "Amount is required",
      amountInvalid: "Enter a valid amount",
      amountZero: "Amount must be greater than zero",
      correctBalanceRequired: "Correct balance is required",
      dateRequired: "Date is required",
      dateFuture: "Date cannot be in the future",
    },
    types: {
      income: "Income",
      expense: "Expense",
      adjustment: "Adjustment",
    },
  },
  more: {
    title: "More",
    profile: {
      title: "Profile",
      description: "Your name and personal details",
      name: "Full name",
      email: "Email",
      stub: "Profile editing will be available in a future update.",
    },
    appearance: {
      title: "Appearance",
      description: "Theme and display preferences",
      theme: "Theme",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
      stub: "Theme selection will be fully available in a future update.",
    },
    language: {
      title: "Language",
      description: "App language",
      current: "English",
      english: "English",
      arabic: "Arabic",
      stub: "Choose the language you prefer for NUME.",
      previewNote:
        "Switching language restarts the app and opens the dashboard in your chosen language.",
    },
    about: {
      title: "About NUME",
      description:
        "NUME is your personal wealth operating system — understand, manage, and grow your financial life.",
      version: "Version {version}",
    },
    logout: "Log out",
  },
} as const;

type DeepStringRecord<T> = T extends object
  ? { [K in keyof T]: DeepStringRecord<T[K]> }
  : string;

export type Messages = DeepStringRecord<typeof en>;
export type MessageKey = string;
