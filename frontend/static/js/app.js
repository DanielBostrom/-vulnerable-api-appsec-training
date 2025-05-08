// ------------------------------------------------------------------
// A realistic e-commerce platform demonstrating security vulnerabilities
// ------------------------------------------------------------------

// Global variables for authentication and state
let authToken = null;  // Stores JWT token (INSECURE: Saved in JavaScript memory)
let currentUser = null;  // Stores the user's name
let currentSection = 'homePage';  // Tracks the currently active section

// ------------------------------------------------------------------
// Page Navigation Functions
// ------------------------------------------------------------------
/**
 * Show a specific page section and hide others
 * @param {string} sectionId - ID of the section to display
 */
function showSection(sectionId) {
    console.log("Showing section:", sectionId);
    
    // Hide all page sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.add('d-none');
    });
    
    // Show the requested section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.remove('d-none');
        currentSection = sectionId;
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Map section IDs to nav IDs
        const navMapping = {
            'homePage': 'navHome',
            'loginPage': '',
            'passwordResetPage': '',
            'productsPage': 'navProducts',
            'adminPage': 'navAdmin',
            'helpPage': 'navHelp',
            'accountPage': 'navAccount'
        };
        
        const navId = navMapping[sectionId];
        if (navId) {
            const navElement = document.getElementById(navId);
            if (navElement) {
                navElement.classList.add('active');
            }
        }
    } else {
        console.error("Section not found:", sectionId);
    }
}

// Ensure DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Navigation menu links - Adding event listeners with error handling
    function setupNavLink(id, sectionId) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', function(e) {
                e.preventDefault();
                console.log("Clicked on nav link:", id);
                showSection(sectionId);
            });
        } else {
            console.warn(`Element with ID ${id} not found`);
        }
    }
    
    // Setup all navigation links
    setupNavLink('navHome', 'homePage');
    setupNavLink('navProducts', 'productsPage');
    setupNavLink('navAdmin', 'adminPage');
    setupNavLink('navHelp', 'helpPage');
    setupNavLink('navAccount', 'accountPage');
    
    // Login buttons
    const loginNavBtn = document.getElementById('loginNavBtn');
    if (loginNavBtn) {
        loginNavBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Login nav button clicked");
            if (authToken) {
                // If already logged in, log out
                logoutUser();
            } else {
                showSection('loginPage');
            }
        });
    }
    
    const homeLoginBtn = document.getElementById('homeLoginBtn');
    if (homeLoginBtn) {
        homeLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Home login button clicked");
            showSection('loginPage');
        });
    }
    
    // Password reset links
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Forgot password link clicked");
            showSection('passwordResetPage');
        });
    }
    
    const backToLoginLink = document.getElementById('backToLoginLink');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Back to login link clicked");
            showSection('loginPage');
        });
    }
    
    // Admin panel links
    const adminUsersLink = document.getElementById('adminUsersLink');
    if (adminUsersLink) {
        adminUsersLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Admin users link clicked");
            // Could implement tab navigation within admin panel
        });
    }

    // Setup forms
    setupLoginForm();
    setupPasswordResetForm();
    setupProductSearchForm();
    
    // Initialize UI state
    updateLoginState();
    
    console.log("All event listeners attached");
});

// ------------------------------------------------------------------
// Helper Functions
// ------------------------------------------------------------------

/**
 * Displays a result in a specified element and visually marks if the vulnerability was triggered
 * @param {string} elementId - ID of the element where the result should be displayed
 * @param {string} message - The message to display (can contain HTML)
 * @param {boolean} isError - If true, display as an error (red color)
 */
function showResult(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = message;
        element.className = isError ? 'result-error' : 'result-success';
        
        // Animation to highlight when a vulnerability has been triggered
        if (element.parentElement) {
            element.parentElement.classList.add('vulnerability-triggered');
            setTimeout(() => {
                element.parentElement.classList.remove('vulnerability-triggered');
            }, 1000);
        }
    } else {
        console.error("Result element not found:", elementId);
    }
}

/**
 * Converts a JSON object to HTML-formatted text
 * @param {Object} json - The JSON object to convert
 * @returns {string} HTML-safe string
 */
