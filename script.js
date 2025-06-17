window.addEventListener('DOMContentLoaded', () => {
    console.log("DOM totalmente carregado!");
    const sections = document.querySelectorAll('.section');
    const footer = document.querySelector('footer');
    const backToTop = document.querySelector(".back-to-top");
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
    const footerObserver = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }, { threshold: 0.1 });

    footerObserver.observe(footer);
});
