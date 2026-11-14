import React, { useState } from 'react';
import { SessionFeedback } from '@senseweave/shared';
import { MessageSquarePlus, Check, X } from 'lucide-react';
import { apiClient } from '../../lib/api/client.js';

interface SessionFeedbackModalProps {
  sessionId: string;
  onClose: () => void;
}

export const SessionFeedbackModal: React.FC<SessionFeedbackModalProps> = ({
  sessionId,
  onClose,
}) => {
  const [feedbackType, setFeedbackType] = useState<SessionFeedback['feedbackType']>('useful_cue');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options: Array<{ value: SessionFeedback['feedbackType']; label: string; desc: string }> = [
    { value: 'useful_cue', label: 'Helpful Cue', desc: 'The event announcement was timely and clear.' },
    { value: 'missed_event', label: 'Missed Event', desc: 'A relevant conversational or visual event was missed.' },
    { value: 'incorrect_event', label: 'Inaccurate Observation', desc: 'The description did not match physical reality.' },
    { value: 'too_many_alerts', label: 'Too Many Alerts', desc: 'Feedback frequency was distracting or repetitive.' },
    { value: 'insufficient_detail', label: 'Insufficient Detail', desc: 'Needed more contextual clarity.' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.sendFeedback(sessionId, { feedbackType, notes });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {
      // Catch
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close feedback modal"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-800">
              <Check className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-white">Thank You</h2>
            <p className="text-sm text-slate-400">
              Your feedback is anonymous and helps calibrate accessibility thresholds.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sense-500/20 text-sense-400 flex items-center justify-center">
                <MessageSquarePlus className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="feedback-dialog-title" className="text-lg font-bold text-white">
                  Observation Feedback
                </h2>
                <p className="text-xs text-slate-400">
                  Rate how the Live Context Weave Engine interpreted this session.
                </p>
              </div>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-xs font-semibold text-slate-300 mb-1">
                Select feedback category:
              </legend>
              {options.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start p-3 rounded-xl border cursor-pointer transition-all ${
                    feedbackType === opt.value
                      ? 'border-sense-400 bg-sense-950/40'
                      : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="feedbackType"
                    value={opt.value}
                    checked={feedbackType === opt.value}
                    onChange={() => setFeedbackType(opt.value)}
                    className="mt-1 text-sense-500 focus:ring-sense-400"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-semibold text-white">{opt.label}</span>
                    <span className="block text-xs text-slate-400">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </fieldset>

            <div>
              <label htmlFor="notes" className="block text-xs font-semibold text-slate-300 mb-1">
                Optional comments (do not include private personal data):
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:ring-2 focus:ring-sense-400 focus:border-transparent resize-none"
                placeholder="E.g. Hand raising was detected with good timing..."
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-sense-600 hover:bg-sense-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
