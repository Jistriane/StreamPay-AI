"use client";

import React, { createContext, useContext, useMemo } from "react";

type Locale = "en";

const translations = {
  en: {
    common: {
      loading: "Loading...",
      retry: "Try Again",
      back: "Back",
      cancel: "Cancel",
      save: "Save",
      status: "Status",
      token: "Token",
      dateFrom: "From",
      dateTo: "To",
      filters: "Filters",
      clearFilters: "Clear Filters",
      total: "Total",
      requiredWallet: "Connect your wallet to use all features",
      wallet: "Wallet",
      email: "Email",
      role: "Role",
      active: "Active",
      pending: "Pending",
      paused: "Paused",
      completed: "Completed",
      cancelled: "Cancelled",
      connect: "Connect",
    },
    layout: {
      title: "StreamPay AI - Blockchain Streaming Payments",
      copyright: "© 2024 StreamPay AI. All rights reserved.",
      documentation: "Documentation",
      support: "Support",
      terms: "Terms",
    },
    header: {
      dashboard: "Dashboard",
      register: "Sign Up",
      history: "History",
      compliance: "Compliance",
      settings: "Settings",
      monitoring: "Monitoring",
      notifications: "Notifications",
      connectWallet: "Connect Wallet",
      disconnectWallet: "Disconnect",
    },
    login: {
      title: "StreamPay AI",
      subtitle: "Web3 authentication with MetaMask",
      description: "Connect your MetaMask wallet to access StreamPay AI",
      howItWorks: "How it works:",
      step1: "Click \"Connect MetaMask\"",
      step2: "Select your wallet",
      step3: "Sign the message to verify your identity",
      step4: "Receive your JWT to access the platform",
      networkReminder: "Make sure you are on the Sepolia Testnet",
      install: "Don't have MetaMask? Install here",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome to StreamPay AI",
      createStream: "Create Stream",
      disconnect: "Disconnect",
      accountInfo: "Account Information",
      wallet: "Wallet",
      notConnected: "Not connected",
      email: "Email",
      role: "Role",
      stats: "Statistics",
      activeStreams: "Active Streams",
      totalDeposited: "Total Deposited",
      statusActive: "Active",
      activeListTitle: "Active Streams",
      loadingStreams: "Loading streams...",
      errorLoading: "Error loading streams",
      noActive: "No active streams right now",
      claim: "Claim",
      details: "Details",
      historyTitle: "History",
      actionsTitle: "Available Actions",
      refresh: "Refresh",
      fullHistory: "Full History",
      retry: "Try Again",
      monthlyEstimate: "Monthly estimate",
    },
    register: {
      subtitle: "Create your account to get started",
      name: "Name",
      email: "Email",
      password: "Password",
      submit: "Register",
      success: "Registration successful!",
      alreadyHave: "Already have an account?",
      login: "Login",
      registering: "Registering...",
      errorPrefix: "Error",
    },
    history: {
      title: "History",
      subtitle: "All your streams and transactions",
      needAuth: "You must be authenticated to view history",
      error: "Error fetching history",
      unknownError: "Unknown error",
      filters: "Filters",
      status: "Status",
      all: "All",
      token: "Token",
      from: "From",
      to: "To",
      clear: "Clear Filters",
      showing: "Showing",
      of: "of",
      items: "streams",
      loading: "Loading history...",
      back: "Back",
      none: "No streams found for the selected filters",
      createdAt: "Created",
      amount: "Amount",
      rate: "Rate/s",
    },
    stream: {
      loading: "Loading stream details...",
      notFound: "Stream not found",
      subtitle: "Full transaction details",
      back: "Back",
      backDashboard: "Back to Dashboard",
      addresses: "Addresses",
      from: "From (Sender)",
      to: "To (Recipient)",
      values: "Values",
      deposited: "Deposited",
      claimed: "Claimed",
      flowRate: "Flow Rate",
      perSecond: "Per Second",
      perHour: "Per Hour",
      perDay: "Per Day",
      perMonth: "Per Month",
      remainingBalance: "Remaining Balance",
      actions: "Available Actions",
      processing: "Processing...",
      claim: "Claim",
      pause: "Pause",
      cancel: "Cancel",
      confirmCancel: "Are you sure you want to cancel this stream?",
      claimSuccess: "Stream claimed successfully!",
      pauseSuccess: "Stream paused successfully!",
      cancelSuccess: "Stream cancelled successfully!",
      claimError: "Error claiming stream",
      pauseError: "Error pausing stream",
      cancelError: "Error cancelling stream",
      detailTitle: "Stream #",
      viewDetails: "View details",
    },
    compliance: {
      title: "Compliance & KYC",
      loading: "Loading KYC status...",
      status: "Status",
      reason: "Reason",
      lastCheck: "Last check",
      failure: "Failed to load KYC status.",
      approved: "approved",
      pending: "pending",
    },
    monitoring: {
      title: "Monitoring",
      loading: "Loading status...",
      failure: "Failed to load service status.",
    },
    notifications: {
      title: "Notifications",
      loading: "Loading notifications...",
      none: "No notifications found.",
    },
    settings: {
      title: "User Settings",
      loading: "Loading profile...",
      name: "Name",
      email: "Email",
      save: "Save",
      saving: "Saving...",
      updated: "Profile updated!",
      failure: "Failed to load user profile.",
    },
    chat: {
      greeting: "Hello! I'm StreamPay's AI assistant. How can I help you today?",
      assistant: "StreamPay AI",
      you: "You",
      processing: "Processing blockchain transaction...",
      needSignature: "I need your signature to continue.\n\nOpen the modal and confirm the transaction in your wallet.",
      defaultError: "Sorry, I couldn't process your message.",
      connectWallet: "Connect your wallet to use all features",
      placeholder: "Type your message... (Enter to send, Shift+Enter for a new line)",
      placeholderDisconnected: "Connect your wallet to use the chat",
      errorPrefix: "Error",
      txSuccess: "Transaction(s) sent successfully.\n\n",
    },
    web3auth: {
      connect: "Connect MetaMask",
      connecting: "Connecting...",
      signing: "Signing message...",
      verifying: "Verifying signature...",
      success: "Authenticated successfully!",
      metamaskMissing: "MetaMask not found. Install the extension!",
      verifyFailed: "Failed to verify signature",
      ensureNetwork: "Make sure MetaMask is on the Sepolia testnet",
      walletConnected: "Wallet Connected",
      disconnect: "Disconnect",
    },
    createStream: {
      title: "Create New Stream",
      successTitle: "Stream created successfully!",
      redirect: "Redirecting...",
      recipient: "Recipient Address",
      recipientHint: "42-character Ethereum address",
      token: "Token",
      depositLabel: "Deposit Amount",
      rateLabel: "Rate per second",
      monthlyEstimate: "Monthly estimate:",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      addressRequired: "Recipient address is required",
      addressInvalid: "Invalid Ethereum address (must start with 0x)",
      depositInvalid: "Deposit amount must be greater than zero",
      rateInvalid: "Rate per second must be greater than zero",
      errorCreating: "Error creating stream",
      successToast: "Stream created successfully!",
      errorToast: "Error creating stream",
    },
    txConfirm: {
      title: "Confirm transaction",
      action: "Action",
      wallet: "Wallet",
      expiresAt: "Expires at",
      sign: "Sign & Execute",
      close: "Close",
      signing: "Awaiting signature...",
      preparing: "Preparing transactions...",
      sending: "Sending transactions...",
      done: "Transactions sent successfully!",
      ready: "ready",
      error: "error",
      sent: "Sent transactions:",
      confirmed: "confirmed",
      failed: "failed",
      pending: "pending",
      metaMaskMissing: "MetaMask not found. Install the extension.",
      needsAuth: "You must be authenticated (missing token). Please log in again.",
      noTxReturned: "No transaction returned to execute.",
      failedTx: "Transaction failed (revert):",
      failedBackend: "Failed to prepare transaction in the backend.",
    },
  },
} as const;

type Dictionary = typeof translations.en;

type I18nContextValue = {
  locale: Locale;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (key) => key,
});

export function I18nProvider({ children, locale = "en" }: { children: React.ReactNode; locale?: Locale }) {
  const dict = translations[locale] || translations.en;

  const translate = useMemo(() => {
    return (key: string) => {
      const segments = key.split(".");
      let value: any = dict as Dictionary;
      for (const segment of segments) {
        value = value?.[segment as keyof Dictionary];
        if (value === undefined || value === null) break;
      }
      return typeof value === "string" ? value : key;
    };
  }, [dict]);

  return (
    <I18nContext.Provider value={{ locale, t: translate }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Locale };
