import React, { useState } from 'react';
import { useSocPolling } from '../../hooks/useSocPolling';
import { useSearchParams } from 'react-router-dom';
import { enforcementApi } from '../../api/enforcement.api';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { UserRole } from '../../types/auth';
import { StatusBadge } from '../../components/badges/StatusBadge';
import { SeverityBadge } from '../../components/badges/SeverityBadge';
import { useAuth } from '../../auth/AuthContext';
import { JustificationModal } from '../../components/modals/JustificationModal';
import { RenderDiffs } from '../../components/RenderDiffs';
import { MotionCard } from '../../motion/MotionCard';
import { DangerButton } from '../../components/DangerButton';

export const Proposals: React.FC = () => {
  const { proposals, refreshState } = useSocPolling();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const selectedPid = searchParams.get('pid');
  const selectedProposal = proposals.find(p => p.pid === selectedPid);

  const [justifyingAction, setJustifyingAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;
  const isAnalyst = user?.role === UserRole.ANALYST || isAdmin;

  const handleSelect = (pid: string) => {
    setSearchParams({ pid });
  };

  const executeDecision = async (justification: string) => {
    if (!selectedProposal || !justifyingAction) return;

    setIsProcessing(true);
    try {
      if (justifyingAction === 'APPROVE') {
        await enforcementApi.approve(selectedProposal.pid, justification);
      } else {
        await enforcementApi.reject(selectedProposal.pid, justification);
      }
      await refreshState();
      setJustifyingAction(null);
    } catch (err) {
      console.error("Decision failed", err);
      alert("Failed to execute decision. Check console.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* List Column */}
      <div className="md:col-span-1 overflow-y-auto pr-2 space-y-3">
        <h2 className="font-bold text-lg mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-primary" />
            Enforcement Queue
        </h2>
        {proposals.map(prop => (
          <motion.div
            key={prop.pid}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => handleSelect(prop.pid)}
            className={`cursor-pointer p-4 rounded-lg border transition-all ${
              selectedPid === prop.pid 
                ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20' 
                : 'bg-card border-border hover:bg-muted/50'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
                <span className={`font-mono text-xs ${selectedPid === prop.pid ? 'text-primary' : 'text-muted-foreground'}`}>
                    {prop.pid.substring(0, 8)}...
                </span>
                <StatusBadge status={prop.status} className="text-[10px] px-2 py-0.5" />
            </div>
            <div className="font-semibold text-sm mb-1">{prop.action}</div>
            <div className="text-xs text-muted-foreground truncate mb-2">Target: {prop.scope}</div>
            <SeverityBadge severity={prop.threat_assessment.severity} className="text-[10px] px-2 py-0.5" />
          </motion.div>
        ))}
        {proposals.length === 0 && (
            <div className="text-center p-8 text-muted-foreground border border-dashed border-border rounded-lg">
                No active proposals.
            </div>
        )}
      </div>

      {/* Detail Column */}
      <div className="md:col-span-2 h-full">
        <AnimatePresence mode="wait">
        {selectedProposal ? (
          <MotionCard key={selectedProposal.pid} className="h-full flex flex-col relative overflow-hidden" delay={0}>
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border pb-6 mb-6">
                  <div>
                      <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold">{selectedProposal.action}</h2>
                          <StatusBadge status={selectedProposal.status} />
                      </div>
                      <div className="font-mono text-sm text-muted-foreground mt-2 flex items-center gap-4">
                          <span>ID: {selectedProposal.pid}</span>
                          <span>SCOPE: {selectedProposal.scope}</span>
                      </div>
                  </div>
                  <SeverityBadge severity={selectedProposal.threat_assessment.severity} className="text-lg px-4 py-1" />
              </div>

              {/* Content Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                  {/* Context Block */}
                  <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Context & Reasoning</h3>
                      <p className="text-foreground leading-relaxed">
                          {selectedProposal.threat_assessment.reasoning}
                      </p>
                      
                      <div className="mt-4 flex gap-4 text-sm">
                          <div className="bg-background px-3 py-1.5 rounded border border-border">
                              <span className="text-muted-foreground mr-2">Confidence:</span>
                              <span className="font-mono font-bold">
                                  {(selectedProposal.threat_assessment.confidence_score * 100).toFixed(0)}%
                              </span>
                          </div>
                          <div className="bg-background px-3 py-1.5 rounded border border-border">
                              <span className="text-muted-foreground mr-2">Policy:</span>
                              <span className="font-mono">{selectedProposal.policy_id}</span>
                          </div>
                      </div>
                  </div>

                  {/* Diff View */}
                  <div className="space-y-2">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configuration Impact</h3>
                      <RenderDiffs diffs={selectedProposal.diffs} />
                  </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-border pt-6 mt-6">
                  {selectedProposal.status === 'PENDING' ? (
                      <div className="flex items-center justify-between bg-card">
                          <div className="text-sm text-muted-foreground">
                              {isAdmin ? (
                                  <span className="flex items-center text-amber-500">
                                      <AlertTriangle className="w-4 h-4 mr-2" />
                                      Admin Authority Required
                                  </span>
                              ) : (
                                  "Awaiting Admin Review"
                              )}
                          </div>
                          
                          <div className="flex gap-4">
                              <button
                                  onClick={() => setJustifyingAction('REJECT')}
                                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted rounded-md transition-colors"
                                  disabled={!isAnalyst}
                              >
                                  Reject Proposal
                              </button>
                              
                              <DangerButton
                                  actionName="Approve Enforcement"
                                  blastRadius={`This will enforce ${selectedProposal.action} on ${selectedProposal.scope} immediately.`}
                                  onConfirm={() => setJustifyingAction('APPROVE')}
                                  disabled={!isAdmin}
                                  className="min-w-[160px]"
                              />
                          </div>
                      </div>
                  ) : (
                      <div className="flex items-center justify-center p-4 bg-muted/20 rounded-lg border border-border/50">
                          {selectedProposal.status === 'APPROVED' && <CheckCircle className="w-5 h-5 text-green-500 mr-2" />}
                          {selectedProposal.status === 'REJECTED' && <XCircle className="w-5 h-5 text-red-500 mr-2" />}
                          <span className="font-medium">
                              Proposal {selectedProposal.status} by Operator
                          </span>
                      </div>
                  )}
              </div>
          </MotionCard>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/5">
              <Shield className="w-12 h-12 mb-4 opacity-20" />
              <p>Select a proposal to review enforcement details</p>
          </div>
        )}
        </AnimatePresence>
      </div>

      {justifyingAction && (
        <JustificationModal
            action={justifyingAction}
            isOpen={true}
            onClose={() => setJustifyingAction(null)}
            onConfirm={executeDecision}
            isProcessing={isProcessing}
        />
      )}
    </div>
  );
};


export default Proposals;
