import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { ShieldCheck, Lock } from 'lucide-react';
import { UserRole } from '../../types/auth';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const isAnalyst = user?.role === UserRole.ANALYST || user?.role === UserRole.ADMIN;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <ShieldCheck className="w-16 h-16 text-success mb-6" />
      <h1 className="text-4xl font-bold tracking-tight mb-4">
        Autonomous Digital Trust Platform
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mb-8">
        Welcome to the SOC-Grade Security Intelligence Center. 
        {user ? ` Logged in as ${user.username} (${user.role}).` : ' Please login to continue.'}
      </p>

      <div className="flex gap-4">
        {isAnalyst ? (
           <Link 
             to="/soc" 
             className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
           >
             Enter SOC Dashboard
           </Link>
        ) : (
            <div className="px-6 py-3 bg-muted text-muted-foreground font-medium rounded-md flex items-center cursor-not-allowed">
                <Lock className="w-4 h-4 mr-2" />
                SOC Access Restricted
            </div>
        )}
      </div>
    </div>
  );
};
