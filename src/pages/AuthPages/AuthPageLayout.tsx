import React from "react";
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen bg-white dark:bg-gray-900">
      <div className="relative flex flex-col w-full h-full lg:flex-row">
        {/* Panel del formulario */}
        <div className="flex items-center justify-center w-full lg:w-1/2 p-8 lg:p-12">
          <div className="w-full max-w-md">
        {children}
          </div>
        </div>
        
        {/* Panel del logo mejorado */}
        <div className="relative hidden w-full h-full lg:w-1/2 lg:flex items-center justify-center overflow-hidden bg-slate-900 dark:bg-slate-800">
          
          {/* Estrellas de fondo */}
          <div className="absolute inset-0">
            <style>{`
              @keyframes starTwinkle {
                0%, 100% { opacity: 0.4; transform: scale(0.8); }
                50% { opacity: 1; transform: scale(1.1); }
              }
              @keyframes starGlow {
                0%, 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.8)); }
                50% { filter: drop-shadow(0 0 6px rgba(255,255,255,1)) drop-shadow(0 0 12px rgba(255,255,255,0.6)); }
              }
              .star-animate { animation: starTwinkle 2s infinite ease-in-out; }
              .star-animate-slow { animation: starTwinkle 3s infinite ease-in-out; }
              .star-animate-fast { animation: starTwinkle 1.5s infinite ease-in-out; }
              .star-glow { animation: starGlow 2.5s infinite ease-in-out; }
            `}</style>
            
            {/* Estrellas grandes - 5 puntas */}
            <svg className="absolute top-[8%] left-[12%] star-animate star-glow" width="12" height="12" style={{animationDelay: '0s'}} opacity="0.9">
              <polygon points="6,1 7.5,4.5 11,4.5 8.2,7 9.5,10.5 6,8.5 2.5,10.5 3.8,7 1,4.5 4.5,4.5" fill="white"/>
            </svg>
            
            <svg className="absolute top-[22%] right-[18%]" width="10" height="10" opacity="0.8">
              <polygon points="5,1 6.2,3.8 9,3.8 6.9,5.7 8.1,8.5 5,7 1.9,8.5 3.1,5.7 1,3.8 3.8,3.8" fill="white"/>
            </svg>
            
            <svg className="absolute top-[38%] left-[6%] star-animate-slow star-glow" width="14" height="14" style={{animationDelay: '1s'}} opacity="0.95">
              <polygon points="7,1 8.8,5.2 13,5.2 9.6,8 11.4,12.2 7,9.8 2.6,12.2 4.4,8 1,5.2 5.2,5.2" fill="white"/>
            </svg>
            
            <svg className="absolute top-[58%] right-[10%]" width="9" height="9" opacity="0.7">
              <polygon points="4.5,1 5.5,3.5 8,3.5 6.2,5.2 7.2,7.7 4.5,6.2 1.8,7.7 2.8,5.2 1,3.5 3.5,3.5" fill="white"/>
            </svg>
            
            <svg className="absolute top-[73%] left-[22%] star-animate" width="11" height="11" style={{animationDelay: '2s'}} opacity="0.85">
              <polygon points="5.5,1 6.9,4.1 10,4.1 7.5,6.4 8.9,9.5 5.5,7.6 2.1,9.5 3.5,6.4 1,4.1 4.1,4.1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[87%] right-[28%]" width="8" height="8" opacity="0.75">
              <polygon points="4,1 4.8,3 7,3 5.4,4.5 6.2,6.5 4,5.2 1.8,6.5 2.6,4.5 1,3 3.2,3" fill="white"/>
            </svg>
            
            {/* Estrellas medianas */}
            <svg className="absolute top-[13%] left-[32%] star-animate-fast" width="7" height="7" style={{animationDelay: '0.5s'}} opacity="0.8">
              <polygon points="3.5,0.5 4.2,2.8 6.5,2.8 4.6,4.2 5.3,6.5 3.5,5.1 1.7,6.5 2.4,4.2 0.5,2.8 2.8,2.8" fill="white"/>
            </svg>
            
            <svg className="absolute top-[28%] right-[38%]" width="6" height="6" opacity="0.7">
              <polygon points="3,0.5 3.6,2.2 5.5,2.2 4,3.4 4.6,5.1 3,4.1 1.4,5.1 2,3.4 0.5,2.2 2.4,2.2" fill="white"/>
            </svg>
            
            <svg className="absolute top-[43%] left-[42%]" width="5" height="5" opacity="0.65">
              <polygon points="2.5,0.5 3,1.8 4.5,1.8 3.2,2.7 3.7,4 2.5,3.2 1.3,4 1.8,2.7 0.5,1.8 2,1.8" fill="white"/>
            </svg>
            
            <svg className="absolute top-[53%] right-[32%] star-animate" width="7" height="7" style={{animationDelay: '1.5s'}} opacity="0.85">
              <polygon points="3.5,0.5 4.2,2.8 6.5,2.8 4.6,4.2 5.3,6.5 3.5,5.1 1.7,6.5 2.4,4.2 0.5,2.8 2.8,2.8" fill="white"/>
            </svg>
            
            <svg className="absolute top-[68%] left-[48%]" width="6" height="6" opacity="0.75">
              <polygon points="3,0.5 3.6,2.2 5.5,2.2 4,3.4 4.6,5.1 3,4.1 1.4,5.1 2,3.4 0.5,2.2 2.4,2.2" fill="white"/>
            </svg>
            
            <svg className="absolute top-[78%] right-[43%] star-animate-slow" width="8" height="8" style={{animationDelay: '2.5s'}} opacity="0.7">
              <polygon points="4,0.5 4.8,3 7.5,3 5.4,4.5 6.2,7 4,5.7 1.8,7 2.6,4.5 0.5,3 3.2,3" fill="white"/>
            </svg>
            
            {/* Estrellas pequeñas */}
            <svg className="absolute top-[18%] left-[58%]" width="4" height="4" opacity="0.6">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[33%] right-[52%] star-animate-fast" width="4" height="4" style={{animationDelay: '0.3s'}} opacity="0.7">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[48%] left-[68%]" width="3" height="3" opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[63%] right-[58%]" width="4" height="4" opacity="0.65">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[88%] left-[63%] star-animate" width="5" height="5" style={{animationDelay: '1.8s'}} opacity="0.6">
              <polygon points="2.5,0.3 3,1.6 4.7,1.6 3.3,2.5 3.8,3.8 2.5,3 1.2,3.8 1.7,2.5 0.3,1.6 2,1.6" fill="white"/>
            </svg>
            
            <svg className="absolute top-[3%] right-[63%]" width="4" height="4" opacity="0.55">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            {/* Estrellas diminutas */}
            <svg className="absolute top-[10%] left-[78%]" width="3" height="3" opacity="0.45">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[26%] right-[73%] star-animate-slow" width="3" height="3" style={{animationDelay: '3s'}} opacity="0.4">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[40%] left-[83%]" width="2" height="2" opacity="0.5">
              <polygon points="1,0.1 1.2,0.7 1.9,0.7 1.3,1.1 1.5,1.7 1,1.3 0.5,1.7 0.7,1.1 0.1,0.7 0.8,0.7" fill="white"/>
            </svg>
            
            {/* Más estrellas dispersas */}
            <svg className="absolute top-[16%] left-[3%]" width="3" height="3" opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[36%] left-[1%] star-animate" width="4" height="4" style={{animationDelay: '2.3s'}} opacity="0.45">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[50%] left-[5%]" width="3" height="3" opacity="0.55">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            {/* Constelación */}
            <svg className="absolute top-[25%] left-[25%]" width="6" height="6" opacity="0.6">
              <polygon points="3,0.5 3.6,2.2 5.5,2.2 4,3.4 4.6,5.1 3,4.1 1.4,5.1 2,3.4 0.5,2.2 2.4,2.2" fill="white"/>
            </svg>
            <svg className="absolute top-[30%] left-[30%]" width="4" height="4" opacity="0.55">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            <svg className="absolute top-[35%] left-[28%]" width="3" height="3" opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            {/* Más estrellas adicionales */}
            <svg className="absolute top-[5%] left-[35%] star-animate-fast" width="5" height="5" style={{animationDelay: '1.7s'}} opacity="0.7">
              <polygon points="2.5,0.3 3,1.6 4.7,1.6 3.3,2.5 3.8,3.8 2.5,3 1.2,3.8 1.7,2.5 0.3,1.6 2,1.6" fill="white"/>
            </svg>
            
            <svg className="absolute top-[12%] left-[65%]" width="3" height="3" opacity="0.45">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[17%] right-[8%] star-animate" width="4" height="4" style={{animationDelay: '2.8s'}} opacity="0.65">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[24%] left-[50%]" width="3" height="3" opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[32%] left-[18%] star-animate-slow" width="6" height="6" style={{animationDelay: '0.8s'}} opacity="0.75">
              <polygon points="3,0.5 3.6,2.2 5.5,2.2 4,3.4 4.6,5.1 3,4.1 1.4,5.1 2,3.4 0.5,2.2 2.4,2.2" fill="white"/>
            </svg>
            
            <svg className="absolute top-[37%] right-[15%]" width="4" height="4" opacity="0.6">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[42%] right-[50%] star-animate-fast" width="3" height="3" style={{animationDelay: '1.3s'}} opacity="0.55">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[47%] left-[12%]" width="3" height="3" opacity="0.4">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[54%] left-[65%] star-animate" width="4" height="4" style={{animationDelay: '3.2s'}} opacity="0.7">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[61%] left-[35%]" width="5" height="5" opacity="0.65">
              <polygon points="2.5,0.3 3,1.6 4.7,1.6 3.3,2.5 3.8,3.8 2.5,3 1.2,3.8 1.7,2.5 0.3,1.6 2,1.6" fill="white"/>
            </svg>
            
            <svg className="absolute top-[67%] right-[55%] star-animate-slow" width="3" height="3" style={{animationDelay: '2.1s'}} opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[74%] left-[8%]" width="4" height="4" opacity="0.6">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[79%] left-[55%] star-animate-fast" width="3" height="3" style={{animationDelay: '0.6s'}} opacity="0.55">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[84%] left-[40%]" width="5" height="5" opacity="0.7">
              <polygon points="2.5,0.3 3,1.6 4.7,1.6 3.3,2.5 3.8,3.8 2.5,3 1.2,3.8 1.7,2.5 0.3,1.6 2,1.6" fill="white"/>
            </svg>
            
            <svg className="absolute top-[91%] right-[12%] star-animate" width="4" height="4" style={{animationDelay: '2.7s'}} opacity="0.65">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[94%] left-[75%]" width="3" height="3" opacity="0.45">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            {/* Estrellas en zona superior */}
            <svg className="absolute top-[2%] left-[45%]" width="3" height="3" opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[6%] right-[25%] star-animate-fast" width="4" height="4" style={{animationDelay: '1.9s'}} opacity="0.6">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[9%] left-[88%]" width="2" height="2" opacity="0.4">
              <polygon points="1,0.1 1.2,0.7 1.9,0.7 1.3,1.1 1.5,1.7 1,1.3 0.5,1.7 0.7,1.1 0.1,0.7 0.8,0.7" fill="white"/>
            </svg>
            
            {/* Estrellas en zona media */}
            <svg className="absolute top-[45%] right-[25%] star-animate-slow" width="5" height="5" style={{animationDelay: '2.4s'}} opacity="0.7">
              <polygon points="2.5,0.3 3,1.6 4.7,1.6 3.3,2.5 3.8,3.8 2.5,3 1.2,3.8 1.7,2.5 0.3,1.6 2,1.6" fill="white"/>
            </svg>
            
            <svg className="absolute top-[49%] left-[85%]" width="3" height="3" opacity="0.45">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[51%] left-[25%] star-animate" width="3" height="3" style={{animationDelay: '3.5s'}} opacity="0.55">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            {/* Estrellas dispersas adicionales */}
            <svg className="absolute top-[14%] left-[75%]" width="3" height="3" opacity="0.4">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[27%] left-[85%] star-animate-fast" width="4" height="4" style={{animationDelay: '0.4s'}} opacity="0.6">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[65%] left-[15%] star-animate-slow" width="3" height="3" style={{animationDelay: '1.1s'}} opacity="0.5">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
            
            <svg className="absolute top-[77%] right-[65%]" width="4" height="4" opacity="0.55">
              <polygon points="2,0.3 2.4,1.4 3.7,1.4 2.6,2.2 3,3.3 2,2.6 1,3.3 1.4,2.2 0.3,1.4 1.6,1.4" fill="white"/>
            </svg>
            
            <svg className="absolute top-[89%] left-[12%] star-animate" width="3" height="3" style={{animationDelay: '2.9s'}} opacity="0.6">
              <polygon points="1.5,0.2 1.8,1 2.8,1 2,1.6 2.3,2.4 1.5,1.9 0.7,2.4 1,1.6 0.2,1 1.2,1" fill="white"/>
            </svg>
          </div>
          
          {/* Efectos de luz de fondo */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          
          {/* Patrón de fondo sutil */}
          <div className="absolute min-h-full inset-0 opacity-5">
            <GridShape />
          </div>
          
          {/* Contenido principal */}
          <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-lg">
            {/* Contenedor del logo con efectos elegantes */}
            <div className="relative mb-8 group">
              <Link to="/" className="block">
                {/* Efecto de resplandor detrás del logo */}
                <div className="absolute inset-0 bg-white/15 rounded-3xl blur-xl scale-105 group-hover:scale-120 transition-transform duration-500"></div>
                
                {/* Contenedor del logo */}
                <div className="relative bg-white rounded-3xl p-8 border border-white/20 shadow-2xl">
                  <img
                    width={360}
                    height={90}
                  src="/logo-reyes.png"
                    alt="Logo Cabalgatas Reyes Silos"
                    className="w-full h-auto drop-shadow-2xl"
                />
                  
                  </div>
              </Link>
            </div>
            
            {/* Título y descripción */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                Cabalgatas Reyes Silos
              </h1>
              <p className="text-xl text-blue-100/90 leading-relaxed">
                Tradición, elegancia y majestuosidad en cada desfile
              </p>
              <p className="text-base text-blue-200/70 w-full">
                Únete a nuestra comunidad y vive la experiencia única de las cabalgatas más prestigiosas
              </p>
            </div>
            
            
          </div>
        </div>
        
        {/* Botón del tema mejorado */}
        <div className="fixed z-50 bottom-6 right-6">
          <div className="bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20 shadow-xl hover:bg-white/20 transition-all duration-300">
          <ThemeTogglerTwo />
          </div>
        </div>
      </div>
    </div>
  );
}
