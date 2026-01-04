'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/useAuth';
import { Fade } from 'react-awesome-reveal';

export default function Landing() {
    const slides = [
        {
            url: '/uni.jpg',
            title: 'Bienvenido al sistema de gestión escolar',
            subtitle: 'Desde kinder hasta universidad',
        },
        {
            url: '/uni3.jpg',
            title: 'Administración académica completa',
            subtitle: 'Gestiona grupos, calificaciones e incidencias.',
        },
        {
            url: '/uni5.jpg',
            title: 'Comunicación fluida',
            subtitle: 'Mantente en contacto con docentes, estudiantes y tutores.',
        },
    ];

    const [currentIndex, setCurrentIndex] = useState(0);

    const prevSlide = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    const goToSlide = (slideIndex) => {
        setCurrentIndex(slideIndex);
    };

    const goToLogin = () => {
        window.location.href = "/login";
    };

    useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000); 
        return () => clearInterval(slideInterval);
    }, [currentIndex]);

    const { isLoggedIn } = useAuth();

    return (
        <div className='h-full w-full relative group'>
            <div
                style={{ backgroundImage: `url(${slides[currentIndex].url})` }}
                className='w-full h-full bg-center bg-cover transition-all duration-1000 ease-in-out'
            >
                {/* Overlay oscuro */}
                <div className="absolute inset-0 bg-black/60" />

                {/* Contenido del Slide */}
                <div className="relative z-10 h-full flex flex-col justify-center items-center">
                    <Fade key={currentIndex} duration={1500} triggerOnce>
                        <div className="max-w-4xl mx-auto px-6 text-center text-white">
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-4">{slides[currentIndex].title}</h1>
                            <p className="text-lg md:text-xl mb-8">{slides[currentIndex].subtitle}</p>
                            <button onClick={goToLogin} className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-lg transition-transform hover:scale-110 ease-in-out duration-300">
                                {isLoggedIn ? "Ir al Inicio" : "Iniciar Sesión"}
                            </button>
                        </div>
                    </Fade>
                </div>
            </div>

            {/* Flecha Izquierda */}
            <div className='hidden group-hover:block absolute top-[50%] translate-x-0 translate-y-[-50%] left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer z-20'>
                <ChevronLeft onClick={prevSlide} size={30} />
            </div>
            {/* Flecha Derecha */}
            <div className='hidden group-hover:block absolute top-[50%] translate-x-0 translate-y-[-50%] right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer z-20'>
                <ChevronRight onClick={nextSlide} size={30} />
            </div>

            {/* Indicadores de puntos */}
            <div className='absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-20'>
                {slides.map((slide, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${currentIndex === slideIndex ? 'bg-white' : 'bg-white/50'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
}