function jsonToHtml(json) {
    return JSON.stringify(json, null, 2)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Update the UI based on login state
 */
function updateLoginState() {
    const userDisplay = document.getElementById('userDisplay');
    const loginBtn = document.getElementById('loginNavBtn');
    
    if (!userDisplay || !loginBtn) {
        console.error("User display or login button elements not found");
        return;
    }
    
    if (authToken && currentUser) {
        userDisplay.textContent = `Welcome, ${currentUser}`;
        loginBtn.textContent = 'Logout';
        loginBtn.classList.remove('btn-outline-light');
        loginBtn.classList.add('btn-danger');
    } else {
        userDisplay.textContent = 'Not logged in';
        loginBtn.textContent = 'Login';
        loginBtn.classList.remove('btn-danger');
        loginBtn.classList.add('btn-outline-light');
    }
}

/**
 * Update profile information in the account page
 */
function updateProfileInfo() {
    const profileInfo = document.getElementById('profileInfo');
    
    if (!profileInfo) {
        console.error("Profile info element not found");
        return;
    }
    
    if (!authToken || !currentUser) {
        profileInfo.innerHTML = '<p class="text-muted">Please log in to view your profile information.</p>';
        return;
    }
    
    // VULNERABILITY: This directly displays user information without proper validation
    // In a real app, we'd fetch this from an API endpoint with proper authorization
    profileInfo.innerHTML = `
        <div class="profile-item">
            <label>Username</label>
            <div>${currentUser}</div>
        </div>
        <div class="profile-item">
            <label>Email</label>
            <div>${currentUser}@example.com</div>
        </div>
        <div class="profile-item">
            <label>Member Since</label>
            <div>January 1, 2023</div>
        </div>
        <div class="profile-item">
            <label>Account Type</label>
            <div>${currentUser === 'admin' ? 'Administrator' : 'Standard User'}</div>
        </div>
        <hr>
        <div class="d-flex justify-content-end">
            <button class="btn btn-primary">Edit Profile</button>
        </div>
    `;
}

/**
 * Log out the current user
 */
function logoutUser() {
    authToken = null;
    currentUser = null;
    updateLoginState();
    showSection('homePage');
}

// ------------------------------------------------------------------
// Authentication & Security Vulnerability Demonstrations
// ------------------------------------------------------------------

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                // Simulate API request since we're not actually connecting to a backend
                console.log("Login attempt:", username);
                
                // Mock response for demo purposes
                // VULNERABILITY: Basic auth using btoa (base64 encoding) - INSECURE!
                const mockToken = btoa(username + ':' + password) + ".mockJWTtoken";
                
                // VULNERABILITY: Stores token in JavaScript variable without security
                authToken = mockToken;
                currentUser = username;
                
                // Update UI state
                updateLoginState();
                
                showResult('loginResult', `
                    <p>Successfully logged in as <strong>${username}</strong>!</p>
                    <p>Token:</p>
                    <div class="token-display">${mockToken}</div>
                `);
                
                // Wait a moment before redirecting to account page
                setTimeout(() => {
                    showSection('accountPage');
                    updateProfileInfo();
                }, 2000);
            } catch (error) {
                showResult('loginResult', `<p>Error: ${error.message}</p>`, true);
            }
        });
    } else {
        console.warn("Login form not found");
    }
}

// Setup password reset form
function setupPasswordResetForm() {
    const passwordResetForm = document.getElementById('passwordResetForm');
    if (passwordResetForm) {
        passwordResetForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('resetUsername').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Client-side validation (this doesn't fix the server-side vulnerability)
            if (newPassword !== confirmPassword) {
                showResult('passwordResetResult', '<p>Passwords do not match!</p>', true);
                return;
            }
            
            try {
                // Simulate API request for demo purposes
                console.log("Password reset for:", username);
                
                // Mock response
                showResult('passwordResetResult', `
                    <p>Password for ${username} has been reset successfully!</p>
                    <p>You can now <a href="#" id="resetToLoginLink">login with your new password</a>.</p>
                `);
                
                // Add event listener to the new link
                const resetToLoginLink = document.getElementById('resetToLoginLink');
                if (resetToLoginLink) {
                    resetToLoginLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        showSection('loginPage');
                    });
                }
            } catch (error) {
                showResult('passwordResetResult', `<p>Error: ${error.message}</p>`, true);
            }
        });
    } else {
        console.warn("Password reset form not found");
    }
}

