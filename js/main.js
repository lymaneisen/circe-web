// main.js

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Inicializar Lenis (Smooth Scroll Premium)
    const lenis = new Lenis({
        duration: 1.5, // Más lento para dar sensación de pausa
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integrar Lenis con GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Animación Inicial (Loader "Dropping Cards" Osmo)
    const tlLoader = gsap.timeline();
    
    // Configuración inicial de las cartas: arriba fuera de pantalla, desordenadas
    gsap.set(".card-img-container", {
        y: () => -window.innerHeight - 300, 
        rotation: () => gsap.utils.random(-35, 35), // Rotación desordenada
        scale: () => gsap.utils.random(0.8, 1.1),
        x: () => gsap.utils.random(-50, 50) 
    });

    // Cada de las cartas una por una (Dropping cards effect)
    tlLoader.to(".card-img-container", {
        y: (index, target) => {
            if (target.classList.contains("card-logo-container")) return 0;
            return gsap.utils.random(-window.innerHeight/4, window.innerHeight/4);
        }, // Esparcidas verticalmente (salvo el logo)
        rotation: (index, target) => {
            if (target.classList.contains("card-logo-container")) return 0;
            return gsap.utils.random(-30, 30);
        }, // Mayor rotación para verse más desordenadas (salvo el logo)
        scale: 1,
        x: (index, target) => {
            if (target.classList.contains("card-logo-container")) return 0;
            return gsap.utils.random(-window.innerWidth/3, window.innerWidth/3);
        }, // Esparcidas horizontalmente (salvo el logo)
        duration: 1.0, // Medio (antes 0.8, original 1.2)
        stagger: 0.12, // Medio (antes 0.08, original 0.15)
        ease: "power4.out"
    })
    // Las cartas salen volando hacia abajo (efecto de gravedad)
    .to(".card-img-container", {
        y: () => window.innerHeight + 300, // Positive value means falling down off screen
        rotation: () => gsap.utils.random(-45, 45),
        duration: 1.0, // Medio
        stagger: 0.04, // Medio
        ease: "power4.inOut"
    }, "+=0.8") // Medio
    // El fondo se desvanece suavemente
    .to(".osmo-loader", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
            document.body.classList.remove("is-loading");
        }
    }, "-=0.8")
    .set(".osmo-loader", { display: "none" })
    // Animación de entrada del Hero
    .from(".hero-bg", {
        scale: 1.1,
        duration: 2,
        ease: "power3.out"
    }, "-=1")
    .from(".reveal-text", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: "power4.out"
    }, "-=1.5")
    .to(".scroll-indicator", {
        opacity: 1,
        duration: 1,
        ease: "power2.out"
    }, "-=0.5");


    // 3. Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3.5 Menu Mobile Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    let isMenuOpen = false;

    if(menuToggle && navMobile) {
        menuToggle.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if(isMenuOpen) {
                navbar.classList.add('menu-open');
                gsap.to(navMobile, { autoAlpha: 1, duration: 0.5, ease: "power2.out" });
                gsap.to('.nav-mobile-link', { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.2, ease: "power3.out" });
                lenis.stop(); // Prevenir scroll mientras el menú está abierto
            } else {
                navbar.classList.remove('menu-open');
                gsap.to('.nav-mobile-link', { y: 20, opacity: 0, duration: 0.3, stagger: -0.05, ease: "power2.in" });
                gsap.to(navMobile, { autoAlpha: 0, duration: 0.5, delay: 0.3, ease: "power2.in" });
                lenis.start();
            }
        });
        
        // Cerrar al clickear un enlace
        document.querySelectorAll('.nav-mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.click();
            });
        });
    }

    
    
                    // 3.8 Smooth Curtain Page Transition
    const transitionLinks = document.querySelectorAll('.nav-link, .nav-mobile-link, .footer-col a[href^="#"]');
    const curtain = document.querySelector('.transition-curtain');

    if (curtain && transitionLinks.length > 0) {
        transitionLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetId = link.getAttribute('href');
                if (!targetId || !targetId.startsWith('#')) return;
                
                const targetEl = document.querySelector(targetId);
                if (!targetEl) return;
                
                e.preventDefault(); 
                
                gsap.set(curtain, { visibility: 'visible', yPercent: 100 });
                
                const tl = gsap.timeline();
                
                // Solo movemos la cortina para evitar romper ScrollTrigger y Parallax
                tl.to(curtain, {
                    yPercent: 0,
                    duration: 0.6,
                    ease: "power3.inOut"
                })
                .call(() => {
                    history.pushState(null, null, targetId);
                    
                    const offset = targetEl.getBoundingClientRect().top + window.scrollY;
                    lenis.scrollTo(offset, { immediate: true });
                    window.scrollTo({ top: offset, behavior: "instant" });
                    
                    const navMobile = document.querySelector('.nav-mobile');
                    const navbar = document.querySelector('.navbar');
                    if (navbar && navbar.classList.contains('menu-open')) {
                        navbar.classList.remove('menu-open');
                        gsap.set('.nav-mobile-link', { y: 20, opacity: 0 });
                        gsap.set(navMobile, { autoAlpha: 0 });
                    }
                })
                .to(curtain, {
                    yPercent: -100,
                    duration: 0.6,
                    ease: "power3.inOut"
                }, "+=0.1")
                .set(curtain, { visibility: 'hidden', yPercent: 100 });
            });
        });
    }

    // 4. Parallax Images (Robust Custom Engine to survive curtain effect)
    const parallaxImages = gsap.utils.toArray('.parallax-img').map(container => {
        const img = container.querySelector('.parallax-target');
        if (img) {
            return {
                container,
                img,
                speed: parseFloat(container.dataset.speed || 0.5),
                yTo: gsap.quickTo(img, "yPercent", {duration: 0.8, ease: "power3.out"})
            };
        }
        return null;
    }).filter(item => item !== null);

    gsap.ticker.add(() => {
        const winH = window.innerHeight;
        parallaxImages.forEach(item => {
            const rect = item.container.getBoundingClientRect();
            // Check if container is in viewport
            if (rect.top <= winH && rect.bottom >= 0) {
                // Calculate progress from 0 (just entered bottom) to 1 (just left top)
                const totalScroll = winH + rect.height;
                const currentScroll = winH - rect.top;
                const progress = gsap.utils.clamp(0, 1, currentScroll / totalScroll);
                
                // Map progress (0 to 1) to yPercent (-10*speed to 10*speed)
                const yPercent = gsap.utils.mapRange(0, 1, -10 * item.speed, 10 * item.speed, progress);
                item.yTo(yPercent);
            }
        });
    });

    // 5. Reveal Up Animations (Textos y Cards)
    gsap.utils.toArray('.reveal-up').forEach(elem => {
        gsap.from(elem, {
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // 6. Accordion Logic (Servicios) - CSS Grid Approach (Osmo Style)
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            
            // Cerrar todos
            // Cerrar todos
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                otherItem.classList.remove('active');
            });
            
            // Abrir el clickeado si no estaba activo
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // Abrir el primero por defecto (opcional)
    // if(accordionHeaders.length > 0) {
    //     accordionHeaders[0].click();
    // }

    // 7. Slider Parallax Horizontal "Smooothy" (Pilares) - Estilo Editorial
    const pilaresTrack = document.querySelector('.pilares-track');
    const pilaresSlides = gsap.utils.toArray('.pilar-slide');
    const scrollArea = document.querySelector('.pilares-scroll-area');
    
    if (pilaresTrack && pilaresSlides.length > 0 && scrollArea) {
        // Obtenemos el ancho total a desplazar (Total Track - Área visible)
        // Usamos un pequeño Timeout o refresh de GSAP si las imágenes tardan en cargar,
        // pero con Lenis y ScrollTrigger usualmente se recalcula automático.
        
        // Hacemos un matchMedia para "all" o simplemente lo ponemos directo, pero usando mm.add("all") es buena práctica para asegurar limpieza.
        let mm = gsap.matchMedia();
        
        // Desktop: ScrollTrigger Pinning
        mm.add("(min-width: 992px)", () => {
            const totalWidth = pilaresTrack.offsetWidth - scrollArea.offsetWidth;
            
            // Tween de Scroll Horizontal
            let scrollTween = gsap.to(pilaresTrack, {
                x: -totalWidth,
                ease: "none",
                scrollTrigger: {
                    trigger: ".pilares-pin",
                    pin: true,
                    scrub: 1, // suavidad extra gracias a lenis + scrub
                    end: () => "+=" + totalWidth,
                    invalidateOnRefresh: true
                }
            });

            // Parallax interno para las imágenes de cada slide
            pilaresSlides.forEach((slide) => {
                const img = slide.querySelector('.parallax-target-horizontal');
                if(img) {
                    gsap.fromTo(img, 
                        { xPercent: -15 }, 
                        { 
                            xPercent: 15,
                            ease: "none",
                            scrollTrigger: {
                                trigger: slide,
                                containerAnimation: scrollTween,
                                start: "left right",
                                end: "right left",
                                scrub: true
                            }
                        }
                    );
                }
            });
        });

        // Mobile: Swiper.js Infinite Swipe
        mm.add("(max-width: 991px)", () => {
            // Aseguramos que el track no tenga transformación X de GSAP si venimos de desktop
            gsap.set(pilaresTrack, { clearProps: "all" });
            
            if (typeof Swiper !== 'undefined') {
                const swiper = new Swiper('.pilares-swiper', {
                    loop: true,
                    slidesPerView: "auto",
                    centeredSlides: true,
                    grabCursor: true,
                    speed: 600, // Transición suave
                    spaceBetween: 20, // Agregado espaciado equivalente a 4vw
                });
                
                // Cleanup al cambiar de pantalla
                return () => {
                    swiper.destroy(true, true);
                };
            }
        });
    }

    // 7.5 Curtain Parallax Effect (Robust Custom Engine)
    const curtainSections = [
        { section: ".hero", next: ".intro" },
        { section: ".intro", next: ".pilares-pin" },
        { section: ".pilares-pin", next: ".servicios" },
        { section: ".servicios", next: ".fundadora" },
        { section: ".fundadora", next: ".reserva" },
        { section: ".reserva", next: ".footer" }
    ];

    const curtains = curtainSections.map(item => {
        const sectionEl = document.querySelector(item.section);
        const nextEl = document.querySelector(item.next);
        if (sectionEl && nextEl) {
            return {
                sectionEl,
                nextEl,
                yTo: gsap.quickTo(sectionEl, "yPercent", {duration: 0.8, ease: "power3.out"})
            }
        }
        return null;
    }).filter(item => item !== null);

    // Este motor reemplaza a ScrollTrigger para el parallax de secciones.
    // Al calcular dinámicamente en cada frame, es 100% inmune a los cambios 
    // de altura del acordeón y evita por completo los saltos.
    gsap.ticker.add(() => {
        const winH = window.innerHeight;
        curtains.forEach(item => {
            const rect = item.nextEl.getBoundingClientRect();
            // Si la parte superior de la siguiente sección está dentro de la pantalla
            if (rect.top <= winH && rect.top >= -winH) {
                const progress = gsap.utils.clamp(0, 1, 1 - (rect.top / winH));
                item.yTo(30 * progress);
            } else if (rect.top > winH) {
                item.yTo(0);
            } else if (rect.top < -winH) {
                item.yTo(30);
            }
        });
    });

    // 8. Footer Parallax "Reveal" Effect
    const footer = document.querySelector('.footer');
    const footerContent = document.querySelector('.footer .container');
    
    if (footer && footerContent) {
        gsap.fromTo(footerContent, 
            { yPercent: -40 }, // Empieza desplazado hacia arriba
            {
                yPercent: 0,   // Termina en su posición original
                ease: "none",
                scrollTrigger: {
                    trigger: footer,
                    start: "top bottom", // Cuando el top del footer toca el bottom de la pantalla
                    end: "bottom bottom", // Cuando el footer está completamente visible
                    scrub: true
                }
            }
        );
    }

});






