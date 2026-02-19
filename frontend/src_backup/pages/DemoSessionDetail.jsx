
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, Shield, CheckCircle, ShieldAlert, Activity } from 'lucide-react';
import { demoService as DemoService } from '../services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DemoSessionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const res = await DemoService.getDemoDetails(id);
                setData(res);
            } catch (error) {
                console.error("Failed to load demo details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    if (loading) return <div className="p-8 text-gray-400">Loading Forensic Data...</div>;
    if (!data) return <div className="p-8 text-red-400">Session Not Found</div>;

    const { session, timeline, analysis } = data;

    // Prepare chart data
    // We want trust score over time. 
    // timeline has events. We need to reconstruct score if it's not stored per event?
    // checking DemoEvent model... it DOES have "current_trust_score".
    const chartData = timeline.map(e => ({
        time: new Date(e.timestamp).toLocaleTimeString(),
        score: e.details?.current_trust_score || e.current_trust_score || 100
    }));

    return (
        <div className="p-8 bg-gray-900 min-h-screen text-gray-100">
             <button 
                onClick={() => navigate('/sessions')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
             >
                <ArrowLeft className="w-4 h-4" /> Back to Explorer
             </button>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Header Stats */}
                 <div className="lg:col-span-3 bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                     <div>
                         <span className="bg-purple-900/50 text-purple-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-purple-500/30">
                             Demo Session
                         </span>
                         <h1 className="text-2xl font-bold mt-2 font-mono">{session.demo_session_id}</h1>
                         <div className="flex items-center gap-4 text-gray-400 text-sm mt-1">
                             <div className="flex items-center gap-1"><User className="w-3 h-3" /> {session.user_id}</div>
                             <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(session.start_time).toLocaleString()}</div>
                         </div>
                     </div>
                     
                     <div className="flex items-center gap-8">
                         <div className="text-center">
                             <div className="text-sm text-gray-500 uppercase tracking-widest">Final Decision</div>
                             <div className={`text-2xl font-bold ${session.final_decision === 'ALLOW' ? 'text-green-400' : 'text-red-400'}`}>
                                 {session.final_decision}
                             </div>
                         </div>
                         <div className="text-center">
                             <div className="text-sm text-gray-500 uppercase tracking-widest">Trust Score</div>
                             <div className="text-2xl font-bold text-blue-400">
                                 {session.final_trust_score?.toFixed(1) || 100.0}%
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Analysis Panel */}
                 <div className="lg:col-span-1 space-y-6">
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <Shield className="w-5 h-5 text-purple-400" /> Risk Analysis
                         </h3>
                         
                         <div className="space-y-4">
                             <div>
                                 <label className="text-xs text-gray-500 uppercase font-bold">Primary Cause</label>
                                 <div className="text-white bg-gray-900/50 p-2 rounded border border-gray-700 mt-1">
                                     {analysis.primary_cause || "No significant risk"}
                                 </div>
                             </div>
                             <div>
                                 <label className="text-xs text-gray-500 uppercase font-bold">Recommendation</label>
                                 <div className="text-blue-300 font-medium mt-1 flex items-start gap-2">
                                     <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                     {analysis.recommended_action || "None"}
                                 </div>
                             </div>
                             
                             {analysis.risk_reasons && analysis.risk_reasons.length > 0 && (
                                 <div>
                                     <label className="text-xs text-gray-500 uppercase font-bold">Detected Risks</label>
                                     <ul className="mt-2 space-y-1">
                                         {analysis.risk_reasons.map((r, i) => (
                                             <li key={i} className="text-xs bg-red-900/20 text-red-300 px-2 py-1 rounded border border-red-500/20 flex gap-2">
                                                 <ShieldAlert className="w-3 h-3" /> {r}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Chart & Timeline */}
                 <div className="lg:col-span-2 space-y-6">
                     {/* Chart */}
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-lg font-bold mb-4">Trust Score Evolution</h3>
                         <div className="h-64 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                 <LineChart data={chartData}>
                                     <XAxis dataKey="time" stroke="#6b7280" fontSize={10} />
                                     <YAxis domain={[0, 100]} stroke="#6b7280" fontSize={10} />
                                     <Tooltip 
                                         contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                         itemStyle={{ color: '#e5e7eb' }}
                                     />
                                     <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{r: 4}} />
                                 </LineChart>
                             </ResponsiveContainer>
                         </div>
                     </div>

                     {/* Timeline */}
                     <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                         <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <Activity className="w-5 h-5 text-gray-400" /> Event Timeline
                         </h3>
                         <div className="border-l-2 border-gray-700 ml-3 space-y-6 pl-6 relative">
                             {timeline.map((event, idx) => (
                                 <div key={idx} className="relative">
                                     <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-gray-900 border-2 border-purple-500"></div>
                                     <div className="text-xs text-gray-500 font-mono mb-1">{new Date(event.timestamp).toLocaleTimeString()}</div>
                                     <div className="font-bold text-gray-200">{event.event_type}</div>
                                     <div className="text-xs text-gray-400 font-mono mt-1">Score: {event.details?.current_trust_score?.toFixed(1) || event.current_trust_score?.toFixed(1) || '-'}</div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default DemoSessionDetail;
