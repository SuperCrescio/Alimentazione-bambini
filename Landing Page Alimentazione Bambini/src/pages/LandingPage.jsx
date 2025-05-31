{
      /* eslint-disable */
    }
    import React, { useState, useEffect } from 'react';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { BookOpen, Download, ShoppingCart, Send, Users, Star, Loader2 } from 'lucide-react';
    import { supabase } from '@/lib/supabaseClient';
    import { loadStripe } from '@stripe/stripe-js';

    const LandingPage = () => {
      const { toast } = useToast();
      const [email, setEmail] = useState('');
      const [ebookPrice] = useState(7.99);
      const [stripePromise, setStripePromise] = useState(null);
      const [stripePublishableKey] = useState('pk_live_51PttKBR16qEEswyTS9HioMwrnwxWNPoUnAYV5RhteEl4psQNK7NLx5b17EFefiACIwC4ZWH6VrXFgE6Jbgwv84Jd00v7l5d5j8'); 
      const [stripePriceId] = useState('price_1RUnuZR16qEEswyTzYjuLGZa'); 
      const [isStripeLoading, setIsStripeLoading] = useState(false);
      const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

      useEffect(() => {
        if (stripePublishableKey) {
          setStripePromise(loadStripe(stripePublishableKey));
        }
      }, [stripePublishableKey]);

      const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          toast({
            title: "Oops!",
            description: "Per favore, inserisci un indirizzo email valido.",
            variant: "destructive",
            duration: 3000,
          });
          return;
        }
        setIsNewsletterLoading(true);

        try {
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('newsletter_subscriptions')
            .insert([{ email: email }]);

          if (subscriptionError) {
            if (subscriptionError.code === '23505') { 
                 toast({
                    title: "Attenzione!",
                    description: "Questo indirizzo email è già iscritto alla newsletter.",
                    variant: "default",
                    duration: 3000,
                  });
            } else {
                throw subscriptionError;
            }
          } else {
            
            const { data: functionData, error: functionError } = await supabase.functions.invoke('send-free-chapter', {
              body: JSON.stringify({ email: email }),
            });

            if (functionError) {
              console.error("Errore chiamata Edge Function 'send-free-chapter':", functionError);
              toast({
                title: "Iscrizione Riuscita, ma...",
                description: "Sei iscritto, ma c'è stato un problema nell'invio del capitolo. Contatta il supporto.",
                variant: "default",
                duration: 5000,
              });
            } else {
              toast({
                title: "Fantastico!",
                description: "Iscrizione avvenuta con successo! Il primo capitolo è in arrivo via email.",
                duration: 3000,
              });
            }
            setEmail('');
          }
        } catch (error) {
          console.error("Errore durante l'iscrizione o invio capitolo:", error);
          toast({
            title: "Errore!",
            description: "C'è stato un problema. Riprova più tardi.",
            variant: "destructive",
            duration: 3000,
          });
        } finally {
          setIsNewsletterLoading(false);
        }
      };

      const handleBuyEbook = async () => {
        setIsStripeLoading(true);
        if (!stripePublishableKey || !stripePriceId) {
          toast({
            title: "Configurazione Pagamento Incompleta",
            description: "Le chiavi Stripe non sono state ancora configurate correttamente.",
            variant: "destructive",
            duration: 5000,
          });
          console.error("Stripe Price ID mancante.");
          setIsStripeLoading(false);
          return;
        }

        if (!stripePromise) {
            toast({
                title: "Attendere Prego...",
                description: "Stripe si sta inizializzando. Riprova tra un istante.",
                variant: "default",
                duration: 3000,
            });
            setIsStripeLoading(false);
            return;
        }
        
        try {
          const stripe = await stripePromise;
          if (!stripe) {
            toast({
                title: "Errore Inizializzazione Stripe",
                description: "Impossibile caricare Stripe. Riprova più tardi.",
                variant: "destructive",
                duration: 5000,
            });
            setIsStripeLoading(false);
            return;
          }

          const { error } = await stripe.redirectToCheckout({
            lineItems: [{ price: stripePriceId, quantity: 1 }],
            mode: 'payment',
            successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`, 
            cancelUrl: `${window.location.origin}/payment-cancelled`, 
          });

          if (error) {
            console.error("Errore Stripe:", error);
            toast({
              title: "Errore Pagamento",
              description: error.message || "C'è stato un problema durante il reindirizzamento a Stripe.",
              variant: "destructive",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Errore durante l'acquisto:", error);
          toast({
            title: "Errore Inaspettato",
            description: "Si è verificato un errore. Riprova più tardi.",
            variant: "destructive",
            duration: 5000,
          });
        } finally {
            setIsStripeLoading(false);
        }
      };
      
      const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
      };

      const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 100 }
        }
      };
      
      const testimonials = [
        { name: "Dott.ssa Rossi", quote: "Un libro essenziale per ogni genitore. Spiega concetti complessi in modo chiaro e pratico.", avatarText: "DR" },
        { name: "Marco P.", quote: "Ha cambiato il nostro approccio all'alimentazione in famiglia. Consigliatissimo!", avatarText: "MP" },
        { name: "Lucia V.", quote: "Finalmente un testo che va dritto al punto sull'importanza dell'educazione alimentare per i più piccoli.", avatarText: "LV" }
      ];

      const chapterHighlights = [
        { title: "Perché è importante l’educazione alimentare", icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" /> },
        { title: "Mangiare bene: molto più che una regola", icon: <Star className="h-6 w-6 sm:h-8 sm:w-8 text-pink-400" /> },
        { title: "Qualche dato che fa riflettere", icon: <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-400" /> },
        { title: "Il cibo e il cervello: una connessione importante", icon: <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" /> },
      ];

      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-gray-100 font-sans">
          <motion.section 
            className="py-16 sm:py-20 md:py-32 text-center notion-linear-bg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="container mx-auto px-4 sm:px-6">
              <motion.div variants={itemVariants} className="mb-6 sm:mb-8">
                <BookOpen className="h-16 w-16 sm:h-20 sm:w-20 mx-auto text-white opacity-80" />
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-7xl font-extrabold mb-4 sm:mb-6 text-white tracking-tight"
              >
                Scopri il Segreto di un'Alimentazione <span className="text-yellow-300">Consapevole</span> per i Tuoi Bambini
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-purple-200 max-w-3xl mx-auto"
              >
                La guida completa per crescere figli sani, felici e pieni di energia attraverso scelte alimentari intelligenti.
              </motion.p>
              <motion.div variants={itemVariants} className="space-y-4 sm:space-y-0 sm:space-x-4">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto bg-white text-purple-700 hover:bg-purple-100 font-bold text-base sm:text-lg px-8 py-4 sm:px-10 sm:py-6 shadow-lg transform hover:scale-105 transition-transform duration-300"
                  onClick={() => document.getElementById('newsletter-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  <Download className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                  Scarica il 1° Capitolo Gratis
                </Button>
              </motion.div>
            </div>
          </motion.section>

          <motion.section 
            className="py-12 sm:py-16 md:py-24 bg-gray-800 bg-opacity-50"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 sm:px-6">
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3 sm:mb-4 gradient-text">
                Cosa Scoprirai nel Primo Capitolo?
              </motion.h2>
              <motion.p variants={itemVariants} className="text-base sm:text-lg text-purple-300 text-center mb-8 sm:mb-12 max-w-2xl mx-auto">
                Un assaggio del valore che questo eBook porterà nella tua famiglia.
              </motion.p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {chapterHighlights.map((highlight, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    className="bg-gray-700 bg-opacity-70 p-4 sm:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-center mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 mx-auto">
                      {highlight.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white text-center">{highlight.title}</h3>
                  </motion.div>
                ))}
              </div>

              <motion.div variants={itemVariants} className="mt-10 sm:mt-12 prose prose-sm sm:prose-base lg:prose-xl max-w-3xl mx-auto text-gray-300 p-4 sm:p-6 bg-gray-700 bg-opacity-50 rounded-lg shadow-lg">
                <h3 className="text-xl sm:text-2xl font-bold text-purple-400">Capitolo 1: Perché è importante l’educazione alimentare</h3>
                <hr className="border-purple-500 my-3 sm:my-4" />
                <p className="font-semibold text-md sm:text-lg text-pink-400">Mangiare bene: molto più che una regola</p>
                <p className="text-sm sm:text-base">Parlare di educazione alimentare non significa solo dire ai bambini “mangia le verdure e non esagerare con i dolci”. È una cosa molto più importante, che riguarda la salute, la crescita, e anche il modo in cui i bambini si sentono e si comportano ogni giorno.</p>
                <hr className="border-purple-500 my-3 sm:my-4" />
                <p className="font-semibold text-md sm:text-lg text-pink-400">Qualche dato che fa riflettere</p>
                <p className="text-sm sm:text-base">L’Organizzazione Mondiale della Sanità ha registrato che nel 2020 più di 39 milioni di bambini sotto i 5 anni erano in sovrappeso o obesi. In Europa, tra i bambini dai 6 ai 9 anni, circa 1 su 5 (e in alcuni casi anche 1 su 3) ha problemi di peso...</p>
                <p className="mt-4 sm:mt-6 text-center">
                  <Button 
                    variant="link" 
                    className="text-orange-400 hover:text-orange-300 text-base sm:text-lg"
                    onClick={() => document.getElementById('newsletter-section').scrollIntoView({ behavior: 'smooth' })}
                  >
                    Leggi l'estratto completo &rarr;
                  </Button>
                </p>
              </motion.div>
            </div>
          </motion.section>
          
          <motion.section
            className="py-12 sm:py-16 md:py-24 bg-gray-900"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 sm:px-6">
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 gradient-text">
                Visualizza un Futuro più Sano
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <motion.div variants={itemVariants} className="rounded-xl overflow-hidden shadow-2xl">
                  <img  className="w-full h-48 sm:h-64 object-cover transform hover:scale-105 transition-transform duration-300" alt="Bambini felici che mangiano frutta fresca" src="https://images.unsplash.com/photo-1540126853358-ed98fe6157f4" />
                </motion.div>
                <motion.div variants={itemVariants} className="rounded-xl overflow-hidden shadow-2xl md:col-span-2">
                  <img  className="w-full h-48 sm:h-64 object-cover transform hover:scale-105 transition-transform duration-300" alt="Tavola imbandita con cibi sani e colorati" src="https://images.unsplash.com/photo-1660518066206-b67229293482" />
                </motion.div>
                 <motion.div variants={itemVariants} className="rounded-xl overflow-hidden shadow-2xl md:col-span-2">
                  <img  className="w-full h-48 sm:h-64 object-cover transform hover:scale-105 transition-transform duration-300" alt="Genitore che cucina con il proprio bambino" src="https://images.unsplash.com/photo-1606787620484-4561d4d20907" />
                </motion.div>
                <motion.div variants={itemVariants} className="rounded-xl overflow-hidden shadow-2xl">
                  <img  className="w-full h-48 sm:h-64 object-cover transform hover:scale-105 transition-transform duration-300" alt="Illustrazione del cervello con cibo sano intorno" src="https://images.unsplash.com/photo-1690643129307-c13052484acd" />
                </motion.div>
              </div>
            </div>
          </motion.section>

          <motion.section 
            className="py-12 sm:py-16 md:py-24 bg-gray-800 bg-opacity-50"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 sm:px-6">
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 gradient-text">
                Cosa Dicono i Nostri Lettori
              </motion.h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    className="bg-gray-700 bg-opacity-70 p-6 sm:p-8 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300"
                  >
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-3 sm:mr-4">
                        {testimonial.avatarText}
                      </div>
                      <p className="font-semibold text-md sm:text-lg text-white">{testimonial.name}</p>
                    </div>
                    <p className="text-gray-300 italic text-sm sm:text-base">"{testimonial.quote}"</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>

          <motion.section 
            id="newsletter-section"
            className="py-12 sm:py-16 md:py-24 bg-gray-900"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 sm:px-6 max-w-2xl text-center">
              <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
                <Download className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-purple-400" />
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 gradient-text">
                Ricevi il Primo Capitolo <span className="text-pink-400">Gratis</span>!
              </motion.h2>
              <motion.p variants={itemVariants} className="text-base sm:text-lg text-purple-300 mb-6 sm:mb-8">
                Iscriviti alla nostra newsletter e ottieni subito l'accesso esclusivo al primo capitolo del nostro eBook.
              </motion.p>
              <motion.form variants={itemVariants} onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="La tua migliore email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-gray-800 border-gray-700 text-white placeholder-gray-500 text-base sm:text-lg p-3 sm:p-4 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={isNewsletterLoading}
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  disabled={isNewsletterLoading}
                >
                  {isNewsletterLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                  {isNewsletterLoading ? 'Invio...' : 'Invia e Scarica'}
                </Button>
              </motion.form>
            </div>
          </motion.section>

          <motion.section 
            className="py-12 sm:py-16 md:py-24 notion-linear-bg"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="container mx-auto px-4 sm:px-6">
              <Card className="max-w-2xl mx-auto bg-gray-800 bg-opacity-80 shadow-2xl border-purple-500 border-2">
                <CardHeader className="text-center p-4 sm:p-6">
                  <motion.div variants={itemVariants} className="mb-3 sm:mb-4">
                    <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-purple-400" />
                  </motion.div>
                  <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Acquista l'eBook Completo</motion.h2>
                  <motion.p variants={itemVariants} className="text-purple-300 text-md sm:text-lg mt-1 sm:mt-2">
                    Tutte le strategie e i consigli per la tua famiglia.
                  </motion.p>
                </CardHeader>
                <CardContent className="text-center p-4 sm:p-6">
                  <motion.p variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white my-4 sm:my-6">
                    {ebookPrice.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}
                  </motion.p>
                  <motion.ul variants={itemVariants} className="text-left text-gray-300 space-y-2 sm:space-y-3 mb-6 sm:mb-8 list-disc list-inside pl-2 sm:pl-4 text-sm sm:text-base">
                    <li>Strategie pratiche e facili da applicare.</li>
                    <li>Ricette sane e gustose per bambini.</li>
                    <li>Come leggere le etichette alimentari.</li>
                    <li>Gestire i capricci a tavola.</li>
                    <li>E molto altro!</li>
                  </motion.ul>
                </CardContent>
                <CardFooter className="flex justify-center p-4 sm:p-6">
                  <motion.div variants={itemVariants}>
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-bold text-lg sm:text-xl px-10 py-4 sm:px-12 sm:py-6 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      onClick={handleBuyEbook}
                      disabled={isStripeLoading || !stripePublishableKey || !stripePriceId}
                    >
                      {isStripeLoading ? (
                        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                      )}
                      {isStripeLoading ? 'Attendere...' : 'Acquista Ora'}
                    </Button>
                     {!stripePublishableKey || !stripePriceId && (
                        <p className="text-xs text-yellow-400 mt-2">
                            La configurazione di Stripe non è completa.
                        </p>
                    )}
                  </motion.div>
                </CardFooter>
              </Card>
            </div>
          </motion.section>

          <footer className="py-8 sm:py-12 bg-gray-900 text-center">
            <div className="container mx-auto px-4 sm:px-6">
              <p className="text-gray-500 text-sm sm:text-base">
                &copy; {new Date().getFullYear()} Educazione Alimentare per Bambini. Tutti i diritti riservati.
              </p>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 sm:mt-2">
                Realizzato con <span className="text-pink-500">&hearts;</span> per un futuro più sano.
              </p>
            </div>
          </footer>
        </div>
      );
    };

    export default LandingPage;