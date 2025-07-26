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
// showContentBySubmenuId fonksiyonunuzu güncelleyin
// showContentBySubmenuId fonksiyonunuzu güncelleyin
function showContentBySubmenuId(submenuId) {
    // ... (mevcut kodlar)

    const submenuObj = submenus.find(sm => sm.id === submenuId);
    const contentObj = contents.find(c => c.submenuId === submenuId);

    const headerTitle = submenuObj ? submenuObj.title : 'İçerik';

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

        // --- Adım 1: Formları sarmalama (önceki cevaptaki kod) ---
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

        // --- Adım 2: Belirli kelimeleri vurgulama için yeni kısım ---
        const wordsToHighlight = ['okUrl', 'failUrl', 'TDS Merchant Gateway']; // Vurgulanacak kelimeler
        const highlightClass = 'highlight-param'; // Vurgu için kullanacağımız CSS sınıfı

        // İçerik elementindeki metin node'larını gezmek için yardımcı fonksiyon
        // Bu, HTML etiketlerinin içine girmeden sadece metinleri değiştirmemizi sağlar.
        function highlightTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) { // Sadece metin node'larını kontrol et
                let text = node.nodeValue;
                let changed = false;

                wordsToHighlight.forEach(word => {
                    // Kelimeyi büyük/küçük harf duyarsız arama ve sadece tam kelime olarak bulma
                    // \b kelime sınırı regex'idir.
                    const regex = new RegExp(`\\b(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');

                    if (regex.test(text)) {
                        text = text.replace(regex, `<span class="${highlightClass}">$1</span>`);
                        changed = true;
                    }
                });

                if (changed) {
                    const tempSpan = document.createElement('span'); // Geçici bir span oluştur
                    tempSpan.innerHTML = text; // HTML olarak parse et
                    node.parentNode.replaceChild(tempSpan, node); // Orijinal metin node'unu yeni HTML ile değiştir
                }
            } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE' && node.nodeName !== 'PRE' && !node.classList.contains('hljs') && !node.classList.contains('api-form-card')) {
                // SCRIPT, STYLE, PRE (kod blokları) ve zaten işlenmiş form/highlighted.js alanları hariç
                // diğer elementlerin çocuklarını gez
                for (let i = 0; i < node.childNodes.length; i++) {
                    highlightTextNodes(node.childNodes[i]);
                }
            }
        }

        highlightTextNodes(tempDiv); // tempDiv içindeki metinleri tara ve vurgula
        // --- Vurgulama sonu ---

        contentEl.innerHTML = `<h3>${headerTitle}</h3><div class="markdown-content">${tempDiv.innerHTML}</div>`;
        hljs.highlightAll(); // Yeni eklenen kod bloklarını da vurgula (emin olmak için)

    } else {
        contentEl.innerHTML = `<h3>${headerTitle}</h3><p>Bu alt menüye ait içerik bulunamadı.</p>`;
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
        menuLi.appendChild(menuTitle);

        const relatedSubmenus = submenus.filter(sm => sm.menuId === menu.id);

        const submenuUl = document.createElement('ul');
        submenuUl.className = 'submenu-list';

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

    } catch (error) {
        contentEl.innerHTML = `<h3>Hata</h3><p>Veriler yüklenirken hata oluştu: ${error.message}</p>`;
        console.error(error);
    }
}

// Sayfa yüklendiğinde verileri yükle
window.addEventListener('DOMContentLoaded', () => {
    loadData();
});
