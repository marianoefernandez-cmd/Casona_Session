import React, { useEffect, useState, useRef } from 'react';
import { getRegistrationByCode, updateRegistrationStatus } from '../services/storage';
import { Registration, RegistrationStatus } from '../types';
import { CheckCircle, XCircle, ScanLine, RefreshCcw } from 'lucide-react';

declare const Html5QrcodeScanner: any;

const Scanner: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scannedReg, setScannedReg] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize scanner
    if (!scanResult) {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );
      
      scanner.render(onScanSuccess, onScanFailure);
      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error: any) => console.error("Failed to clear scanner", error));
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanResult]);

  const onScanSuccess = (decodedText: string) => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setScanResult(decodedText);
    handleValidation(decodedText);
  };

  const onScanFailure = (error: any) => {
    // Handle scan failure, usually ignore to keep scanning
  };

  const handleValidation = (code: string) => {
    const reg = getRegistrationByCode(code);
    if (reg) {
      setScannedReg(reg);
      if (reg.status === RegistrationStatus.APPROVED || reg.status === RegistrationStatus.CHECKED_IN) {
        // Auto check-in if approved
        if (reg.status === RegistrationStatus.APPROVED) {
           updateRegistrationStatus(reg.id, RegistrationStatus.CHECKED_IN);
           setScannedReg({ ...reg, status: RegistrationStatus.CHECKED_IN });
        }
        setError(null);
      } else if (reg.status === RegistrationStatus.REJECTED) {
        setError("Este ticket fue rechazado anteriormente.");
      } else {
        setError("El registro aún está pendiente de aprobación.");
      }
    } else {
      setScannedReg(null);
      setError("Código QR no reconocido en el sistema.");
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setScannedReg(null);
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-black relative">
      {!scanResult ? (
        <div className="flex-1 flex flex-col justify-center items-center relative">
          <div id="reader" className="w-full max-w-md mx-auto bg-black text-white border-none"></div>
          <div className="absolute bottom-10 text-white/70 text-sm text-center px-6">
            <p>Apunta la cámara al código QR del asistente.</p>
            <p className="text-xs mt-2 opacity-50">El escáner es el guardián silencioso.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-900">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl animate-fade-in-up">
            
            {error ? (
              <>
                <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <XCircle className="text-rose-500 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-rose-600 mb-2">Acceso Denegado</h2>
                <p className="text-slate-600 mb-6">{error}</p>
              </>
            ) : scannedReg ? (
              <>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-emerald-500 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-emerald-600 mb-2">¡Bienvenido!</h2>
                <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                   <p className="text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Asistente</p>
                   <p className="text-xl font-serif text-slate-900">{scannedReg.fullName}</p>
                   <p className="text-sm text-slate-500 mt-1">{scannedReg.email}</p>
                   {scannedReg.status === RegistrationStatus.CHECKED_IN && (
                     <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                       Ya registrado (Check-in previo)
                     </span>
                   )}
                </div>
              </>
            ) : null}

            <button
              onClick={resetScanner}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Escanear Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;