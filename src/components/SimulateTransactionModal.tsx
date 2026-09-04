import React, { useState } from 'react';
import { Sparkles, X, Play, Copy, Check } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface SimulateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (smsText: string) => void;
}

const SAMPLE_PRESETS = [
  {
    name: 'HDFC Card • Swiggy (₹480)',
    sms: 'HDFC Bank: Rs 480.00 spent on your Card ending 9012 at SWIGGY on 03-SEP-26. Avl limit: Rs 1,45,200.',
    category: 'Food',
  },
  {
    name: 'SBI UPI • Uber Ride (₹320)',
    sms: 'Dear SBI User, your A/c ending 4321 is debited by Rs.320.00 on 03Sep26 transfer to Uber India via UPI Ref 4291048201.',
    category: 'Transport',
  },
  {
    name: 'Salary Credited (₹85,000)',
    sms: 'Your A/C ending 5678 has been credited with INR 85,000.00 on 03-Sep-26 by Salary / Infosys Payroll. Total Bal: INR 1,20,500.',
    category: 'Salary',
  },
  {
    name: 'Zerodha • SIP Investment (₹5,000)',
    sms: 'ICICI Bank: Rs 5,000.00 debited from A/C XX7890 towards Zerodha Mutual Fund SIP on 03-Sep-26.',
    category: 'Investment',
  },
  {
    name: 'Blinkit Grocery (₹1,150)',
    sms: 'Paid Rs 1,150.00 to Blinkit Commerce via Paytm UPI on 03-Sep-2026. Txn ID: PT4910284.',
    category: 'Food',
  },
];

export const SimulateTransactionModal: React.FC<SimulateTransactionModalProps> = ({
  isOpen,
  onClose,
  onSimulate,
}) => {
  const { isDarkMode } = useTheme();
  const [customText, setCustomText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTestPreset = (sms: string) => {
    onSimulate(sms);
    onClose();
  };

  const handleCopy = async (sms: string, index: number) => {
    try {
      await navigator.clipboard.writeText(sms);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl transition-all ${
          isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Test Automatic Ingestion</h3>
              <p className="text-xs opacity-60">Simulate incoming bank SMS & auto-detection popup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto pr-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Select a Bank Sample
            </p>
            <div className="space-y-2">
              {SAMPLE_PRESETS.map((preset, index) => (
                <div
                  key={preset.name}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDarkMode
                      ? 'bg-neutral-950 border-neutral-800 hover:border-neutral-700'
                      : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-sm">{preset.name}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopy(preset.sms, index)}
                        className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 transition-colors ${
                          isDarkMode
                            ? 'border-neutral-800 hover:bg-neutral-800 text-neutral-300'
                            : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                        title="Copy to Clipboard to test auto-clipboard detection"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check size={12} className="text-lime-400" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy SMS
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleTestPreset(preset.sms)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-lime-500 hover:bg-lime-400 text-black font-semibold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Play size={12} /> Test Now
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono opacity-60 line-clamp-2">{preset.sms}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Or Paste Custom Notification
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste any bank SMS text here..."
                className={`flex-1 p-3 rounded-xl text-sm border outline-none font-mono ${
                  isDarkMode
                    ? 'bg-neutral-950 border-neutral-800 text-white focus:border-lime-500/50'
                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-lime-500'
                }`}
              />
              <button
                disabled={!customText.trim()}
                onClick={() => handleTestPreset(customText)}
                className="px-4 py-3 bg-lime-500 hover:bg-lime-400 disabled:opacity-40 text-black font-semibold rounded-xl text-sm transition-all"
              >
                Trigger
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
