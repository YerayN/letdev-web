document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Smooth Scrolling (FIXED)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // 1. Maneja el enlace del logo (href="#") para ir al inicio de la página.
            if (href === '#') {
                e.preventDefault(); // Evita el salto brusco
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                return; // Detiene la ejecución aquí
            }

            // 2. Maneja el resto de enlaces a secciones (e.g., #servicios)
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});