// API URL’leri
const API_MENUS = 'https://localhost:7179/api/menus';
const API_SUBMENUS = 'https://localhost:7179/api/submenus';
const API_CONTENTS = 'https://localhost:7179/api/contents';

// Veriler için değişkenler
let menus = [];
let submenus = [];
let contents = [];

const menuListEl = document.getElementById('menuList');
const contentEl = document.getElementById('content');

// İçerik göster
function showContentBySubmenuId(submenuId) {
    document.querySelectorAll('.submenu-item.active').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.submenu-item[data-submenuid='${submenuId}']`);
    if (activeEl) activeEl.classList.add('active');

    const submenuObj = submenus.find(sm => sm.id === submenuId);
    const contentObj = contents.find(c => c.submenuId === submenuId);

    const headerTitle = submenuObj ? submenuObj.title : 'İçerik';

    if (contentObj) {
        // Markdown içeriği HTML’ye çevir
        const htmlContent = marked.parse(contentObj.text);

        contentEl.innerHTML = `<h3>${headerTitle}</h3><div>${htmlContent}</div>`;
    } else {
        contentEl.innerHTML = `<h3>${headerTitle}</h3><p>Bu alt menüye ait içerik bulunamadı.</p>`;
    }
}



// Menüleri ve alt menüleri render et
function renderMenuTree() {
    menuListEl.innerHTML = '';

    menus.forEach(menu => {
        const menuLi = document.createElement('li');
        menuLi.className = 'menu-item';

        const menuTitle = document.createElement('div');
        menuTitle.className = 'menu-title';
        menuTitle.textContent = menu.title;  // küçük harf
        menuLi.appendChild(menuTitle);

        const relatedSubmenus = submenus.filter(sm => sm.menuId === menu.id);

        const submenuUl = document.createElement('ul');
        submenuUl.className = 'submenu-list';

        relatedSubmenus.forEach(sm => {
            const submenuLi = document.createElement('li');
            submenuLi.className = 'submenu-item';
            submenuLi.textContent = sm.title;  // küçük harf
            submenuLi.setAttribute('data-submenuid', sm.id);

            submenuLi.addEventListener('click', () => {
                showContentBySubmenuId(sm.id);
            });

            submenuUl.appendChild(submenuLi);
        });

        menuLi.appendChild(submenuUl);
        menuListEl.appendChild(menuLi);
    });
}


// API’den tüm verileri çek ve UI’yı oluştur
async function loadData() {
    try {
        // Promise.all ile paralel çekelim
        const [menusRes, submenusRes, contentsRes] = await Promise.all([
            fetch(API_MENUS),
            fetch(API_SUBMENUS),
            fetch(API_CONTENTS)
        ]);

        if (!menusRes.ok || !submenusRes.ok || !contentsRes.ok) {
            throw new Error('API isteklerinden biri başarısız oldu.');
        }

        menus = await menusRes.json();
        submenus = await submenusRes.json();
        contents = await contentsRes.json();

        renderMenuTree();

    } catch (error) {
        contentEl.innerHTML = `<h3>Hata</h3><p>Veriler yüklenirken hata oluştu: ${error.message}</p>`;
        console.error(error);
    }
}

// Sayfa yüklendiğinde verileri çek
window.addEventListener('DOMContentLoaded', () => {
    loadData();
});
