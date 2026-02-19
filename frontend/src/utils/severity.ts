import { Severity } from '../types/soc';

export const getSeverityScore = (severity: Severity): number => {
    switch (severity) {
        case Severity.CRITICAL: return 4;
        case Severity.HIGH: return 3;
        case Severity.MEDIUM: return 2;
        case Severity.LOW: return 1;
        default: return 0;
    }
};

export const sortBySeverity = <T extends { severity: Severity }>(items: T[], direction: 'ASC' | 'DESC' = 'DESC'): T[] => {
    return [...items].sort((a, b) => {
        const scoreA = getSeverityScore(a.severity);
        const scoreB = getSeverityScore(b.severity);
        return direction === 'DESC' ? scoreB - scoreA : scoreA - scoreB;
    });
};
