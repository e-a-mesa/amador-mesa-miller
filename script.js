// 1. STICKY NAVBAR LOGIC
const navbar = document.getElementById("navbar");
const sticky = navbar.offsetTop; // Calculates where the navbar sits on the page

window.onscroll = function() {
    if (window.pageYOffset >= sticky) {
        navbar.classList.add("sticky");
        // Add padding to body so the page doesn't "jump" when nav becomes fixed
        document.body.classList.add("sticky-padding"); 
    } else {
        navbar.classList.remove("sticky");
        document.body.classList.remove("sticky-padding");
    }
};

// 2. SMOOTH SCROLLING
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
