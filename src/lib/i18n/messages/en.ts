export const en = {
  nav: {
    dashboard: "Dashboard",
    planning: "Planning",
    accounts: "Accounts",
    goals: "Goals",
    more: "More",
  },
  common: {
    back: "Back",
    save: "Save",
    cancel: "Cancel",
    retry: "Try again",
    required: "Required",
    optional: "Optional",
    active: "Active",
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
      basic: "Basic information",
      balance: "Balance",
    },
    types: {
      currentAccount: "Current account",
    },
    empty: {
      title: "Your accounts live here",
      description:
        "Add a current account to start tracking where your money is held.",
    },
    add: {
      title: "Add account",
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
      notFound: "Account not found",
      notFoundDescription: "This account may have been removed.",
    },
    validation: {
      nameRequired: "Account name is required",
      balanceRequired: "Current balance is required",
      balanceInvalid: "Enter a valid amount",
      balanceNegative: "Balance cannot be negative",
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
      newBalance: "New balance: {amount}",
      currentBalance: "Current balance: {amount}",
      adjustment: "Adjustment: {amount}",
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
      stub: "Arabic and additional languages will be available in a future update.",
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

export type Messages = typeof en;
export type MessageKey = string;
