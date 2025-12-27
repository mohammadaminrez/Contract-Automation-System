"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api, Contract } from "@/lib/api";

export default function ContractDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadContract(params.id as string);
    }
  }, [params.id]);

  const loadContract = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getContractById(id);
      setContract(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('upload.error.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!contract) return;

    if (!confirm(t('contractDetail.confirmDelete'))) {
      return;
    }

    try {
      setDeleting(true);
      await api.deleteContract(contract.id);
      router.push(`/${locale}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : t('upload.error.deleteFailed'));
      setDeleting(false);
    }
  };

  const handleExportJSON = () => {
    if (!contract) return;

    // Create a clean JSON object with all contract data
    const exportData = {
      file_name: contract.file_name,
      status: contract.status,
      uploaded_at: contract.uploaded_at,
      analyzed_at: contract.analyzed_at,
      extraction_confidence: contract.extraction_confidence,
      extracted_data: contract.extracted_data,
      payment_schedules: contract.payment_schedules,
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create a blob and download it
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${contract.file_name.replace(/\.[^/.]+$/, '')}_export.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('contractDetail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <svg
              className="mx-auto h-16 w-16 text-red-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {t('contractDetail.notFound')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {t('contractDetail.backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg
              className="h-5 w-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {t('contractDetail.backToContracts')}
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleExportJSON}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              {t('contractDetail.exportJson')}
            </button>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {deleting ? t('contractDetail.deleting') : t('contractDetail.deleteContract')}
            </button>
          </div>
        </div>

        {/* Contract Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {contract.file_name}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('contractDetail.statusLabel')}</p>
              <StatusBadge status={contract.status} t={t} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('contractDetail.confidenceLabel')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {contract.extraction_confidence !== null
                  ? `${(contract.extraction_confidence * 100).toFixed(0)}%`
                  : t('common.na')}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('contractDetail.uploadedLabel')}</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(contract.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          {contract.analyzed_at && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('contractDetail.analyzedOn')} {new Date(contract.analyzed_at).toLocaleString()}
            </p>
          )}
        </div>

        {/* Extracted Data Card */}
        {contract.extracted_data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('contractDetail.extractedData')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DataField label={t("contractDetail.fields.guestName")} value={contract.extracted_data.guest_name} t={t} />
              <DataField label={t("contractDetail.fields.birthDate")} value={contract.extracted_data.birth_date} t={t} />
              <DataField label={t("contractDetail.fields.birthPlace")} value={contract.extracted_data.birth_place} t={t} />
              <DataField label={t("contractDetail.fields.fiscalCode")} value={contract.extracted_data.fiscal_code} t={t} />
              <DataField label={t("contractDetail.fields.residenceCity")} value={contract.extracted_data.residence_city} t={t} />
              <DataField label={t("contractDetail.fields.residenceAddress")} value={contract.extracted_data.residence_address} t={t} />
              <DataField label={t("contractDetail.fields.accommodationAddress")} value={contract.extracted_data.accommodation_address} t={t} />
              <DataField label={t("contractDetail.fields.university")} value={contract.extracted_data.university} t={t} />
              <DataField label={t("contractDetail.fields.academicYear")} value={contract.extracted_data.academic_year} t={t} />
              <DataField label={t("contractDetail.fields.startDate")} value={contract.extracted_data.start_date} t={t} />
              <DataField label={t("contractDetail.fields.endDate")} value={contract.extracted_data.end_date} t={t} />
              <DataField label={t("contractDetail.fields.totalRent")} value={formatCurrency(contract.extracted_data.rent_total, t)} t={t} />
              <DataField label={t("contractDetail.fields.securityDeposit")} value={formatCurrency(contract.extracted_data.security_deposit, t)} t={t} />
            </div>
          </div>
        )}

        {/* Payment Schedules Card */}
        {contract.payment_schedules && contract.payment_schedules.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('contractDetail.paymentSchedules')}
            </h2>

            <div className="space-y-6">
              {contract.payment_schedules.map((option: any, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {option.type === 'installments' ? t('contractDetail.installmentPlan') : t('contractDetail.singlePayment')}
                    </h3>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      €{option.total_amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 mb-4">{option.description}</p>

                  {option.discount_percentage && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
                      <p className="text-green-800 dark:text-green-400 font-medium">
                        {t('contractDetail.save')} €{option.discount_amount.toFixed(2)} ({option.discount_percentage}% {t('contractDetail.discount')})
                      </p>
                    </div>
                  )}

                  {option.installments && option.installments.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t('contractDetail.table.installment')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t('contractDetail.table.description')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t('contractDetail.table.amount')}
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                              {t('contractDetail.table.dueDate')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {option.installments.map((installment: any) => (
                            <tr key={installment.installment_number}>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {installment.installment_number}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                {installment.description}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                €{installment.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {new Date(installment.due_date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    analyzing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };

  return (
    <span
      className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
        styles[status as keyof typeof styles] || styles.pending
      }`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

function DataField({ label, value, t }: { label: string; value: string | number | null | undefined; t?: any }) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white">
        {value !== null && value !== undefined && value !== '' ? value : (t ? t('common.na') : 'N/A')}
      </p>
    </div>
  );
}

function formatCurrency(value: number | null | undefined, t?: any): string {
  if (value === null || value === undefined) return t ? t('common.na') : 'N/A';
  return `€${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
