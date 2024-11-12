import React, { useState } from 'react';
import { Mail, Lock, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const { signUp, signIn, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'Si è verificato un errore';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email già registrata. Prova ad accedere.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email non valida.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La password deve essere di almeno 6 caratteri.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password non corretta.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Utente non trovato.';
          break;
        case 'email-not-verified':
          errorMessage = 'Per favore verifica la tua email prima di accedere.';
          break;
        default:
          errorMessage = 'Errore durante l\'autenticazione. Riprova.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast.error('Inserisci la tua email per reimpostare la password');
      return;
    }

    try {
      await resetPassword(email);
      toast.success('Email per il reset della password inviata');
    } catch (error) {
      toast.error('Errore nell\'invio dell\'email di reset');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10">
      <h2 className="text-2xl font-medieval text-center mb-6 bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
        {isLogin ? 'Accedi' : 'Registrazione'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:border-purple-500"
              placeholder="La tua email"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg
                       text-gray-100 placeholder-gray-500 focus:border-purple-500"
              placeholder={isLogin ? 'La tua password' : 'Scegli una password'}
              required
              minLength={6}
            />
          </div>
          {!isLogin && (
            <p className="text-xs text-gray-400 mt-1">
              La password deve contenere almeno 6 caratteri
            </p>
          )}
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
            isLogin ? 'Accedi' : 'Registrati'
          )}
        </button>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              Password dimenticata?
            </button>
          )}
        </div>

        {!isLogin && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-300">
              Dopo la registrazione, riceverai un'email di verifica. 
              Controlla la tua casella di posta e clicca sul link per verificare il tuo account.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}