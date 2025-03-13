async function fetchProducts() {
    const url = "https://desafio.xlow.com.br/search";
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        return [];
    }
}

async function fetchProductDetails(productId) {
    const url = `https://desafio.xlow.com.br/search/${productId}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error(`Erro ao carregar detalhes do produto ${productId}:`, error);
        return null;
    }
}

async function loadProductImages() {
    const products = await fetchProducts();
    const detailedProducts = [];

    for (const product of products) {
        const productDetails = await fetchProductDetails(product.productId);

        if (productDetails?.items?.length > 0) {
            const mainImage = productDetails.items[0].images[0]?.imageUrl || "";
            const variations = productDetails.items[0].images.map(img => img.imageUrl);

            detailedProducts.push({
                productId: product.productId,
                name: productDetails.productName,
                price: productDetails.items[0].sellers[0]?.commertialOffer?.Price.toFixed(2) || "Indisponível",
                image: mainImage,
                variations: variations
            });
        }
    }

    return detailedProducts;
}

function updateProductCounter(count) {
    const counter = document.getElementById("product-counter");
    counter.textContent = `Produtos carregados: ${count}`;
}

function createProductCard(product) {
    const productCard = document.createElement("div");
    productCard.classList.add("product");

    productCard.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="main-image">
        <h2>${product.name}</h2>
        <p class="price">R$ ${product.price}</p>
        <div class="variations">
            ${product.variations.map(variationImage => `<img src="${variationImage}" class="variation-image">`).join('')}
        </div>
        <button class="buy-button">Comprar</button>
    `;

    productCard.querySelectorAll(".variation-image").forEach(variationImage => {
        variationImage.addEventListener("click", (event) => {
            productCard.querySelector(".main-image").src = event.target.src;
        });
    });

    return productCard;
}

function renderProducts(products) {
    const showcase = document.getElementById("showcase");
    showcase.innerHTML = "";
    products.forEach(product => showcase.appendChild(createProductCard(product)));
}

function toggleLayout(showcase) {
    showcase.classList.toggle("list");
}

document.addEventListener("DOMContentLoaded", async () => {
    const toggleLayoutButton = document.getElementById("toggle-layout");
    const showcase = document.getElementById("showcase");

    function updateGridColumns() {
        const screenWidth = window.innerWidth;
        
        if (screenWidth <= 768) {
            showcase.style.gridTemplateColumns = showcase.style.gridTemplateColumns === "repeat(2, 1fr)" ? "repeat(1, 1fr)" : "repeat(2, 1fr)";
        } else {
            showcase.style.gridTemplateColumns = showcase.style.gridTemplateColumns === "repeat(5, 1fr)" ? "repeat(4, 1fr)" : "repeat(5, 1fr)";
        }
    }

    toggleLayoutButton.addEventListener("click", updateGridColumns);

    window.addEventListener("resize", () => {
        if (window.innerWidth <= 768) {
            showcase.style.gridTemplateColumns = "repeat(1, 1fr)";
        } else {
            showcase.style.gridTemplateColumns = "repeat(4, 1fr)";
        }
    });

    if (window.innerWidth <= 768) {
        showcase.style.gridTemplateColumns = "repeat(1, 1fr)";
    } else {
        showcase.style.gridTemplateColumns = "repeat(4, 1fr)";
    }

    const products = await loadProductImages();
    
    if (products.length > 0) {
        updateProductCounter(products.length);
        renderProducts(products);
    } else {
        console.warn("Nenhum produto foi carregado.");
    }
});

