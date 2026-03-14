const test = async () => {
    try {
        const res = await fetch('http://localhost:8080/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test', email: `test_${Date.now()}@example.com`, password: 'password123' })
        });
        console.log("Status:", res.status);
        console.log("Body:", await res.text());
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
};

test();
