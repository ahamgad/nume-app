import type { Messages } from "./en";

export const ar = {
  nav: {
    dashboard: "لوحة التحكم",
    planning: "التخطيط",
    accounts: "الحسابات",
    goals: "الأهداف",
    more: "المزيد",
  },
  a11y: {
    mainNavigation: "التنقل الرئيسي",
    dismiss: "إغلاق",
  },
  auth: {
    fields: {
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      newPassword: "كلمة مرور جديدة",
    },
    login: {
      title: "مرحبًا بعودتك",
      lead: "سجّل الدخول لمتابعة إدارة ثروتك.",
      submit: "تسجيل الدخول",
      submitting: "جارٍ تسجيل الدخول…",
      forgotPassword: "نسيت كلمة المرور؟",
      noAccount: "ليس لديك حساب؟",
      createAccount: "إنشاء حساب",
    },
    register: {
      title: "أنشئ حسابك",
      lead: "ابدأ في بناء صورة واضحة لحياتك المالية.",
      submit: "إنشاء حساب",
      submitting: "جارٍ إنشاء الحساب…",
      passwordHint: "ثمانية أحرف على الأقل.",
      hasAccount: "لديك حساب بالفعل؟",
      signIn: "تسجيل الدخول",
    },
    verify: {
      title: "تحقق من بريدك الإلكتروني",
      lead: "أرسلنا رابط تأكيد إلى بريدك. تحقق من بريدك للمتابعة.",
      continue: "لقد تحققت من بريدي",
      resend: "إعادة إرسال رسالة التأكيد",
      resendSuccess: "تم إرسال رسالة التأكيد.",
      notVerifiedYet: "لم يتم التحقق من البريد بعد. راجع بريدك وحاول مرة أخرى.",
      noEmail: "لا يوجد بريد إلكتروني مسجّل",
      signOut: "تسجيل الخروج",
    },
    forgot: {
      title: "إعادة تعيين كلمة المرور",
      lead: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.",
      sent: "إذا وُجد حساب لهذا البريد، فقد أُرسل رابط إعادة التعيين.",
      submit: "إرسال رابط إعادة التعيين",
      submitting: "جارٍ الإرسال…",
      remembered: "تذكرت كلمة المرور؟",
      backToLogin: "العودة لتسجيل الدخول",
    },
    reset: {
      title: "تعيين كلمة مرور جديدة",
      lead: "اختر كلمة مرور جديدة لحسابك.",
      submit: "تحديث كلمة المرور",
      submitting: "جارٍ التحديث…",
    },
    sessionExpired: "انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.",
  },
  common: {
    back: "رجوع",
    brandName: "NUME",
    loading: "…",
    emptyValue: "—",
    save: "حفظ",
    cancel: "إلغاء",
    retry: "حاول مرة أخرى",
    required: "مطلوب",
    optional: "اختياري",
    active: "نشط",
    currency: {
      code: "ج.م",
      zeroPlaceholder: "0",
    },
    time: {
      minutesAgo: "منذ {count} د",
      hoursAgo: "منذ {count} س",
    },
    discardChanges: {
      title: "تجاهل التغييرات؟",
      description: "ستُفقد أي تغييرات غير محفوظة.",
      confirm: "تجاهل",
      cancel: "متابعة التعديل",
    },
    accountCreated: "تم إنشاء الحساب",
    recordSaved: "تم حفظ السجل",
    incomeRecorded: "تم تسجيل الدخل",
    expenseRecorded: "تم تسجيل المصروف",
    adjustmentRecorded: "تم تسجيل التعديل",
  },
  dashboard: {
    title: "لوحة التحكم",
    netWorth: {
      title: "صافي الثروة",
      assets: "الأصول",
      liabilities: "الالتزامات",
      updated: "آخر تحديث {time}",
      justNow: "الآن",
      addFirstAccount: "أضف حسابك الأول",
      error: "تعذّر تحميل صافي الثروة",
      subline: "{assetsLabel} {assets} · {liabilitiesLabel} {liabilities}",
    },
    setup: {
      title: "أضف حسابك الأول",
      description: "ابدأ تتبع ثروتك من هنا",
      action: "إضافة",
    },
    widgets: {
      financialHealth: {
        title: "الصحة المالية",
        body: "مؤشر بسيط يعتمد على صندوق الطوارئ ومعدل الادخار والتعرّض للديون.",
        hint: "يصبح متاحًا مع متابعة إعداد NUME.",
      },
      emergencyFund: {
        title: "صندوق الطوارئ",
        body: "اعرف كم شهرًا من المصروفات يغطيه ما خصصته للطوارئ.",
        hint: "اضبط هدفك بعد إعداد الحسابات والمصروفات الشهرية.",
      },
      cashFlow: {
        title: "التدفق النقدي",
        body: "دخلك الشهري ناقص مصروفاتك — القدرة المتاحة لك كل شهر.",
        hint: "يُعدّ في التخطيط عندما تكون جاهزًا لنمذجة شهرك.",
      },
      goals: {
        title: "الأهداف",
        body: "تابع تقدمك نحو المحطات التي تهمك.",
        hint: "أنشئ أهدافًا بعد فهم وضعك الحالي.",
      },
    },
    activity: {
      title: "النشاط الأخير",
      recordMeta: "{account} · {date}",
    },
  },
  planning: {
    title: "التخطيط",
    empty: {
      title: "خطّط لأموالك بثقة.",
      body: "يساعدك التخطيط على فهم كيف يشكّل دخلك ومصروفاتك الشهرية قراراتك القادمة.",
      linkAccounts: "ابدأ بحساباتك",
    },
  },
  goals: {
    title: "الأهداف",
    empty: {
      title: "حوّل أهدافك المالية إلى خطة.",
      body: "تصبح الأهداف أكثر معنى بعد فهم وضعك الحالي وقدرتك الشهرية.",
      linkAccounts: "أعدّ حساباتك أولًا",
    },
  },
  accounts: {
    title: "الحسابات",
    addAccount: "إضافة حساب",
    createAccount: "إنشاء حساب",
    creating: "جارٍ الإنشاء…",
    sections: {
      money: "حسابات النقد",
      basic: "المعلومات الأساسية",
      balance: "الرصيد",
    },
    types: {
      currentAccount: "حساب جاري",
      cash: "نقد",
      wallet: "محفظة",
    },
    empty: {
      title: "حساباتك هنا",
      description: "أضف الحساب الذي تستخدمه يوميًا لتبدأ تتبع أموالك.",
      action: "ابدأ بحسابك الأول",
    },
    list: {
      meta: "{institution} · {type}",
    },
    add: {
      title: "إضافة حساب",
      chooseType: "نوع الحساب",
      lead: "أدخل اسم الحساب ورصيده اليوم.",
      balanceHint: "استخدم الرصيد الظاهر في تطبيق البنك اليوم.",
      firstAccount: {
        title: "أضف حسابك الأول",
        lead: "ابدأ بحساب واحد تستخدمه يوميًا. يمكنك إضافة المزيد لاحقًا.",
        cta: "متابعة",
      },
      currentAccount: {
        title: "إضافة حساب",
      },
      success: "تم إنشاء الحساب",
    },
    fields: {
      name: {
        label: "اسم الحساب",
        placeholder: "مثال: الحساب الجاري",
      },
      institution: {
        label: "المؤسسة",
        placeholder: "اختر المؤسسة",
        empty: "لم تُضف مؤسسات بعد",
      },
      balance: {
        label: "الرصيد الحالي",
      },
      settings: {
        title: "إعدادات الحساب",
      },
    },
    settings: {
      includeInNetWorth: {
        label: "إدراج في صافي الثروة",
        description: "يُحسب ضمن صافي ثروتك",
      },
      includeInEmergencyFund: {
        label: "إدراج في صندوق الطوارئ",
        description: "يُحسب ضمن تغطية صندوق الطوارئ",
      },
    },
    details: {
      settingsTitle: "الإعدادات",
      currentBalance: "الرصيد الحالي",
      records: {
        title: "السجلات الأخيرة",
        empty: "لا توجد سجلات بعد. أضف سجلًا لتتبع تغيّرات الرصيد.",
      },
      addRecord: "إضافة سجل",
      deleteAccount: "حذف الحساب",
      deleteSuccess: "تم حذف الحساب",
      deleteConfirm: {
        title: "حذف هذا الحساب؟",
        description: "سيُزال الحساب وسجلاته. لا يمكن التراجع عن هذا الإجراء.",
        confirm: "حذف الحساب",
        deleting: "جارٍ الحذف…",
        cancel: "إلغاء",
      },
      notFound: "الحساب غير موجود",
      notFoundDescription: "ربما أُزيل هذا الحساب.",
    },
    validation: {
      nameRequired: "اسم الحساب مطلوب",
      balanceRequired: "الرصيد الحالي مطلوب",
      balanceInvalid: "أدخل مبلغًا صالحًا",
      balanceNegative: "لا يمكن أن يكون الرصيد سالبًا",
    },
  },
  records: {
    add: {
      title: "إضافة سجل",
      income: {
        title: "إضافة دخل",
        description: "أموال واردة إلى الحساب",
      },
      expense: {
        title: "إضافة مصروف",
        description: "أموال خرجت من الحساب",
      },
      adjustment: {
        title: "تعديل",
        description: "تصحيح رصيد الحساب",
      },
      save: "حفظ السجل",
      saving: "جارٍ الحفظ…",
    },
    fields: {
      amount: "المبلغ",
      description: {
        label: "الوصف",
        placeholder: {
          income: "مثال: الراتب",
          expense: "مثال: البقالة",
        },
      },
      reason: {
        label: "السبب",
        placeholder: "مثال: مطابقة بنكية",
      },
      date: "التاريخ",
      correctBalance: "الرصيد الصحيح",
    },
    preview: {
      newBalance: "الرصيد الجديد",
      currentBalance: "الرصيد الحالي",
      adjustment: "التعديل",
    },
    insufficientBalance:
      "هذا المصروف يتجاوز رصيدك الحالي. يمكنك حفظ السجل على أي حال.",
    adjustmentNoChange: "الرصيد الصحيح يطابق الرصيد الحالي.",
    validation: {
      amountRequired: "المبلغ مطلوب",
      amountInvalid: "أدخل مبلغًا صالحًا",
      amountZero: "يجب أن يكون المبلغ أكبر من صفر",
      correctBalanceRequired: "الرصيد الصحيح مطلوب",
      dateRequired: "التاريخ مطلوب",
      dateFuture: "لا يمكن أن يكون التاريخ في المستقبل",
    },
    types: {
      income: "دخل",
      expense: "مصروف",
      adjustment: "تعديل",
    },
  },
  more: {
    title: "المزيد",
    profile: {
      title: "الملف الشخصي",
      description: "اسمك وبياناتك الشخصية",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      stub: "تعديل الملف الشخصي سيتاح في تحديث لاحق.",
    },
    appearance: {
      title: "المظهر",
      description: "السمة وتفضيلات العرض",
      theme: "السمة",
      themeSystem: "النظام",
      themeLight: "فاتح",
      themeDark: "داكن",
      stub: "اختيار السمة سيتاح بالكامل في تحديث لاحق.",
    },
    language: {
      title: "اللغة",
      description: "لغة التطبيق",
      current: "العربية",
      english: "English",
      arabic: "العربية",
      stub: "اختر اللغة التي تفضلها لـ NUME.",
      previewNote:
        "تغيير اللغة يحدّث الخط والاتجاه والنصوص المترجمة.",
    },
    about: {
      title: "عن NUME",
      description:
        "NUME هو نظامك التشغيلي للثروة الشخصية — افهم وأدر ونمِّ حياتك المالية.",
      version: "الإصدار {version}",
    },
    logout: "تسجيل الخروج",
  },
} satisfies Messages;
