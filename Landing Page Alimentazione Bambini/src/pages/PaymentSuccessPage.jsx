import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const PaymentSuccessPage = () => {
  const location = useLocation();
  const { toast } = useToast();
  const [downloadLink, setDownloadLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (!sessionId) {
      setError("ID sessione mancante. Impossibile recuperare l'eBook.");
      setIsLoading(false);
      toast({
        title: "Errore",
        description: "ID sessione di pagamento non trovato.",
        variant: "destructive",
      });
      return;
    }

    const fetchDownloadLink = async () => {
      setIsLoading(true);
      setError('');
      try {
        const { data, error: functionError } = await supabase.functions.invoke('generate-ebook-download-link', {
          body: JSON.stringify({ sessionId: sessionId }),
        });

        if (functionError) {
          throw functionError;
        }

        if (data && data.downloadUrl) {
          setDownloadLink(data.downloadUrl);
          toast({
            title: "Download Pronto!",
            description: "Il tuo eBook è pronto per essere scaricato.",
          });
        } else if (data && data.error) {
           setError(data.error || "Errore durante la generazione del link di download.");
           toast({
            title: "Errore Link Download",
            description: data.error || "Impossibile generare il link per il download.",
            variant: "destructive",
          });
        } 
        else {
          setError("Risposta non valida dalla funzione di download.");
           toast({
            title: "Errore Inaspettato",
            description: "La funzione di download ha restituito una risposta non valida.",
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error("Errore nel recuperare il link di download:", err);
        setError(err.message || "Si è verificato un errore nel recuperare il link per il download. Riprova o contatta il supporto.");
        toast({
          title: "Errore Critico",
          description: "Impossibile recuperare il link per il download. Contatta il supporto.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDownloadLink();
  }, [location, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <Card className="w-full max-w-md bg-gray-800 bg-opacity-80 shadow-2xl border-green-500">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
          <CardTitle className="text-3xl font-bold text-white">Pagamento Riuscito!</CardTitle>
          <CardDescription className="text-purple-300 mt-2">
            Grazie per il tuo acquisto. Il tuo eBook è quasi pronto.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {isLoading && (
            <div className="flex flex-col items-center justify-center my-6">
              <Loader2 className="h-12 w-12 animate-spin text-purple-400 mb-3" />
              <p className="text-lg text-gray-300">Stiamo preparando il tuo download...</p>
            </div>
          )}
          {!isLoading && downloadLink && (
            <div className="my-6">
              <p className="text-lg text-gray-200 mb-4">Clicca il pulsante qui sotto per scaricare il tuo eBook:</p>
              <Button
                asChild
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold text-lg py-3 shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                <a href={downloadLink} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-6 w-6" />
                  Scarica l'eBook
                </a>
              </Button>
              <p className="text-xs text-gray-400 mt-3">
                Il link è valido per un periodo limitato.
              </p>
            </div>
          )}
          {!isLoading && error && (
             <div className="my-6 p-4 bg-red-900 bg-opacity-50 rounded-md">
              <div className="flex items-center justify-center mb-2">
                <AlertTriangle className="h-8 w-8 text-red-400 mr-2" />
                <p className="text-xl font-semibold text-red-300">Oops! Qualcosa è andato storto.</p>
              </div>
              <p className="text-sm text-red-200">{error}</p>
              <p className="text-sm text-red-200 mt-2">
                Se il problema persiste, per favore <Link to="/" className="underline hover:text-red-100">contatta il supporto</Link> fornendo il tuo ID sessione.
              </p>
            </div>
          )}
          <Button variant="outline" asChild className="mt-8 w-full border-purple-500 text-purple-300 hover:bg-purple-700 hover:text-white">
            <Link to="/">Torna alla Home Page</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;