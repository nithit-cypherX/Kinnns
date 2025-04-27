const menus = [
    { name: "Roasted Duck Breast", image: "../assets/images/sectionTwo_image.png", category: "Main Course", description: "Tender roasted duck breast with a savory glaze." },
    { name: "Truffle-Infused Chicken Supreme", image: "../assets/images/sectionTwo_image.png", category: "Main Course", description: "Chicken supreme infused with aromatic truffle oil." },
    { name: "Sous Vide Chicken with Herb Butter", image: "../assets/images/sectionTwo_image.png", category: "Main Course", description: "Juicy sous vide chicken served with a flavorful herb butter." },
    { name: "Lobster Thermidor with Garlic Butter", image: "../assets/images/sectionTwo_image.png", category: "Main Course", description: "Classic lobster thermidor with a rich garlic butter sauce." }
];

const menuList = document.getElementById("menuList");
const menuCount = document.getElementById("menuCount");
const addProductButton = document.getElementById("add-product-button");
const addProductModal = document.getElementById("add-product-modal");
const editProductModal = document.getElementById("edit-product-modal");
const closeButtons = document.querySelectorAll(".close-button");
const saveNewProductButton = document.getElementById("save-new-product-button");
const saveEditProductButton = document.getElementById("save-edit-product-button");
const newProductNameInput = document.getElementById("new-product-name");
const newProductImageInput = document.getElementById("new-product-image");
const newProductCategorySelect = document.getElementById("new-product-category");
const newProductDescriptionInput = document.getElementById("new-product-description");
const editProductNameInput = document.getElementById("edit-product-name");
const editProductImageInput = document.getElementById("edit-product-image");
const editProductCategorySelect = document.getElementById("edit-product-category");
const editProductDescriptionInput = document.getElementById("edit-product-description");


let editingIndex = null;

function updateMenuCount() {
    menuCount.textContent = menus.length;
}

function renderMenuList() {
    menuList.innerHTML = '';
    menus.forEach((menu, index) => {
        const item = document.createElement("div");
        item.className = "box menu-item-box";
        item.innerHTML = `
            <div class="menu-item-content">
                <figure class="image is-128x128">
                    <img   src="${menu.image}" alt="${menu.name}" />
                </figure>
                <div>
                    <p class="menu-title">${menu.name}</p>
                    <p class="is-size-7 has-text-grey">${menu.category}</p>
                    <p class="is-size-7">${menu.description ? menu.description.substring(0, 50) + '...' : ''}</p>
                </div>
            </div>
            <div class="menu-item-actions">
                <label class="checkbox is-flex is-align-items-center">
                    Visibility:
                    <input type="checkbox" class="ml-2" checked onchange="toggleVisibility(this, ${index})">
                </label>
                <button class="button is-medium is-info is-light edit-button" data-index="${index}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="button is-medium is-danger is-light delete-button" data-index="${index}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        menuList.appendChild(item);

        const editButton = item.querySelector('.edit-button');
        const deleteButton = item.querySelector('.delete-button');

        editButton.addEventListener('click', () => {
            openEditModal(index);
        });

        deleteButton.addEventListener('click', () => {
            deleteMenuItem(index);
        });
    });
    updateMenuCount();
}

function toggleVisibility(checkbox, index) {
    menus[index].visible = checkbox.checked;
    const card = checkbox.closest('.menu-item-box');
    card.style.opacity = checkbox.checked ? '1' : '0.4';
}

function deleteMenuItem(index) {
    menus.splice(index, 1);
    renderMenuList();
}

function openEditModal(index) {
    editingIndex = index;
    editProductNameInput.value = menus[index].name;
    editProductImageInput.value = menus[index].image;
    editProductCategorySelect.value = menus[index].category;
    editProductDescriptionInput.value = menus[index].description || '';
    editProductModal.style.display = "block";
}

function openAddModal() {
    addProductModal.style.display = "block";
    newProductNameInput.value = '';
    newProductImageInput.value = '';
    newProductCategorySelect.selectedIndex = 0; // Reset category to the first option
    newProductDescriptionInput.value = '';
}

addProductButton.addEventListener("click", openAddModal);

closeButtons.forEach(button => {
    button.addEventListener("click", () => {
        addProductModal.style.display = "none";
        editProductModal.style.display = "none";
    });
});

window.addEventListener("click", (event) => {
    if (event.target.classList.contains('modal')) {
        addProductModal.style.display = "none";
        editProductModal.style.display = "none";
    }
});

saveNewProductButton.addEventListener("click", (event) => {
    event.preventDefault();

    const newName = newProductNameInput.value;
    const newImage = newProductImageInput.value;
    const newCategory = newProductCategorySelect.value;
    const newDescription = newProductDescriptionInput.value;

    if (newName && newImage) {
        menus.push({ name: newName, image: newImage, category: newCategory, description: newDescription, visible: true });
        renderMenuList();
        addProductModal.style.display = "none";
        newProductNameInput.value = '';
        newProductImageInput.value = '';
        newProductCategorySelect.selectedIndex = 0;
        newProductDescriptionInput.value = '';
    } else {
        alert("Please fill in the name and image URL!");
    }
});

saveEditProductButton.addEventListener("click", (event) => {
    event.preventDefault();

    const newName = editProductNameInput.value;
    const newImage = editProductImageInput.value;
    const newCategory = editProductCategorySelect.value;
    const newDescription = editProductDescriptionInput.value;

    if (newName && newImage && editingIndex !== null) {
        menus[editingIndex].name = newName;
        menus[editingIndex].image = newImage;
        menus[editingIndex].category = newCategory;
        menus[editingIndex].description = newDescription;
        renderMenuList();
        editProductModal.style.display = "none";
        editingIndex = null;
    } else {
        alert("Please fill in all fields!");
    }
});

renderMenuList();