import axios from "axios";
window.axios = axios;

window.axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";

// Add CSRF token support
const token = (
    document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
)?.content;
if (token) {
    window.axios.defaults.headers.common["X-CSRF-TOKEN"] = token;
} else {
    console.error(
        "CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token"
    );
}
