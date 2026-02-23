
import React, { useState, useRef } from 'react';
import { Shield, Lock, User, Square, Play, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';
import { demoService as DemoService } from '../services/api';

const LiveLoginDemo = () => {
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: Login Form, 2: CAPTCHA, 3: Result
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [demoId, setDemoId] = useState(null);
  const [logs, setLogs] = useState([]); // Local log for visual feedback
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [targetCaptcha, setTargetCaptcha] = useState('');
  
  // Timer for behavior tracking (simulated)
  const startTimeRef = useRef(null);

  const generateCaptcha = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let result = "";
      for (let i = 0; i < 5; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
  };

  const addLog = (msg) => {
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg }]);
  };

  const startDemo = async () => {
      setLoading(true);
      setLogs([]);
      setActiveStep(1);
      setResult(null);
      setEmail('');
      setPassword('');
      setCaptchaInput('');
      setTargetCaptcha(generateCaptcha());
      
      try {
          const res = await DemoService.startDemo();
          setDemoId(res.demo_session_id);
          addLog(`Session Started: ${res.demo_session_id}`);
          startTimeRef.current = Date.now();
      } catch (e) {
          addLog("Error starting session");
      } finally {
          setLoading(false);
      }
  };

  const handleLoginAttempt = async (e) => {
      e.preventDefault();
      if (!demoId) return;

      // Frontend Validation
      if (!email || !password) {
          addLog("Incomplete details: Please enter both email and password.");
          return;
      }
      
      setLoading(true);
      addLog(`Submitting credentials: ${email}`);
      
      // Simulate typing speed / behavior
      const timeTaken = Date.now() - startTimeRef.current;
      
      try {
          // Send Credentials for Verification
          const res = await DemoService.recordEvent(demoId, "LOGIN_ATTEMPT", {
              typing_duration: timeTaken,
              password_length: password.length,
              email: email, 
              password: password
          });
          
          if (res.decision === 'RESTRICT' && !res.requires_captcha) {
               addLog("Authentication Failed: Invalid Credentials.");
               finishDemo(false, "Restricted: Access Denied. Check credentials.");
          } else if (res.requires_captcha) {
               addLog("MFA Required: Triggering Behavioral CAPTCHA...");
               setActiveStep(2); // Move to CAPTCHA
          } else {
               addLog("Authentication Successful.");
               finishDemo(true);
          }
          
      } catch (e) {
          console.error("Login Attempt Error", e);
          if (e.response && e.response.data && e.response.data.message === "Demo session is closed") {
              // Session already finished (race condition), show success/result
              addLog("Session appears completed. Showing results.");
              finishDemo(true); 
          } else {
            addLog("Error submitting login");
          }
      } finally {
          setLoading(false);
      }
  };

  const handleCaptchaSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      addLog("Verifying...");
      
      try {
          // Case-sensitive check
          const isCorrect = captchaInput === targetCaptcha; 
          const eventType = isCorrect ? "CAPTCHA_SUCCESS" : "CAPTCHA_FAIL";
          
          if (!isCorrect) addLog("Verification Failed: Incorrect code.");
          else addLog("Verification Successful.");
          
          await DemoService.recordEvent(demoId, eventType, {});
          
          if (isCorrect) {
              finishDemo(true);
          } else {
              setTargetCaptcha(generateCaptcha());
              setCaptchaInput('');
          }

      } catch (e) {
         console.error("CAPTCHA Error", e);
         if (e.response && e.response.data && e.response.data.message === "Demo session is closed") {
              addLog("Session closed externally. Finalizing.");
              finishDemo(true);
          } else {
              addLog("Error submitting CAPTCHA");
          }
      } finally {
          setLoading(false);
      }
  };

  const finishDemo = async (allowed, reasonOverride=null) => {
      setLoading(true);
      try {
          const finalRes = await DemoService.endDemo(demoId);
          setResult({
              decision: finalRes.final_decision,
              message: reasonOverride || finalRes.message
          });
          setActiveStep(3);
          addLog(`Session Finalized. Decision: ${allowed ? "ALLOW" : "RESTRICT"}`);
      } catch (e) {
          // If already ended, just show local result state if possible
          if (e.response && e.response.data && e.response.data.message === "Session not found") {
               // Already closed/gone
               setResult({
                   decision: allowed ? "ALLOW" : "RESTRICT",
                   message: "Session ended."
               });
               setActiveStep(3);
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-gray-100 flex flex-col items-center">
        <div className="max-w-4xl w-full">
            <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-purple-500" /> Live Login Behavior Demo
            </h1>
            <p className="text-gray-400 mb-8">
                Experience real-time behavioral monitoring. Perform a mock login to see how the engine reacts.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                
                {/* Live Login Redirect */}
                <div className="bg-gray-800 p-8 rounded-xl border border-gray-700 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-purple-500/50"></div>
                    
                    <div className="p-4 bg-gray-700/50 rounded-full mb-6">
                        <Lock className="w-12 h-12 text-purple-400" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Simulated Production Target</h2>
                    <p className="text-gray-400 mb-8 max-w-sm">
                        Launch the external target application. Actions performed there will be streamed directly into the Trust Engine via Kafka for live SOC monitoring.
                    </p>
                    
                    <a 
                        href="http://localhost:3001" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20"
                    >
                        <Play className="w-5 h-5" /> Launch Target Application
                    </a>
                    <p className="text-xs text-gray-500 mt-4">Opens in a new tab (localhost:3001)</p>
                </div>

                {/* Live Backend Monitor */}
                <div className="bg-black/40 p-6 rounded-xl border border-gray-800 font-mono text-sm h-full flex flex-col">
                    <h3 className="text-gray-500 font-bold mb-4 uppercase tracking-widest text-xs flex items-center justify-between">
                        <span>Engine Event Stream</span>
                        <div className="flex gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-green-500">LIVE</span>
                        </div>
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar font-mono text-xs">
                        {logs.map((log, i) => (
                            <div key={i} className="flex gap-3 text-gray-300">
                                <span className="text-gray-600 shrink-0">[{log.time}]</span>
                                <span>{log.msg}</span>
                            </div>
                        ))}
                        {logs.length === 0 && (
                            <div className="text-gray-700 italic">Waiting for session initialization...</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LiveLoginDemo;
