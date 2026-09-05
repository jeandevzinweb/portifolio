window.addEventListener('DOMContentLoaded', () => {
    const coursesList = document.getElementById('courses-list');
    const projectsList = document.getElementById('projects-list');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.getElementById('header');
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileNavigation = document.querySelector('.mobile-navigation');
    let headerFrame = null;

    function updateHeaderState() {
        headerFrame = null;
        header?.classList.toggle('scrolled', window.scrollY > 10);
    }

    window.addEventListener('scroll', () => {
        if (!headerFrame) headerFrame = requestAnimationFrame(updateHeaderState);
    }, { passive: true });
    updateHeaderState();

    function closeMobileMenu() {
        if (!menuToggle || !mobileNavigation) return;
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNavigation.classList.remove('is-open');
        mobileNavigation.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('menu-is-open');
    }

    menuToggle?.addEventListener('click', () => {
        const isOpen = !menuToggle.classList.contains('is-open');
        menuToggle.classList.toggle('is-open', isOpen);
        menuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileNavigation?.classList.toggle('is-open', isOpen);
        mobileNavigation?.setAttribute('aria-hidden', String(!isOpen));
        document.body.classList.toggle('menu-is-open', isOpen);
    });
    mobileNavigation?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) closeMobileMenu();
    });

    if (coursesList && portfolioData.courses) {
        coursesList.innerHTML = portfolioData.courses.map(course => `
            <tr>
                <td>${course.name}</td>
                <td>${course.institution}</td>
                <td>${course.year}</td>
            </tr>
        `).join('');
    }

    const academicTrack = document.getElementById('academic-marquee-track');
    if (academicTrack && portfolioData.courses) {
        const courseItems = portfolioData.courses.map(course => `
            <span>${course.name}</span><b>${course.institution}</b><em>${course.year}</em><i aria-hidden="true">✦</i>
        `).join('');
        academicTrack.innerHTML = courseItems + courseItems;
    }

    const projects = portfolioData.projects || [];
    const projectsCarousel = document.querySelector('.projects-carousel');
    const carouselIndicators = document.querySelector('.carousel-indicators');
    const previousProject = document.querySelector('.carousel-prev');
    const nextProject = document.querySelector('.carousel-next');
    let activeProject = 0;
    let autoplayTimer;
    let dragStartX = 0;
    let dragDistance = 0;
    let isDragging = false;

    if (projectsList && projects.length && projectsCarousel && carouselIndicators) {
        if (projects.length < 2) {
            previousProject.hidden = true;
            nextProject.hidden = true;
        }

        projectsList.innerHTML = [-1, 0, 1].map((offset, slot) => `
            <article class="project-card" data-slot="${slot}" aria-hidden="true"></article>
        `).join('');

        carouselIndicators.innerHTML = projects.map((project, index) => `
            <button class="carousel-indicator" type="button" role="tab" aria-label="Mostrar ${project.title}" aria-selected="false" data-project-index="${index}"></button>
        `).join('');

        const cards = [...projectsList.querySelectorAll('.project-card')];
        const indicators = [...carouselIndicators.querySelectorAll('.carousel-indicator')];

        function projectMarkup(project) {
            return `
                <header>
                    <h3 class="project-title">${project.title}</h3>
                </header>
                <img src="${project.image}" alt="${project.title}" class="project-image" />
                <p class="project-description">${project.description}</p>
            `;
        }

        function updateCarousel(nextIndex, shouldRestart = true) {
            activeProject = (nextIndex + projects.length) % projects.length;
            cards.forEach(card => { card.style.transform = ''; });

            cards.forEach((card, slot) => {
                const offset = slot - 1;
                const projectIndex = (activeProject + offset + projects.length) % projects.length;
                card.innerHTML = projectMarkup(projects[projectIndex]);
                card.dataset.projectIndex = projectIndex;
                card.classList.toggle('is-active', offset === 0);
                card.classList.toggle('is-previous', offset === -1);
                card.classList.toggle('is-next', offset === 1);
                card.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
            });

            indicators.forEach((indicator, index) => {
                const isActive = index === activeProject;
                indicator.classList.toggle('is-active', isActive);
                indicator.setAttribute('aria-selected', String(isActive));
            });

            if (shouldRestart) startAutoplay();
        }

        function startAutoplay() {
            clearInterval(autoplayTimer);
            if (projects.length < 2 || document.hidden || reduceMotion) return;
            autoplayTimer = setInterval(() => updateCarousel(activeProject + 1, false), 5000);
        }

        function stopAutoplay() {
            clearInterval(autoplayTimer);
        }

        indicators.forEach(indicator => indicator.addEventListener('click', () => updateCarousel(Number(indicator.dataset.projectIndex))));
        previousProject.addEventListener('click', () => updateCarousel(activeProject - 1));
        nextProject.addEventListener('click', () => updateCarousel(activeProject + 1));

        projectsCarousel.addEventListener('keydown', event => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                updateCarousel(activeProject - 1);
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                updateCarousel(activeProject + 1);
            }
        });

        projectsCarousel.addEventListener('mouseenter', stopAutoplay);
        projectsCarousel.addEventListener('mouseleave', startAutoplay);
        projectsCarousel.addEventListener('focusin', stopAutoplay);
        projectsCarousel.addEventListener('focusout', event => {
            if (!projectsCarousel.contains(event.relatedTarget)) startAutoplay();
        });
        document.addEventListener('pointerdown', event => {
            if (!projectsCarousel.contains(event.target) || event.target.closest('.carousel-indicator')) return;
            if (event.pointerType === 'mouse' && event.button !== 0) return;
            dragStartX = event.clientX;
            dragDistance = 0;
            isDragging = true;
            projectsCarousel.classList.add('is-dragging');
            stopAutoplay();
        });
        document.addEventListener('pointermove', event => {
            if (!isDragging) return;
            dragDistance = event.clientX - dragStartX;
            const activeCard = projectsList.querySelector('.project-card.is-active');
            if (Math.abs(dragDistance) > 4) event.preventDefault();
            if (activeCard) {
                const rotation = dragDistance * -0.035;
                const scale = 1 - Math.min(Math.abs(dragDistance) / 2200, 0.04);
                activeCard.style.transform = `translate(calc(-50% + ${dragDistance}px), -50%) rotateY(${rotation}deg) scale(${scale})`;
            }
        }, { passive: false });
        function finishDrag(event) {
            if (!isDragging) return;
            isDragging = false;
            projectsCarousel.classList.remove('is-dragging');
            if (projectsCarousel.hasPointerCapture(event.pointerId)) projectsCarousel.releasePointerCapture(event.pointerId);
            if (Math.abs(dragDistance) > 45) updateCarousel(activeProject + (dragDistance < 0 ? 1 : -1));
            else {
                const activeCard = projectsList.querySelector('.project-card.is-active');
                if (activeCard) activeCard.style.transform = '';
                startAutoplay();
            }
            dragDistance = 0;
        }
        document.addEventListener('pointerup', finishDrag);
        document.addEventListener('pointercancel', finishDrag);
        document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : startAutoplay());

        updateCarousel(0, false);
        startAutoplay();
    }

    const sections = document.querySelectorAll('.section');
    const footer = document.querySelector('footer');
    const backToTop = document.querySelector(".back-to-top");
    const progressBar = document.querySelector(".progress-bar");
    const totalLength = 138.23; 

    const parallaxItems = document.querySelectorAll('[data-parallax]');
    let parallaxFrame = null;

    document.querySelectorAll('a[href="#contact"]').forEach(link => {
        link.addEventListener('click', event => {
            if (!footer) return;

            event.preventDefault();
            const targetPosition = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            window.scrollTo({
                top: targetPosition,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
            history.pushState(null, '', '#contact');
        });
    });

    if (footer) {
        const footerObserver = new IntersectionObserver(([entry]) => {
            footer.classList.toggle('is-visible', entry.isIntersecting);
        }, { threshold: 0.16 });
        footerObserver.observe(footer);
    }

    document.querySelectorAll('.cinematic-section').forEach(section => {
        const sectionObserver = new IntersectionObserver(([entry]) => {
            section.classList.toggle('is-visible', entry.isIntersecting);
        }, { threshold: 0.18 });
        sectionObserver.observe(section);
    });

    function updateFooterParallax() {
        parallaxFrame = null;
        if (reduceMotion || !parallaxItems.length) return;

        const viewportCenter = window.innerHeight / 2;
        parallaxItems.forEach(item => {
            const distance = item.getBoundingClientRect().top - viewportCenter;
            const amount = Number(item.dataset.parallax) || 0;
            item.style.transform = `translate3d(-50%, ${distance * amount}px, 0)`;
        });
    }

    if (!reduceMotion) {
        window.addEventListener('scroll', () => {
            if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateFooterParallax);
        }, { passive: true });
        updateFooterParallax();
    }

    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        document.querySelectorAll('.magnetic').forEach(element => {
            element.addEventListener('pointermove', event => {
                const bounds = element.getBoundingClientRect();
                const x = (event.clientX - bounds.left - bounds.width / 2) * 0.12;
                const y = (event.clientY - bounds.top - bounds.height / 2) * 0.12;
                element.style.transform = `translate(${x}px, ${y}px) rotateX(${-y * 0.12}deg) rotateY(${x * 0.12}deg) scale(1.03)`;
            });
            element.addEventListener('pointerleave', () => {
                element.style.transform = '';
            });
        });
    }
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                entry.target.classList.remove('hide');
            } else {
                entry.target.classList.remove('show');
                entry.target.classList.add('hide');
            }
        });
    }, { threshold: 0.2 });
    
    sections.forEach(section => sectionObserver.observe(section));

    function updateScrollProgress() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
        
        if (progressBar) {
            const offset = totalLength - (progress * totalLength);
            progressBar.style.strokeDashoffset = offset;
        }

        if (backToTop) {
            if (scrollTop > 100) {
                backToTop.classList.add('show');
            } else {
                backToTop.classList.remove('show');
            }
        }
    }

    window.addEventListener('scroll', updateScrollProgress);
    updateScrollProgress(); 

});
