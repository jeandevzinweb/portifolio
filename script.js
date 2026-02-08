window.addEventListener('DOMContentLoaded', () => {
    const coursesList = document.getElementById('courses-list');
    const projectsList = document.getElementById('projects-list');

    if (coursesList && portfolioData.courses) {
        coursesList.innerHTML = portfolioData.courses.map(course => `
            <tr>
                <td>${course.name}</td>
                <td>${course.institution}</td>
                <td>${course.year}</td>
            </tr>
        `).join('');
    }

    if (projectsList && portfolioData.projects) {
        projectsList.innerHTML = portfolioData.projects.map(project => `
            <article class="project-card">
                <header>
                    <h3 class="project-title"><i class="${project.icon}"></i> ${project.title}</h3>
                </header>
                <img src="${project.image}" alt="${project.title}" class="project-image" />
                <p class="project-description">${project.description}</p>
            </article>
        `).join('');
    }

    const sections = document.querySelectorAll('.section');
    const footer = document.querySelector('footer');
    const backToTop = document.querySelector(".back-to-top");
    const progressBar = document.querySelector(".progress-bar");
    const totalLength = 138.23; 
    
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

    const viewCounterEl = document.getElementById('view-counter');
    const avgRatingEl = document.getElementById('avg-rating');

    if (!localStorage.getItem('portfolio_views')) localStorage.setItem('portfolio_views', '0');
    if (!localStorage.getItem('portfolio_ratings')) localStorage.setItem('portfolio_ratings', JSON.stringify([]));

    let views = parseInt(localStorage.getItem('portfolio_views')) + 1;
    localStorage.setItem('portfolio_views', views);
    viewCounterEl.innerHTML = `<i class="fa-solid fa-eye"></i> ${views}`;

    function updateRatingDisplay() {
        const ratings = JSON.parse(localStorage.getItem('portfolio_ratings'));
        if (ratings.length > 0) {
            const avg = (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
            avgRatingEl.innerHTML = `<i class="fa-solid fa-star"></i> ${avg}`;
            avgRatingEl.style.display = 'inline-block';
        } else {
            avgRatingEl.style.display = 'none';
        }
    }
    updateRatingDisplay();

    const modal = document.getElementById('ux-modal');
    const stars = document.querySelectorAll('.star-rating i');
    const submitBtn = document.getElementById('submit-rating');
    const toast = document.getElementById('toast');
    let selectedRating = 0;

    if (!localStorage.getItem('portfolio_rated')) {
        setTimeout(() => {
            modal.classList.add('show');
        }, 60000); 
    }

    function updateStars(rating) {
        stars.forEach(s => {
            const val = parseInt(s.getAttribute('data-value'));
            if (val <= rating) {
                s.classList.replace('fa-regular', 'fa-solid');
                s.classList.add('active');
            } else {
                s.classList.replace('fa-solid', 'fa-regular');
                s.classList.remove('active');
            }
        });
    }

    stars.forEach(star => {
        star.addEventListener('mouseover', () => {
            const hoverVal = parseInt(star.getAttribute('data-value'));
            updateStars(hoverVal);
        });

        star.addEventListener('click', () => {
            selectedRating = parseInt(star.getAttribute('data-value'));
            updateStars(selectedRating);
        });
    });

    document.querySelector('.star-rating').addEventListener('mouseleave', () => {
        updateStars(selectedRating);
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    submitBtn.addEventListener('click', () => {
        if (selectedRating > 0) {
            const ratings = JSON.parse(localStorage.getItem('portfolio_ratings'));
            ratings.push(selectedRating);
            localStorage.setItem('portfolio_ratings', JSON.stringify(ratings));
            localStorage.setItem('portfolio_rated', 'true');
            
            updateRatingDisplay();
            modal.classList.remove('show');
            showToast();
        } else {
            submitBtn.style.animation = 'shake 0.5s';
            setTimeout(() => submitBtn.style.animation = '', 500);
        }
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});
