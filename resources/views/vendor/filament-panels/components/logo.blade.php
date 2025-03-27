<div class="flex items-center justify-center">
    <img class="" id="logo" style="margin-right: 5px;" src="{{ asset('assets/NewLlogo.png') }}" width="200" height="200"
        alt="Admin Panel" />
    {{-- <span class="font-bold text-[#4f0205]">Bamboo Retreat</span> --}}
</div>


<script>
    // Function to update the logo based on the theme
    function updateLogo() {
        const logo = document.getElementById('logo');
        const currentTheme = localStorage.getItem('theme') || 'system';

        if (currentTheme === 'dark') {
            logo.src = "{{ asset('assets/NewDlogo.png') }}";
        } else if (currentTheme === 'light') {
            logo.src = "{{ asset('assets/NewLlogo.png') }}";
        } else if (currentTheme === 'system') {
            // Detect system theme preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                logo.src = "{{ asset('assets/NewDlogo.png') }}";
            } else {
                logo.src = "{{ asset('assets/NewLlogo.png') }}";
            }
        }
    }

    // Listen for changes to the theme
    document.addEventListener('DOMContentLoaded', (event) => {
        updateLogo(); // Set the initial logo based on the current theme

        // Example of listening to a theme change event if your application supports it
        document.addEventListener('themeChange', (event) => {
            updateLogo();
        });

        // Optionally, observe changes to the <html> tag's class if the theme is managed via classes
        const observer = new MutationObserver(() => {
            updateLogo();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });
    });
</script>
