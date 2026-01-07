document.addEventListener('DOMContentLoaded', () => {
    // elementos do DOM
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const projectCountElement = document.getElementById('project-count');
    const indicator = document.querySelector('.filter-nav__indicator');

    // estado atual do filtro
    let currentFilter = 'all';
    let pressedButton = null;
    let isStretching = false;
    let currentActiveButton = null;

    /**
     * atualiza o contador de projetos visíveis com animação
     * @param {number} count
     */
    function updateCounter(count) {
        projectCountElement.classList.add('pulse');
        projectCountElement.textContent = count;

        setTimeout(() => {
            projectCountElement.classList.remove('pulse');
        }, 300);
    }

    /**
     * filtra os projetos baseado na categoria selecionada
     * @param {string} category
     */
    function filterProjects(category) {
        if (category === currentFilter) return;

        currentFilter = category;
        let visibleCount = 0;
        let delay = 0;

        projectCards.forEach((card, index) => {
            const cardCategory = card.getAttribute('data-category');
            const shouldShow = category === 'all' || cardCategory === category;

            card.classList.remove('animating', 'visible', 'hidden');

            if (shouldShow) {
                card.classList.add('visible');
                card.style.animationDelay = `${delay * 0.08}s`;

                requestAnimationFrame(() => {
                    card.classList.add('animating');
                });

                visibleCount++;
                delay++;
            } else {
                card.classList.add('hidden');
            }
        });

        updateCounter(visibleCount);
    }

    /**
     * atualiza a posição do indicador deslizante
     * @param {HTMLElement} button - Botão ativo
     */
    function updateIndicator(button) {
        const buttonRect = button.getBoundingClientRect();
        const navRect = button.parentElement.getBoundingClientRect();
        
        const left = buttonRect.left - navRect.left;
        const width = buttonRect.width;
        
        indicator.style.width = `${width}px`;
        indicator.style.transform = `translateX(${left}px)`;
    }

    /**
     * cria efeito de esticamento chiclete ao pressionar
     * @param {HTMLElement} targetButton - Botão alvo
     */
    function stretchIndicatorTo(targetButton) {
        if (!currentActiveButton || targetButton === currentActiveButton) return;

        const activeRect = currentActiveButton.getBoundingClientRect();
        const targetRect = targetButton.getBoundingClientRect();
        const navRect = currentActiveButton.parentElement.getBoundingClientRect();

        const activeLeft = activeRect.left - navRect.left;
        const targetLeft = targetRect.left - navRect.left;

        // calcula o início e fim do esticamento
        const stretchStart = Math.min(activeLeft, targetLeft);
        const stretchEnd = Math.max(activeLeft + activeRect.width, targetLeft + targetRect.width);
        const stretchWidth = stretchEnd - stretchStart;

        indicator.classList.add('stretching');
        indicator.style.width = `${stretchWidth}px`;
        indicator.style.transform = `translateX(${stretchStart}px)`;
    }

    /**
     * define o botao ativo e remove dos outros
     * @param {HTMLElement} activeButton - Botão que deve ficar ativo
     */
    function setActiveButton(activeButton) {
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        activeButton.classList.add('active');
        activeButton.setAttribute('aria-pressed', 'true');
        currentActiveButton = activeButton;
        
        // remove classe de esticamento e atualiza com animação spring
        indicator.classList.remove('stretching');
        updateIndicator(activeButton);
    }
    filterButtons.forEach(button => {
        // efeito elastíco ao pressionar
        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            pressedButton = button;
            isStretching = true;
            
            if (button !== currentActiveButton) {
                stretchIndicatorTo(button);
            }
        });

        // completa a transição ao soltar
        button.addEventListener('pointerup', (event) => {
            if (isStretching && pressedButton === button) {
                const filter = button.getAttribute('data-filter');
                setActiveButton(button);
                filterProjects(filter);
            }
            
            pressedButton = null;
            isStretching = false;
        });

        // cancela e volta ao estado original
        button.addEventListener('pointercancel', () => {
            if (isStretching && currentActiveButton) {
                indicator.classList.remove('stretching');
                updateIndicator(currentActiveButton);
            }
            pressedButton = null;
            isStretching = false;
        });

        // cancela se sair do botão enquanto pressiona
        button.addEventListener('pointerleave', () => {
            if (isStretching && pressedButton === button && currentActiveButton) {
                indicator.classList.remove('stretching');
                updateIndicator(currentActiveButton);
                pressedButton = null;
                isStretching = false;
            }
        });

        // suporte para navegação por teclado
        button.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                const filter = button.getAttribute('data-filter');
                setActiveButton(button);
                filterProjects(filter);
            }
        });
    });

    // inicializa todos os cards como visíveis
    projectCards.forEach((card, index) => {
        card.classList.add('visible');
        card.style.animationDelay = `${index * 0.08}s`;
        card.classList.add('animating');
    });

    // inicializa a posição do indicador
    const activeButton = document.querySelector('.filter-btn.active');
    if (activeButton) {
        currentActiveButton = activeButton;
        updateIndicator(activeButton);
    }

    console.log('🚀 Portfolio Filter initialized');
    console.log(`📦 Total projects: ${projectCards.length}`);

    // cursor glow effect
    const cursorGlow = document.querySelector('.cursor-glow');
    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    // atualiza a posição do mouse
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorGlow.classList.add('active');
    });

    // remove o brilho quando o mouse sai da página
    document.addEventListener('mouseleave', () => {
        cursorGlow.classList.remove('active');
    });

    // animação suave do brilho seguindo o cursor
    function animateGlow() {
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;

        cursorGlow.style.left = `${glowX}px`;
        cursorGlow.style.top = `${glowY}px`;

        requestAnimationFrame(animateGlow);
    }

    animateGlow();
});