// Setup product search form (SQL Injection demonstration)
function setupProductSearchForm() {
    const productSearchForm = document.getElementById('productSearchForm');
    if (productSearchForm) {
        productSearchForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const query = document.getElementById('searchQuery').value;
            const category = document.getElementById('categoryFilter').value;
            
            try {
                console.log("Product search:", query, "Category:", category);
                
                // Mock response with some dummy products for demo purposes
                const mockProducts = [
                    { title: "Premium Headphones", content: "High-quality noise-canceling headphones with 20-hour battery life." },
                    { title: "Fitness Tracker", content: "Track your steps, sleep, and heart rate with our latest smart wearable." }
                ];
                
                // If the query contains a single quote, simulate SQL injection success
                const mockInjectedProducts = [
                    { title: "Premium Headphones", content: "High-quality noise-canceling headphones with 20-hour battery life." },
                    { title: "Fitness Tracker", content: "Track your steps, sleep, and heart rate with our latest smart wearable." },
                    { title: "Smart Home Hub", content: "Control all your smart devices with voice commands and automation." },
                    { title: "Wireless Charger", content: "Fast charging for compatible devices." },
                    { title: "Bluetooth Speaker", content: "Portable speaker with rich sound." }
                ];
                
                // Simulate SQL injection vulnerability
                const products = query.includes("'") ? mockInjectedProducts : mockProducts;
                
                // Display results
                displayProductResults(products, query);
            } catch (error) {
                showResult('sqlInjectionResult', `<p>Error: ${error.message}</p>`, true);
            }
        });
    } else {
        console.warn("Product search form not found");
    }
}

/**
 * Display product search results
 * @param {Array} products - Array of product data
 * @param {string} query - Search query used
 */
