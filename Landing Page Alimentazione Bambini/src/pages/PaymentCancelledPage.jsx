import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentCancelledPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-gray-800 bg-opacity-80 shadow-2xl border-red-500">
        <CardHeader className="text-center">
          <XCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <CardTitle className="text-3xl font-bold text-white">Pagamento Annullato</CardTitle>
          <CardDescription className="text-purple-300 mt-2">
            Sembra che tu abbia annullato il processo di pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-gray-300 mb-6">
            Nessun problema! Puoi sempre tornare indietro e completare l'acquisto quando vuoi.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-lg py-3 shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <Link to="/">Torna alla Home Page</Link>
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            Se hai annullato per errore o hai riscontrato problemi, non esitare a <Link to="/" className="underline hover:text-purple-200">contattarci</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelledPage;