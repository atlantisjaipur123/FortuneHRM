'use client';

import { useState } from 'react';
import { GlobalLayout } from '@/app/components/global-layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PayrollCyclePage() {
  const [cycleType, setCycleType] = useState<'payroll' | 'attendance' | ''>('');
  const [cycle, setCycle] = useState({ start: '', end: '' });
  const [savedCycles, setSavedCycles] = useState<{ id: number; type: string; start: string; end: string }[]>([]);

  const handleCycleTypeChange = (type: 'payroll' | 'attendance') => {
    setCycleType(type);
    setCycle({ start: '', end: '' });
  };

  const handleCycleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCycle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cycleType && cycle.start && cycle.end) {
      const typeLabel = cycleType === 'payroll' ? 'Payroll' : 'Attendance';
      setSavedCycles((prev) => [
        ...prev,
        { id: prev.length + 1, type: typeLabel, start: cycle.start, end: cycle.end },
      ]);
      setCycle({ start: '', end: '' });
      setCycleType('');
    }
  };

  return (
    <GlobalLayout>
      <div className="flex-1 p-6 bg-gray-50">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md border border-green-100">
          <h1 className="text-xl font-bold text-green-800 mb-4 text-center">Payroll Cycle Settings</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="text-md font-semibold text-gray-700 mb-2">Select Cycle Type</h2>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="cycleType"
                    value="payroll"
                    checked={cycleType === 'payroll'}
                    onChange={() => handleCycleTypeChange('payroll')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">Payroll Cycle</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="cycleType"
                    value="attendance"
                    checked={cycleType === 'attendance'}
                    onChange={() => handleCycleTypeChange('attendance')}
                    className="text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">Attendance Cycle</span>
                </label>
              </div>
            </div>

            {cycleType && (
              <div>
                <h2 className="text-md font-semibold text-gray-700 mb-2">
                  {cycleType === 'payroll' ? 'Payroll' : 'Attendance'} Cycle
                </h2>
                <div className="flex items-center space-x-4">
                  <label className="block flex-1">
                    <span className="text-gray-600 text-sm">From</span>
                    <input
                      type="number"
                      name="start"
                      value={cycle.start}
                      onChange={handleCycleChange}
                      placeholder="e.g., 1"
                      min="1"
                      max="31"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                  </label>
                  <span className="text-gray-600">to</span>
                  <label className="block flex-1">
                    <span className="text-gray-600 text-sm">To</span>
                    <input
                      type="number"
                      name="end"
                      value={cycle.end}
                      onChange={handleCycleChange}
                      placeholder="e.g., 15"
                      min="1"
                      max="31"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                    />
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!cycleType || !cycle.start || !cycle.end}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save Cycle
            </button>
          </form>
        </div>

        <div className="mt-6 max-w-3xl mx-auto">
          <h2 className="text-lg font-bold text-green-800 mb-4">Saved Cycles</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-green-700">Cycle Type</TableHead>
                <TableHead className="text-green-700">Start Date</TableHead>
                <TableHead className="text-green-700">End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {savedCycles.length > 0 ? (
                savedCycles.map((cycle) => (
                  <TableRow key={cycle.id}>
                    <TableCell>{cycle.type}</TableCell>
                    <TableCell>{cycle.start}</TableCell>
                    <TableCell>{cycle.end}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-500">
                    No cycles saved yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </GlobalLayout>
  );
}