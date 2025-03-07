// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Scroll progress indicator
  const scrollProgressBar = document.querySelector(".scroll-progress-bar");

  // Update scroll progress
  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const scrollHeight =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    scrollProgressBar.style.width = `${scrollPercent}%`;
  }

  // Initial call to set scroll position
  updateScrollProgress();

  // Listen for scroll events to update progress bar
  window.addEventListener("scroll", updateScrollProgress);

  // Back to top button functionality
  document.addEventListener("DOMContentLoaded", () => {
    const backToTopButton = document.getElementById("back-to-top");

    if (backToTopButton) {
      backToTopButton.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      });
    } else {
      console.error('Element with id "back-to-top" not found.');
    }
  });

  // TOC smooth scrolling
  const tocLinks = document.querySelectorAll(".toc-item");

  tocLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Get the target section
      const targetId = link.getAttribute("href");
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        // Calculate scroll position (with offset for header)
        const headerOffset = 80;
        const elementPosition = targetSection.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        // Smooth scroll to the section
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });

        // Update URL hash without jumping
        history.pushState(null, null, targetId);

        // Add active state to the clicked TOC item
        tocLinks.forEach((toc) => toc.classList.remove("active"));
        link.classList.add("active");
      }
    });
  });

  // Highlight active TOC item while scrolling
  const sections = document.querySelectorAll("section[id]");

  function highlightTOCOnScroll() {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        // Find the corresponding TOC item and activate it
        tocLinks.forEach((link) => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }

  // Listen for scroll events to highlight active TOC item
  window.addEventListener("scroll", highlightTOCOnScroll);

  // Initial call to highlight active TOC item based on current position
  highlightTOCOnScroll();

  // Add animation to stat numbers using Intersection Observer
  const statNumbers = document.querySelectorAll(".stat-number");

  // Only run the animation if IntersectionObserver is supported
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start counting animation when the stat number comes into view
            const statElement = entry.target;
            const originalText = statElement.textContent;
            // Grab the numeric portion
            const finalValue = parseInt(originalText.replace(/[^\d]/g, ""), 10);

            // Check if the original text had special formatting
            const hasPercent = originalText.includes("%");
            const hasT = originalText.includes("T");

            // Animation parameters
            const duration = 1500; // total duration (ms)
            const interval = 16; // ~60 FPS
            const totalFrames = Math.round(duration / interval);

            let frame = 0;
            const timer = setInterval(() => {
              frame++;

              // Linear interpolation from 0 to finalValue
              let currentValue = Math.round((finalValue * frame) / totalFrames);

              // On the last frame, make sure to snap to finalValue
              if (frame >= totalFrames) {
                currentValue = finalValue;
                clearInterval(timer);
              }

              // Apply the format
              if (hasPercent) {
                statElement.textContent = `${currentValue}%`;
              } else if (hasT) {
                statElement.textContent = `$${currentValue}T`;
              } else {
                statElement.textContent = currentValue;
              }
            }, interval);

            // Unobserve the element after animating it
            observer.unobserve(statElement);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    // Observe all stat numbers
    statNumbers.forEach((stat) => {
      observer.observe(stat);
    });
  }

  // Add hover effects to breakthrough cards
  const breakthroughCards = document.querySelectorAll(".breakthrough-card");

  breakthroughCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      breakthroughCards.forEach((c) => {
        if (c !== card) {
          c.style.opacity = "0.6";
        }
      });
    });

    card.addEventListener("mouseleave", () => {
      breakthroughCards.forEach((c) => {
        c.style.opacity = "1";
      });
    });
  });
});
