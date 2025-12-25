"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { ContractList } from "@/components/ContractList";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = () => {
    // Trigger contract list refresh
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Contract Automation System
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Upload and analyze rental contracts with automated data extraction
          </p>
        </header>

        {/* Upload Section */}
        <section className="mb-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </section>

        {/* Contract List Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Contracts
          </h2>
          <ContractList key={refreshKey} />
        </section>
      </div>
    </div>
  );
}
