// Header responsive
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');

if (menuBtn && menu) {
    menuBtn.setAttribute('aria-expanded', 'false');

    menuBtn.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('open');
        menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    // Cerrar menú al hacer click fuera (en móvil)
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!menu.contains(target) && !menuBtn.contains(target) && menu.classList.contains('open')) {
            menu.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
        }
    });
}


//seacrch bar
