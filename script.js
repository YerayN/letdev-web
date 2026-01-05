document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. GESTIÓN DE IDENTIDAD (La parte nueva)
    // ==========================================
    
    // Función para obtener o crear el ID de sesión
    const gestionarSesion = () => {
        // Miramos si ya tenemos un ID guardado en la "memoria de la pestaña"
        let idSesion = sessionStorage.getItem('usuario_session_id');

        if (!idSesion) {
            // Si no existe, creamos uno nuevo (UUID seguro)
            idSesion = crypto.randomUUID();
            // Lo guardamos para que no se pierda si recarga la página
            sessionStorage.setItem('usuario_session_id', idSesion);
            console.log('✨ Nueva sesión iniciada:', idSesion);
        } else {
            console.log('🔄 Sesión recuperada:', idSesion);
        }
        
        return idSesion;
    };

    // Ejecutamos la función nada más cargar
    const miIdDeSesion = gestionarSesion();

    // NOTA PARA YERAY: 
    // Ahora la variable 'miIdDeSesion' tiene el código único. 
    // Cuando hagas la parte de enviar el formulario, tendrás que incluir esta variable.


    // ==========================================
    // 2. MENÚ MÓVIL (Hamburguesa)
    // ==========================================
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        // Abrir/Cerrar menú
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }


    // ==========================================
    // 3. SCROLL SUAVE (Navegación)
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Caso A: Click en el logo o enlace vacío (ir arriba del todo)
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return;
            }

            // Caso B: Click en una sección específica (ej: #servicios)
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});