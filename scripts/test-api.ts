async function testApi() {
    const term = 'стол';
    console.log(`Fetching products for term: ${term}...`);
    try {
        const response = await fetch(`http://localhost:3000/api/products?search=${term}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Found ${data.length} products:`);
        data.forEach((p: any) => console.log(`- ${p.name}`));
    } catch (error) {
        console.error('Error fetching API:', error);
    }
}

testApi();
