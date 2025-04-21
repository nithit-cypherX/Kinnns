document.addEventListener("DOMContentLoaded", function () {
  const sidebar = document.getElementById("sidebar");
  const sidebarToggles = document.querySelectorAll(".sidebarToggle");

  // Loop through all toggle buttons
  sidebarToggles.forEach((toggle) => {
    toggle.addEventListener("click", function (event) {
      event.stopPropagation(); // Prevent closing when clicking toggle
      sidebar.classList.toggle("hidden");
    });
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnToggle = [...sidebarToggles].some((toggle) =>
      toggle.contains(event.target)
    );

    if (!isClickInsideSidebar && !isClickOnToggle) {
      sidebar.classList.add("hidden");
    }
  });
});
