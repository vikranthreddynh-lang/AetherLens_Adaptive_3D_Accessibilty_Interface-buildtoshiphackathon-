import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Compass,
  Globe,
} from 'lucide-react';
import {
  EvidenceState,
  LanguageCode,
} from '../types/accessibility';
import {
  DEMO_NOTICE,
  BARRIERS,
  EVIDENCE_STATES,
  PATHWAY_RESULTS,
  UI_STRINGS,
} from '../data/demoScenario';

interface WhatIfDemoProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  simplifyActive: boolean;
  onVoiceTrigger?: () => void;
  onSimplifyTrigger?: () => void;
}

export const WhatIfDemo: React.FC<WhatIfDemoProps> = ({
  language,
  onLanguageChange,
  simplifyActive,
}) => {
  const strings = UI_STRINGS[language] || UI_STRINGS.en;

  // Local demo state
  const [selectedBarrier, setSelectedBarrier] = useState<string>('cant-visit-office');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceState>('source-supported');
  const [clarificationQuestion, setClarificationQuestion] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'fallback'>('idle');
  const questionInputRef = useRef<HTMLTextAreaElement>(null);

  // Look up current pathway result
  const currentBarrierResults = PATHWAY_RESULTS[selectedBarrier] || PATHWAY_RESULTS['cant-visit-office'];
  const currentResult = currentBarrierResults[selectedEvidence] || currentBarrierResults['source-supported'];

  // Sync clarification question when barrier or evidence changes
  useEffect(() => {
    setClarificationQuestion(currentResult.defaultQuestion);
    setCopyStatus('idle');
  }, [selectedBarrier, selectedEvidence, currentResult.defaultQuestion]);

  // Copy to clipboard handler with accessible feedback & fallback
  const handleCopyQuestion = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(clarificationQuestion);
        setCopyStatus('success');
        setTimeout(() => setCopyStatus('idle'), 3500);
      } else {
        // Fallback for non-secure context or blocked permissions
        if (questionInputRef.current) {
          questionInputRef.current.select();
          document.execCommand('copy');
          setCopyStatus('success');
          setTimeout(() => setCopyStatus('idle'), 3500);
        } else {
          setCopyStatus('fallback');
        }
      }
    } catch (err) {
      console.warn('Clipboard write failure, activating fallback selection:', err);
      if (questionInputRef.current) {
        questionInputRef.current.select();
      }
      setCopyStatus('fallback');
    }
  };

  const handleResetQuestion = () => {
    setClarificationQuestion(currentResult.defaultQuestion);
  };

  /**
   * INTEGRATION SLOT: Future AI Pathway Engine Connection
   * When integrating real AI:
   * const handleEvaluateBarrier = async (barrierText: string, documentText: string) => {
   *    // POST to /api/pathways/evaluate with documentText & barrierText
   *    // Response: { evidenceState, quote, action, generatedClarification }
   * }
   */

  return (
    <div className="space-y-6 pb-4">
      {/* Demo Content Disclaimer Banner */}
      <aside
        aria-label="Demo Disclaimer"
        className="p-3.5 rounded-xl border border-aether-line/80 bg-aether-bg shadow-sm flex items-start gap-3"
      >
        <AlertCircle className="w-4 h-4 text-aether-deep flex-shrink-0 mt-0.5" />
        <div className="text-xs text-aether-deep leading-relaxed">
          <strong className="font-semibold block mb-0.5 text-aether-deep">
            {strings.fictionalNoticeBadge}
          </strong>
          {strings.disclaimerBanner}
        </div>
      </aside>

      {/* Language Choice Panel */}
      <div className="flex items-center justify-between p-3 rounded-xl border border-aether-line/70 bg-aether-bg">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-aether-glow" />
          <span className="text-xs font-bold text-aether-deep">Interface & Notice Language:</span>
        </div>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
            aria-label="Change demo language"
            className="pl-3 pr-7 py-1 rounded-lg border border-aether-line text-xs font-semibold bg-aether-bg text-aether-deep focus:outline-none focus:ring-2 focus:ring-aether-deep cursor-pointer"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </div>
      </div>

      {/* 0. Source Document Review Section */}
      <section
        aria-labelledby="source-document-heading"
        className="p-4 rounded-2xl border border-aether-line/80 bg-aether-bg"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-aether-glow" />
            <h3 id="source-document-heading" className="text-xs font-bold uppercase tracking-wider text-aether-deep">
              {strings.sourceDocument}: {DEMO_NOTICE.institution}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-aether-deep/70 px-2 py-0.5 rounded bg-aether-soft/30 border border-aether-line/40">
            {simplifyActive ? 'Plain Language View' : 'Original Text'}
          </span>
        </div>

        <p className="text-xs font-semibold text-aether-deep mb-2">
          {DEMO_NOTICE.documentTitle} ({DEMO_NOTICE.date})
        </p>

        <div className="p-3 rounded-xl border border-aether-line/50 bg-aether-soft/15 text-xs text-aether-deep leading-relaxed">
          {simplifyActive ? DEMO_NOTICE.simplifiedText : DEMO_NOTICE.rawText}
        </div>
      </section>

      {/* 1. Barrier Selection */}
      <section aria-labelledby="barrier-selection-heading">
        <h3 id="barrier-selection-heading" className="text-xs font-bold uppercase tracking-wider text-aether-deep mb-2.5">
          {strings.selectBarrier}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {BARRIERS.map((barrier) => {
            const isSelected = selectedBarrier === barrier.id;
            return (
              <button
                key={barrier.id}
                type="button"
                onClick={() => setSelectedBarrier(barrier.id)}
                aria-pressed={isSelected}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-aether-deep ${
                  isSelected
                    ? 'bg-aether-bg border-aether-deep ring-2 ring-aether-deep shadow-aether-subtle'
                    : 'bg-aether-bg hover:bg-aether-soft/20 border-aether-line/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-aether-deep">
                    {barrier.label}
                  </span>
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-aether-deep bg-aether-deep' : 'border-aether-line bg-transparent'
                    }`}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-aether-bg" />}
                  </span>
                </div>
                <p className="text-[11px] text-aether-deep/75 leading-tight">
                  {barrier.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Simulated Evidence State Selector */}
      <section aria-labelledby="evidence-state-heading">
        <div className="flex items-center justify-between mb-2">
          <h3 id="evidence-state-heading" className="text-xs font-bold uppercase tracking-wider text-aether-deep">
            {strings.selectEvidence}
          </h3>
          <span className="text-[10px] text-aether-deep/70">
            Simulate source evidence variations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {EVIDENCE_STATES.map((option) => {
            const isSelected = selectedEvidence === option.state;
            return (
              <button
                key={option.state}
                type="button"
                onClick={() => setSelectedEvidence(option.state)}
                aria-pressed={isSelected}
                className={`p-2.5 rounded-xl border text-left transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
                  isSelected
                    ? 'bg-aether-deep text-aether-bg border-aether-deep shadow-sm'
                    : 'bg-aether-bg text-aether-deep border-aether-line hover:border-aether-deep'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {option.state === 'source-supported' && (
                    <ShieldCheck className={`w-3.5 h-3.5 ${isSelected ? 'text-aether-glow' : 'text-aether-deep'}`} />
                  )}
                  {option.state === 'information-not-specified' && (
                    <HelpCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-aether-glow' : 'text-aether-deep'}`} />
                  )}
                  {option.state === 'source-ambiguous' && (
                    <AlertCircle className={`w-3.5 h-3.5 ${isSelected ? 'text-aether-glow' : 'text-aether-deep'}`} />
                  )}
                  <span className="text-xs font-bold leading-tight">
                    {option.title}
                  </span>
                </div>
                <p className={`text-[10px] leading-snug ${isSelected ? 'text-aether-bg/80' : 'text-aether-deep/70'}`}>
                  {option.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Sample Pathway Result Panel */}
      <section
        aria-labelledby="pathway-result-heading"
        className="p-4 rounded-2xl border-2 border-aether-line bg-aether-bg shadow-aether-subtle"
      >
        <div className="flex items-center justify-between mb-3 border-b border-aether-line/40 pb-2.5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-aether-glow" />
            <h3 id="pathway-result-heading" className="text-xs font-bold uppercase tracking-wider text-aether-deep">
              {strings.pathwayAnalysis}
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-aether-soft/30 text-aether-deep border border-aether-line">
            {currentResult.statusLabel}
          </span>
        </div>

        <h4 className="text-sm font-bold text-aether-deep mb-2">
          {currentResult.headline}
        </h4>

        <p className="text-xs text-aether-deep leading-relaxed mb-3">
          {currentResult.body}
        </p>

        {/* Source citation quote */}
        <div className="p-2.5 rounded-lg bg-aether-soft/20 border-l-4 border-aether-deep text-[11px] text-aether-deep italic mb-3">
          <span className="font-semibold not-italic text-aether-deep block text-[10px] uppercase tracking-wider mb-0.5">
            Document Evidence Reference:
          </span>
          {currentResult.sourceQuote}
        </div>

        {/* Suggested Next Action */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-aether-bg border border-aether-line/60 text-xs text-aether-deep">
          <ChevronRight className="w-4 h-4 text-aether-glow flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold text-aether-deep">Recommended Action: </strong>
            <span>{currentResult.suggestedAction}</span>
          </div>
        </div>
      </section>

      {/* 4. Editable Clarification Question with Clipboard Copy */}
      <section aria-labelledby="clarification-heading">
        <div className="flex items-center justify-between mb-2">
          <h3 id="clarification-heading" className="text-xs font-bold uppercase tracking-wider text-aether-deep">
            {strings.clarificationQuestion}
          </h3>
          <button
            type="button"
            onClick={handleResetQuestion}
            aria-label="Reset question to default wording"
            className="inline-flex items-center gap-1 text-[11px] text-aether-deep hover:text-aether-glow underline-offset-2 hover:underline focus:outline-none focus:ring-1 focus:ring-aether-deep"
          >
            <RotateCcw className="w-3 h-3 text-aether-deep" />
            <span>Reset wording</span>
          </button>
        </div>

        <p className="text-xs text-aether-deep/75 mb-2">
          Tailored clarification you can review, personalize, and forward to student services or the administrator:
        </p>

        <div className="relative">
          <label htmlFor="clarification-textarea" className="sr-only">
            Sample clarification question message
          </label>
          <textarea
            id="clarification-textarea"
            ref={questionInputRef}
            rows={4}
            value={clarificationQuestion}
            onChange={(e) => setClarificationQuestion(e.target.value)}
            className="w-full p-3 rounded-xl border border-aether-line bg-aether-bg text-xs text-aether-deep focus:border-aether-deep focus:ring-2 focus:ring-aether-deep focus:outline-none resize-y leading-relaxed font-sans"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] text-aether-deep/70">
            {clarificationQuestion.length} characters • Ready to export
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyQuestion}
              aria-label={strings.copyQuestion}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-aether-deep ${
                copyStatus === 'success'
                  ? 'bg-aether-deep text-aether-bg border border-aether-deep'
                  : 'bg-aether-deep text-aether-bg hover:bg-aether-deep/90 border border-aether-deep shadow-sm'
              }`}
            >
              {copyStatus === 'success' ? (
                <>
                  <Check className="w-4 h-4 text-aether-glow" />
                  <span>{strings.copiedSuccess}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-aether-bg" />
                  <span>{strings.copyQuestion}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Screen-reader announcement for clipboard action */}
        <div
          role="status"
          aria-live="polite"
          className="sr-only"
        >
          {copyStatus === 'success' && 'Clarification question text successfully copied to your system clipboard.'}
          {copyStatus === 'fallback' && strings.copyFallbackPrompt}
        </div>

        {copyStatus === 'fallback' && (
          <div
            role="alert"
            className="mt-2 text-xs text-aether-deep bg-aether-soft/30 p-2 rounded border border-aether-line"
          >
            {strings.copyFallbackPrompt}
          </div>
        )}
      </section>
    </div>
  );
};
