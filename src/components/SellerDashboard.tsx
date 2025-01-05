"use client";
import { useEffect, useState } from "react";
import {
  AccountStatus,
  getStripeConnectAccountStatus
} from "../../actions/getStripeConnectAccountStatus";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { createStripeConnectLoginLink } from "../../actions/createStripeConnectLoginLink";
import { ClipLoader } from "react-spinners";
import { CalendarDays, Link, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { createStripeConnectCustomers } from "../../actions/createStripeConnectCustomer";

const SellerDashboard = () => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(
    null
  );
  const router = useRouter();
  const { user } = useUser();
  const stripeConnectId = useQuery(api.users.getUserStripeConnectId, {
    userId: user?.id || ""
  });
  const acceptPayments =
    accountStatus?.isActive && accountStatus?.chargesEnabled;

  useEffect(() => {
    if (stripeConnectId) {
      fetchAccounStatus();
    }
  }, [stripeConnectId]);

  if (stripeConnectId === undefined) {
    <ClipLoader />;
  }

  const fetchAccounStatus = async () => {
    if (stripeConnectId) {
      try {
        const status = await getStripeConnectAccountStatus(stripeConnectId);
        setAccountStatus(status);
      } catch (error) {
        console.log("Stripe Connect ID not found", error);
      }
    }
  };

  const handleManageAccount = async () => {
    try {
      if (stripeConnectId && accountStatus?.isActive) {
        const loginUrl = await createStripeConnectLoginLink(stripeConnectId);
        router.push(loginUrl);
      }
    } catch (error) {
      console.error("Error managing account:", error);
      setError(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          <p className="text-sm text-blue-200 mt-2">
            Manage your seller profile and event settings
          </p>
        </div>

        {/* Main Content */}
        {acceptPayments && (
          <>
            <div className="bg-white p-8 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Sell tickets for your events
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                List your events and start selling tickets to your audience.
              </p>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-center gap-4">
                  <Link
                    href="/seller/new-event"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg
                     hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create New Event
                  </Link>
                  <Link
                    href="/seller/events"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg
                     hover:bg-gray-200 transition-colors"
                  >
                    <CalendarDays className="w-5 h-5" />
                    View Events
                  </Link>
                </div>
              </div>
            </div>

            <hr className="my-8" />
          </>
        )}
        <div className="p-6">
          {/* Account Create Section */}
          {!stripeConnectId && !accountCreatePending && (
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">
                Start Accepting Payments
              </h3>
              <p className="text-gray-600 mb-6">
                Connect your Stripe account to start accepting payments for your
                events.
              </p>
              <Button
                onClick={async () => {
                  setAccountCreatePending(true);
                  setError(false);
                  try {
                    await createStripeConnectCustomers();
                    setAccountCreatePending(false);
                  } catch (error) {
                    console.error(
                      "Error creating Stripe Connect Customer:",
                      error
                    );
                    setError(true);
                    setAccountCreatePending(false);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Seller Accounts
              </Button>
            </div>
          )}

          {/* Account Status Section */}
          {stripeConnectId && accountStatus && (
            <div className="space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Account Status Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Account Status
                  </h3>
                  <div className="mt-2 flex items-center">
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${accountStatus.isActive ? "bg-green-500" : "bg-yellow-500"}`}
                    />
                    <span className="text-lg font-semibold">
                      {accountStatus.isActive ? "Active" : "Pending"}
                    </span>
                  </div>
                </div>

                {/* Payment Status Card */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-500">
                    Payment Capability
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center">
                      <svg
                        className={`w-5 h-5 ${
                          accountStatus.chargesEnabled
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2">
                        {accountStatus.chargesEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <svg
                        className={`w-5 h-5 ${
                          accountStatus.payoutsEnabled
                            ? "text-green-500"
                            : "text-gray-400"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-2">
                        {accountStatus.payoutsEnabled
                          ? "Can recieve payouts"
                          : "Cannot receive payouts yet"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