function displayProductResults(products, query) {
    const resultsContainer = document.getElementById('sqlInjectionResult');
    const productsContainer = document.getElementById('productsContainer');
    
    if (!resultsContainer || !productsContainer) {
        console.error("Results or products container not found");
        return;
    }
    
    // Check if SQL injection was likely successful (more products than expected for a query)
    const isInjectionLikely = products.length > 2 && query.includes("'");
    
    if (products.length === 0) {
        resultsContainer.innerHTML = '<div class="alert alert-info">No products found matching your search.</div>';
        productsContainer.innerHTML = '';
        return;
    }
    
    // Display vulnerability note if SQL injection likely occurred
    if (isInjectionLikely) {
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                Found ${products.length} products matching your search criteria.
                <small class="d-block mt-1">Note: SQL Injection vulnerability detected!</small>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `<div class="alert alert-success">Found ${products.length} products matching "${query}"</div>`;
    }
    
    // Generate product cards
    let productsHTML = '';
    
    products.forEach(product => {
        // For visualization purposes, treat the posts as products
        const productTitle = product.title || 'Product Name';
        const productDesc = product.content || 'Product Description';
        const productPrice = Math.floor(Math.random() * 100) + 9.99;
        
        productsHTML += `
            <div class="col-md-4 mb-4">
                <div class="card product-card">
                    <div class="card-body">
                        <h5 class="card-title">${productTitle}</h5>
                        <p class="card-text">${productDesc}</p>
                        <p class="price">$${productPrice.toFixed(2)}</p>
                        <button class="btn btn-sm btn-primary">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsContainer.innerHTML = productsHTML;
}

// For testing if the script loaded correctly
console.log("ShopSmart app.js loaded successfully");


// ------------------------------------------------------------------
// Product Management Functions
// ------------------------------------------------------------------

// Sample product data (in a real app, this would come from your API)
const allProducts = [
    {
        id: 1,
        name: "Premium Headphones",
        description: "High-quality noise-canceling headphones with 20-hour battery life.",
        price: 199.99,
        category: "electronics"
    },
    {
        id: 2,
        name: "Fitness Tracker",
        description: "Track your steps, sleep, and heart rate with our latest smart wearable.",
        price: 89.99,
        category: "fitness"
    },
    {
        id: 3,
        name: "Smart Home Hub",
        description: "Control all your smart devices with voice commands and automation.",
        price: 129.99,
        category: "electronics"
    },
    {
        id: 4,
        name: "Wireless Charger",
        description: "Fast charging for compatible devices.",
        price: 49.99,
        category: "electronics"
    },
    {
        id: 5,
        name: "Bluetooth Speaker",
        description: "Portable speaker with rich sound.",
        price: 79.99,
        category: "electronics"
    },
    {
        id: 6,
        name: "Designer T-Shirt",
        description: "Comfortable cotton t-shirt with modern design.",
        price: 29.99,
        category: "clothing"
    },
    {
        id: 7,
        name: "Running Shoes",
        description: "Lightweight shoes for runners.",
        price: 119.99,
        category: "clothing"
    },
    {
        id: 8,
        name: "Denim Jeans",
        description: "Classic jeans with perfect fit.",
        price: 59.99,
        category: "clothing"
    },
    {
        id: 9,
        name: "Winter Jacket",
        description: "Warm jacket for cold weather.",
        price: 149.99,
        category: "clothing"
    },
    {
        id: 10,
        name: "Sunglasses",
        description: "UV protection stylish sunglasses.",
        price: 89.99,
        category: "accessories"
    },
    {
        id: 11,
        name: "Coffee Maker",
        description: "Automatic coffee machine for perfect brew.",
        price: 199.99,
        category: "home"
    },
    {
        id: 12,
        name: "Non-stick Pan",
        description: "High-quality kitchen cookware.",
        price: 39.99,
        category: "home"
    },
    {
        id: 13,
        name: "Blender",
        description: "Powerful blender for smoothies and more.",
        price: 69.99,
        category: "home"
    },
    {
        id: 14,
        name: "Cutlery Set",
        description: "Stainless steel premium cutlery.",
        price: 129.99,
        category: "home"
    },
    {
        id: 15,
        name: "Yoga Mat",
        description: "Non-slip exercise mat for yoga.",
        price: 25.99,
        category: "fitness"
    }
];

// Setup product page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize product page with all products
    displayProducts(allProducts);
    
    // Setup category links
    setupCategoryLinks();
    
    // Setup sort options
    setupSortOptions();
    
    // Setup existing product search form (should already exist in your original code)
    setupProductSearchForm();
});

/**
 * Display products in the products container
 * @param {Array} products - Array of product data
 */
function displayProducts(products) {
    const productsContainer = document.getElementById('productsContainer');
    
    if (!productsContainer) {
        console.error("Products container not found");
        return;
    }
    
    if (products.length === 0) {
        productsContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted">No products found</p></div>';
        return;
    }
    
    // Generate product cards
    let productsHTML = '';
    
    products.forEach(product => {
        productsHTML += `
            <div class="col-md-4 mb-4" data-product-id="${product.id}">
                <div class="card product-card">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <p class="price">$${product.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-primary add-to-cart-btn">Add to Cart</button>
                            <button class="btn btn-sm btn-outline-secondary view-details-btn">Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    productsContainer.innerHTML = productsHTML;
    
    // Setup event listeners for Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const productId = this.closest('[data-product-id]').getAttribute('data-product-id');
            addToCart(productId);
        });
    });
    
    // Setup event listeners for View Details buttons
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const productId = this.closest('[data-product-id]').getAttribute('data-product-id');
            viewProductDetails(productId);
        });
    });
}

/**
 * Setup category links on product page
 */
function setupCategoryLinks() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            filterProductsByCategory(category);
        });
    });
}

/**
 * Filter products by category
 * @param {string} category - Category to filter by
 */
function filterProductsByCategory(category) {
    const productsTitle = document.getElementById('productsTitle');
    
    // Update title
    productsTitle.textContent = category ? 
        category.charAt(0).toUpperCase() + category.slice(1) : 'All Products';
    
    // Filter products
    const filteredProducts = category ? 
        allProducts.filter(product => product.category === category) : 
        allProducts;
    
    // Display filtered products
    displayProducts(filteredProducts);
}

