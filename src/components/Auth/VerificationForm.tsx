import React, { useState } from 'react';
import { KeyRound, Loader, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface VerificationFormProps {
  email: string;
}

export default function VerificationForm({ email }: VerificationFormProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendVerificationEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await verifyEmail(code);
      toast.success('Email verificata con successo');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Codice non valido. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast.success('Nuovo codice inviato');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error('Errore nell\'invio del codice');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10">
      <h2 className="text-2xl font-medieval text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        Verifica Email
      </h2>

      <p className="text-gray-400 text-center mb-6">
        Abbiamo inviato un codice di verifica a {email}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Codice di Verifica
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:border-purple-500"
              placeholder="Inserisci il codice"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-purple-500 hover:bg-purple-600 
                   text-white font-medium rounded-lg transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader className="w-5 h-5 mx-auto animate-spin" />
          ) : (
            'Verifica'
          )}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full flex items-center justify-center gap-2 py-2 px-4
                   text-gray-400 hover:text-purple-400 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Invia nuovo codice
        </button>
      </form>
    </div>
  );
}