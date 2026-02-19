import { IncidentState, EnforcementState } from '../types/soc';

export const canTransitionIncident = (currentState: IncidentState, nextState: IncidentState): boolean => {
    // strict backend-aligned transitions
    const updates: Record<IncidentState, IncidentState[]> = {
        [IncidentState.OPEN]: [IncidentState.CONTAINED, IncidentState.CLOSED], // Closed if false positive
        [IncidentState.CONTAINED]: [IncidentState.RECOVERED],
        [IncidentState.RECOVERED]: [IncidentState.CLOSED],
        [IncidentState.CLOSED]: [], // Terminal
    };
    return updates[currentState]?.includes(nextState) || false;
};

export const canApproveProposal = (status: EnforcementState): boolean => {
    return status === EnforcementState.PENDING;
};
