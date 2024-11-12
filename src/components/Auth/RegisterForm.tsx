import React, { useState } from 'react';
import { Mail, Lock, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signIn } = useAuth();
  const [isLogin, setIsLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Accesso effettuato con successo');
        onSuccess();
      } else {
        await signUp(email, password);
        toast.success('Ti abbiamo inviato una email di verifica. Controlla la tua casella di posta.');
      }
    } catch (error: any) {
      let errorMessage = 'Si è verificato un errore. Riprova.';
      
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
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
              placeholder="La tua password"
              minLength={6}
              required
            />
          </div>
          {!isLogin && (
            <p className="text-xs text-gray-400 mt-1">
              La password deve essere di almeno 6 caratteri
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

        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
          >
            {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </form>
    </div>
  );
}