/**
 * Setup sort options for products
 */
function setupSortOptions() {
    document.querySelectorAll('.sort-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.preventDefault();
            const sortBy = this.getAttribute('data-sort');
            sortProducts(sortBy);
        });
    });
}

/**
 * Sort products by the given criteria
 * @param {string} sortBy - Sorting criteria (price-asc, price-desc, name-asc, name-desc)
 */
function sortProducts(sortBy) {
    // Get current displayed products
    const productsContainer = document.getElementById('productsContainer');
    const productElements = productsContainer.querySelectorAll('[data-product-id]');
    
    // Get product IDs currently displayed
    const productIds = Array.from(productElements).map(el => 
        parseInt(el.getAttribute('data-product-id'))
    );
    
    // Get actual product objects
    let displayedProducts = allProducts.filter(product => 
        productIds.includes(product.id)
    );
    
    // Sort products
    switch(sortBy) {
        case 'price-asc':
            displayedProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-desc':
            displayedProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name-asc':
            displayedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            displayedProducts.sort((a, b) => b.name.localeCompare(a.name));
            break;
    }
    
    // Display sorted products
    displayProducts(displayedProducts);
}

/**
 * Add a product to the cart
 * @param {number} productId - ID of the product to add
 */
function addToCart(productId) {
    // Find the product
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        console.error("Product not found:", productId);
        return;
    }
    
    console.log(`Added to cart: ${product.name}`);
    
    // Show a success message
    alert(`Added to cart: ${product.name}`);
    
    // In a real application, you would store the cart items in localStorage or send to a server
}

/**
 * View details of a product
 * @param {number} productId - ID of the product to view
 */
function viewProductDetails(productId) {
    // Find the product
    const product = allProducts.find(p => p.id == productId);
    
    if (!product) {
        console.error("Product not found:", productId);
        return;
    }
    
    console.log(`Viewing details for: ${product.name}`);
    
    // In a real application, you would navigate to a product details page
    // For now, just show an alert with the details
    alert(`Product Details:\n\nName: ${product.name}\nPrice: $${product.price.toFixed(2)}\nCategory: ${product.category}\n\n${product.description}`);
}

// Update the existing product search function to use our product data
function setupProductSearchForm() {
    const productSearchForm = document.getElementById('productSearchForm');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (productSearchForm) {
        productSearchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const query = document.getElementById('searchQuery').value.toLowerCase();
            const category = categoryFilter.value;
            
            // Filter products based on search query and category
            let filteredProducts = allProducts;
            
            if (query) {
                filteredProducts = filteredProducts.filter(product => 
                    product.name.toLowerCase().includes(query) || 
                    product.description.toLowerCase().includes(query)
                );
            }
            
            if (category) {
                filteredProducts = filteredProducts.filter(product => 
                    product.category === category
                );
            }
            
            // Update the products title
            const productsTitle = document.getElementById('productsTitle');
            if (productsTitle) {
                if (query && category) {
                    productsTitle.textContent = `Search: "${query}" in ${category}`;
                } else if (query) {
                    productsTitle.textContent = `Search: "${query}"`;
                } else if (category) {
                    productsTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                } else {
                    productsTitle.textContent = 'All Products';
                }
            }
            
            // Display filtered products
            displayProducts(filteredProducts);
            
            // Show search result info (reusing the sqlInjectionResult element)
            const resultsContainer = document.getElementById('sqlInjectionResult');
            if (resultsContainer) {
                if (filteredProducts.length > 0) {
                    resultsContainer.innerHTML = `
                        <div class="alert alert-success">
                            Found ${filteredProducts.length} products matching your search.
                        </div>
                    `;
                } else {
                    resultsContainer.innerHTML = `
                        <div class="alert alert-info">
                            No products found matching your search.
                        </div>
                    `;
                }
            }
        });
    }
    
    // Also add event listener for category filter change
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            // Trigger the search form submission to apply the filter
            productSearchForm.dispatchEvent(new Event('submit'));
        });
    }
}