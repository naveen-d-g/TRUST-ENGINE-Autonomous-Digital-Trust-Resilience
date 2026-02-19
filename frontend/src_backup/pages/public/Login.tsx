
import React, { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Lock, ChevronRight, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { MotionCard } from '../../motion/MotionCard';

export const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnecting, setIsConnecting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async () => {
    setIsConnecting(true);
    try {
        // Simulate connection delay for effect
        await new Promise(resolve => setTimeout(resolve, 1200));
        await login();
    } catch (err) {
        console.error("Login sequence failed:", err);
    } finally {
        setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse" />
          <div className="absolute top-0 left-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-20" />
          <div className="absolute top-0 right-[20%] w-[1px] h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-20" />
      </div>

      <MotionCard className="relative z-10 w-full max-w-md bg-card/50 backdrop-blur-sm border-primary/20 shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground">
                <Terminal className="w-4 h-4 text-primary" />
                <span>SECURE_ACCESS_TERMINAL_V2</span>
            </div>
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
            </div>
        </div>

        <div className="p-8 space-y-8">
            <div className="text-center space-y-2">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex p-4 rounded-full bg-primary/10 text-primary mb-2"
                >
                    <ShieldCheck className="w-12 h-12" />
                </motion.div>
                <h1 className="text-2xl font-bold tracking-tight">SOC Identity Verification</h1>
                <p className="text-sm text-muted-foreground font-mono">
                    ENTER CREDENTIALS TO ESTABLISH SESSION
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-mono text-muted-foreground uppercase">Access Cipher</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input 
                            type="password"
                            disabled
                            value="••••••••••••••••"
                            className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 cursor-not-allowed opacity-50"
                        />
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogin}
                    disabled={isConnecting}
                    className={`w-full py-3 px-4 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 group ${
                        isConnecting 
                            ? 'bg-primary/20 text-primary cursor-wait' 
                            : 'bg-primary text-primary-foreground hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                    }`}
                >
                    {isConnecting ? (
                        <>
                            ESTABLISHING UPLINK...
                            <span className="flex gap-1 ml-1">
                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}>.</motion.span>
                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}>.</motion.span>
                                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}>.</motion.span>
                            </span>
                        </>
                    ) : (
                        <>
                            AUTHENTICATE WITH SSO
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </motion.button>
            </div>

            <div className="pt-6 border-t border-border/50 text-center">
                <div className="text-[10px] font-mono text-muted-foreground">
                    <div>ENCRYPTION: AES-256-GCM</div>
                    <div className="mt-1">GATEWAY ID: <span className="text-primary">US-EAST-SEC-01</span></div>
                </div>
            </div>
        </div>
      </MotionCard>
    </div>
  );
};

