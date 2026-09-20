'use client';

import React, { useState } from 'react';
import { User, ExpenseCategory, Expense } from '@/lib/types';
import { Wallet, Camera, CheckCircle, Send, DollarSign, Store } from 'lucide-react';

interface ExpenseLogFormProps {
  supervisors: User[];
  recentExpenses: Expense[];
  onSubmit: (data: {
    supervisor_id: string;
    category: ExpenseCategory;
    amount: number;
    vendor: string;
    bill_url?: string;
    notes?: string;
  }) => Promise<void>;
}

export const ExpenseLogForm: React.FC<ExpenseLogFormProps> = ({
  supervisors,
  recentExpenses,
  onSubmit
}) => {
  const defaultSupervisor = supervisors.find(s => s.role === 'supervisor') || supervisors[0];
  const [supervisorId, setSupervisorId] = useState(defaultSupervisor?.id || '');
  const [category, setCategory] = useState<ExpenseCategory>('equipment_repair');
  const [amount, setAmount] = useState<string>('1250.00');
  const [vendor, setVendor] = useState<string>('City Hardware & Tool Supplies');
  const [notes, setNotes] = useState<string>('Purchase of 50m heavy duty extension cord');
  const [billUrl, setBillUrl] = useState<string | null>(
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor || !amount) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        supervisor_id: supervisorId,
        category,
        amount: parseFloat(amount) || 0,
        vendor,
        bill_url: billUrl || undefined,
        notes: notes || undefined
      });

      setSuccessMessage('Site expense logged successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setAmount('');
      setNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 leading-tight">Log Site Petty Cash</h2>
              <p className="text-xs text-slate-500">Record site purchases & vouchers</p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-pulse">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Supervisor</label>
            <select
              value={supervisorId}
              onChange={(e) => setSupervisorId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
            >
              {supervisors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Vendor / Payee</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
            >
              <option value="equipment_repair">Equipment Repair</option>
              <option value="fuel_oil">Fuel / Oil</option>
              <option value="refreshments">Refreshments</option>
              <option value="tools_spares">Tools & Spares</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Submit Site Expense</span>
          </button>
        </form>
      </div>
    </div>
  );
};
