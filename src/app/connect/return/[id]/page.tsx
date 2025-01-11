"use client";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const ReturnPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/*Header*/}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center text-white">
            <div className="flex justify-center items-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Account Connected
            </h2>
            <p className="text-green-100">
              Your Stripe account has been successfully connected. You can now
              start selling tickets on your events.
            </p>
          </div>

          {/*Content*/}
          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="font-medium text-green-900 mb-1">
                  What happens next?
                </h3>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>
                    • Manage your events and listings on the Events platform.
                  </li>
                  <li>
                    • Receive bookings and payments directly from your
                    customers.
                  </li>
                  <li>
                    • Funds will be transferred directly to your Stripe Account
                  </li>
                </ul>
              </div>

              <Link
                href="/seller"
                className="flex justify-center items-center w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg
                font-medium hover:bg-blue-700 transition-colors duration-200 gap-2"
              >
                Continue to Seller Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPage;
