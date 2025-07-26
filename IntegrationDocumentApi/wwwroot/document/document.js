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

// İçerik gösterme fonksiyonu, Markdown + HTML destekli
function showContentBySubmenuId(submenuId) {
    // Aktif alt menüyü işaretle
    document.querySelectorAll('.submenu-item.active').forEach(el => el.classList.remove('active'));
    const activeEl = document.querySelector(`.submenu-item[data-submenuid='${submenuId}']`);
    if (activeEl) activeEl.classList.add('active');

    const contentObj = contents.find(c => c.submenuId === submenuId);

    if (contentObj) {
        marked.setOptions({
            highlight: function (code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-',
            sanitize: false
        });

        const rawHtmlContent = marked.parse(contentObj.text);

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = rawHtmlContent;

        // --- Formları sarmalama ---
        const forms = tempDiv.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.closest('.api-form-card')) {
                const wrapperDiv = document.createElement('div');
                wrapperDiv.className = 'api-form-card';
                form.parentNode.insertBefore(wrapperDiv, form);
                wrapperDiv.appendChild(form);
            }
        });
        // --- Form sarmalama sonu ---

        // --- Belirli kelimeleri vurgulama ---
        const wordsToHighlight = ['okUrl', 'failUrl', 'TDS Merchant Gateway', 'HTML Form Post', 'tarayıcı tabanlı', 'HTTP POST'];
        const highlightClass = 'highlight-param';

        function highlightTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                let text = node.nodeValue;
                let changed = false;

                wordsToHighlight.forEach(word => {
                    const regex = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');

                    if (regex.test(text)) {
                        text = text.replace(regex, `<span class="${highlightClass}">$1</span>`);
                        changed = true;
                    }
                });

                if (changed) {
                    const tempSpan = document.createElement('span');
                    tempSpan.innerHTML = text;
                    node.parentNode.replaceChild(tempSpan, node);
                }
            } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'PRE' && !node.classList.contains('hljs') && !node.classList.contains('api-form-card')) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    highlightTextNodes(node.childNodes[i]);
                }
            }
        }

        highlightTextNodes(tempDiv);
        // --- Vurgulama sonu ---

        contentEl.innerHTML = `<div class="markdown-content">${tempDiv.innerHTML}</div>`;
        hljs.highlightAll();

    } else {
        contentEl.innerHTML = `<p>Bu alt menüye ait içerik bulunamadı.</p>`;
    }
}

// Menüleri ve alt menüleri oluştur
function renderMenuTree() {
    menuListEl.innerHTML = ''; // temizle

    menus.forEach(menu => {
        const menuLi = document.createElement('li');
        menuLi.className = 'menu-item';

        const menuTitle = document.createElement('div');
        menuTitle.className = 'menu-title';
        menuTitle.textContent = menu.title;

        // Font Awesome ok ikonu ekle
        const arrowIcon = document.createElement('i');
        arrowIcon.className = 'fas fa-chevron-right'; // Varsayılan olarak sağa bakan ok
        menuTitle.appendChild(arrowIcon);

        menuLi.appendChild(menuTitle);

        const relatedSubmenus = submenus.filter(sm => sm.menuId === menu.id);

        const submenuUl = document.createElement('ul');
        submenuUl.className = 'submenu-list';
        // Başlangıçta kapalı olması için 'collapsed' sınıfını eklemiyoruz,
        // CSS'teki max-height: 0; ile kontrol ediliyor.

        relatedSubmenus.forEach(sm => {
            const submenuLi = document.createElement('li');
            submenuLi.className = 'submenu-item';
            submenuLi.textContent = sm.title;
            submenuLi.setAttribute('data-submenuid', sm.id);

            submenuLi.addEventListener('click', () => {
                showContentBySubmenuId(sm.id);
            });

            submenuUl.appendChild(submenuLi);
        });

        menuLi.appendChild(submenuUl);
        menuListEl.appendChild(menuLi);

        // Accordion (açma/kapama) özelliği için event listener
        menuTitle.addEventListener('click', () => {
            submenuUl.classList.toggle('expanded');
            // Font Awesome ikonu için dönüş sınıfı
            arrowIcon.classList.toggle('fa-chevron-right'); // Sağa bakan ok
            arrowIcon.classList.toggle('fa-chevron-down'); // Aşağı bakan ok
        });
    });
}

// API'den verileri çek ve render et
async function loadData() {
    try {
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

        // Sayfa yüklendiğinde ilk alt menüyü otomatik olarak yükle
        if (submenus.length > 0) {
            const firstMenuId = menus.length > 0 ? menus[0].id : null;
            const firstSubmenuInFirstMenu = submenus.find(sm => sm.menuId === firstMenuId);

            if (firstSubmenuInFirstMenu) {
                showContentBySubmenuId(firstSubmenuInFirstMenu.id);
                // İlk menüyü ve alt menüsünü aç
                const firstMenuTitleEl = menuListEl.querySelector(`.menu-item:first-child .menu-title`);
                const firstSubmenuUlEl = menuListEl.querySelector(`.menu-item:first-child .submenu-list`);

                if (firstSubmenuUlEl && firstMenuTitleEl) {
                    firstSubmenuUlEl.classList.add('expanded');
                    const arrowIcon = firstMenuTitleEl.querySelector('.fas');
                    if (arrowIcon) {
                        arrowIcon.classList.remove('fa-chevron-right');
                        arrowIcon.classList.add('fa-chevron-down');
                    }
                }
            } else if (submenus.length > 0) { // İlk menüde alt menü yoksa, genel ilk alt menüyü aç
                showContentBySubmenuId(submenus[0].id);
                const parentSubmenuLi = menuListEl.querySelector(`.submenu-item[data-submenuid='${submenus[0].id}']`);
                if (parentSubmenuLi) {
                    const parentMenuTitleEl = parentSubmenuLi.closest('.menu-item').querySelector('.menu-title');
                    const parentSubmenuUlEl = parentSubmenuLi.closest('.submenu-list');
                    if (parentSubmenuUlEl && parentMenuTitleEl && !parentSubmenuUlEl.classList.contains('expanded')) {
                        parentSubmenuUlEl.classList.add('expanded');
                        const arrowIcon = parentMenuTitleEl.querySelector('.fas');
                        if (arrowIcon) {
                            arrowIcon.classList.remove('fa-chevron-right');
                            arrowIcon.classList.add('fa-chevron-down');
                        }
                    }
                }
            }
        }

    } catch (error) {
        contentEl.innerHTML = `<p>Veriler yüklenirken hata oluştu: ${error.message}</p>`;
        console.error(error);
    }
}

// Sayfa yüklendiğinde verileri yükle
window.addEventListener('DOMContentLoaded', () => {
    loadData();
});