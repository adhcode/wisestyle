// Debug script to test authentication
// Run this in the browser console to debug auth issues

console.log('=== Authentication Debug Info ===');

// Check localStorage
const token = localStorage.getItem('token');
console.log('Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'None');

// Check API URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : 'https://wisestyle-api-production.up.railway.app');
console.log('API URL:', apiUrl);

// Test /me endpoint
if (token) {
    fetch(`${apiUrl}/api/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    .then(response => {
        console.log('Auth check response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Auth check response data:', data);
    })
    .catch(error => {
        console.error('Auth check error:', error);
    });
} else {
    console.log('No token found, cannot test /me endpoint');
}

// Check current user from context (if available)
if (window.React && window.React.useContext) {
    console.log('React context available - check AuthContext in React DevTools');
}