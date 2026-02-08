"use client";

import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Papa from "papaparse";
import { FileDown } from "lucide-react";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuth } from "@/context/auth-context";
import { useI18n } from "@/hooks/use-i18n";
import { apiGet } from "@/lib/client-api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TransactionDTO } from "@/types";

type MonthlyReport = {
  month: string;
  periodStart: string;
  periodEnd: string;
  totalIncome: number;
  totalExpense: number;
  net: number;
  expenseByCategory: Array<{ category: string; amount: number }>;
  transactions: TransactionDTO[];
};

function downloadBlob(content: Blob, fileName: string) {
  const url = URL.createObjectURL(content);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [fetching, setFetching] = useState(true);

  async function loadReport(nextMonth = month) {
    try {
      setFetching(true);
      const payload = await apiGet<MonthlyReport>(`/api/reports/monthly?month=${nextMonth}`);
      setReport(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load report");
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    void loadReport(month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reportTitle = useMemo(() => `Financial Report - ${month}`, [month]);

  function exportCsv() {
    if (!report) return;

    const csv = Papa.unparse(
      report.transactions.map((item) => ({
        title: item.title,
        amount: item.amount,
        category: item.category,
        type: item.type,
        date: item.date.slice(0, 10),
        notes: item.notes || "",
      })),
    );

    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `report-${month}.csv`);
    toast.success("CSV exported");
  }

  function exportPdf() {
    if (!report) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(reportTitle, 14, 18);
    doc.setFontSize(10);
    doc.text(`Income: ${formatCurrency(report.totalIncome, user?.currency || "USD")}`, 14, 28);
    doc.text(`Expense: ${formatCurrency(report.totalExpense, user?.currency || "USD")}`, 14, 34);
    doc.text(`Net: ${formatCurrency(report.net, user?.currency || "USD")}`, 14, 40);

    autoTable(doc, {
      startY: 48,
      head: [["Date", "Title", "Category", "Type", "Amount"]],
      body: report.transactions.map((item) => [
        item.date.slice(0, 10),
        item.title,
        item.category,
        item.type,
        formatCurrency(item.amount, user?.currency || "USD"),
      ]),
      styles: { fontSize: 9 },
    });

    doc.save(`report-${month}.pdf`);
    toast.success("PDF exported");
  }

  return (
    <PageContainer className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {t("reports_title")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          {t("reports_subtitle")}
        </p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-300">
              {t("month")}
            </label>
            <Input type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
          </div>
          <Button
            onClick={() => {
              void loadReport(month);
            }}
          >
            {t("generate")}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv} disabled={!report}>
            <FileDown className="mr-2 h-4 w-4" />
            {t("export_csv")}
          </Button>
          <Button variant="secondary" onClick={exportPdf} disabled={!report}>
            <FileDown className="mr-2 h-4 w-4" />
            {t("export_pdf")}
          </Button>
        </div>
      </Card>

      {fetching || !report ? (
        <div className="flex min-h-56 items-center justify-center">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2">
            <Card className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-300">{t("income")}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(report.totalIncome, user?.currency || "USD")}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-300">{t("expense")}</p>
              <p className="mt-1 text-sm font-semibold text-rose-600 dark:text-rose-400">
                {formatCurrency(report.totalExpense, user?.currency || "USD")}
              </p>
            </Card>
            <Card className="text-center">
              <p className="text-xs text-slate-500 dark:text-slate-300">{t("net")}</p>
              <p className="mt-1 text-sm font-semibold text-sky-600 dark:text-sky-400">
                {formatCurrency(report.net, user?.currency || "USD")}
              </p>
            </Card>
          </div>

          <Card className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("expense_by_category")}
            </h3>
            {report.expenseByCategory.length ? (
              report.expenseByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{item.category}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.amount, user?.currency || "USD")}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">{t("no_expense_month")}</p>
            )}
          </Card>

          <Card className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t("transactions_label")} ({report.transactions.length})
            </h3>
            <div className="space-y-2">
              {report.transactions.length ? (
                report.transactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 p-2 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {item.category} • {formatDate(item.date)}
                      </p>
                    </div>
                    <p
                      className={`text-sm font-semibold ${
                        item.type === "INCOME"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {item.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(item.amount, user?.currency || "USD")}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t("no_transactions_month")}
                </p>
              )}
            </div>
          </Card>
        </>
      )}
    </PageContainer>
  );
}
