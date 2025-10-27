// Version 1.1 - Updated mobile font sizes for characteristics
// Smooth Scroll Function
function smoothScrollTo(targetId) {
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      const headerHeight = 80; // Height of fixed header
      const targetPosition = targetElement.offsetTop - headerHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }
  
  // FAQ
  document.addEventListener('DOMContentLoaded', function () {
      const faqItems = document.querySelectorAll('.faq-item');
      faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        question.addEventListener('click', function () {
          // Закрыть все другие FAQ
          faqItems.forEach(otherItem => {
            if (otherItem !== item) {
              otherItem.classList.remove('active');
              const otherAnswer = otherItem.querySelector('.faq-answer');
              const otherIcon = otherItem.querySelector('.faq-icon');
              otherAnswer.classList.add('hidden');
              otherIcon.classList.remove('minus');
            }
          });
          
          // Переключить текущий FAQ
          item.classList.toggle('active');
          answer.classList.toggle('hidden');
          
          if (item.classList.contains('active')) {
            icon.classList.add('minus');
          } else {
            icon.classList.remove('minus');
          }
        });
      });
    });
    
    // Dropdown
    document.addEventListener('DOMContentLoaded', function () {
      const modelSelects = document.querySelectorAll('.model-select');
      modelSelects.forEach(select => {
        const dropdown = select.nextElementSibling;
        const selected = select.querySelector('.selected-model');
        select.addEventListener('click', () => dropdown.classList.toggle('hidden'));
        dropdown.querySelectorAll('.model-option').forEach(option => {
          option.addEventListener('click', () => {
            selected.textContent = option.textContent;
            selected.classList.remove('text-gray-400');
            selected.classList.add('text-accent');
            dropdown.classList.add('hidden');
          });
        });
        document.addEventListener('click', e => {
          if (!select.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
          }
        });
      });
    });
    
    // Radio buttons
    document.addEventListener('DOMContentLoaded', function () {
      const timelineRadios = document.querySelectorAll('.timeline-radio');
      timelineRadios.forEach(radio => {
        radio.addEventListener('change', function () {
          document.querySelectorAll('.radio-dot').forEach(dot => dot.classList.add('hidden'));
          document.querySelectorAll('.radio-custom').forEach(custom => {
            custom.classList.remove('border-primary');
            custom.classList.add('border-gray-600');
          });
          if (this.checked) {
            const dot = this.parentElement.querySelector('.radio-dot');
            const custom = this.parentElement.querySelector('.radio-custom');
            dot.classList.remove('hidden');
            custom.classList.replace('border-gray-600', 'border-primary');
          }
        });
      });
    });
    
  
    function updateProductModalContent(productId) {
      // Product data - можно расширить для разных продуктов
      const productData = {
        'g30': {
          title: 'Space Capsule House G30',
          price: '$14,200',
          description: 'Модель G30 из серии Galaxy предлагает современное компактное решение для жизни. Этот модульный дом сочетает в себе функциональность, комфорт и стиль.',
          image: './media/catalog/g30.png.webp',
          characteristics: [
            { 
              label: 'ПЛОЩАДЬ', 
              value: '14.6 м²',
              icon: '<path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>'
            },
            { 
              label: 'ВМЕСТИМОСТЬ', 
              value: '2 чел.',
              icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
            },
            { 
              label: 'МОЩНОСТЬ', 
              value: '6.7KW/8.2KW',
              icon: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>'
            },
            { 
              label: 'РАЗМЕРЫ', 
              value: '5.6×2.6×3.2 м',
              icon: '<path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z"/>'
            },
            { 
              label: 'ОБЩИЙ ВЕС НЕТТО', 
              value: '4 тонны',
              icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>'
            }
          ],
          external_protection: 'Каркас конструкции из оцинкованной стали система|Алюминий с фторуглеродным напылением модуль корпуса из сплава|Теплоизоляция, водонепроницаемость и влагостойкая конструктивная система|Трехслойный полый закаленный стекло от пола до потолка|Стандартная распашная входная дверь',
          guest_control: 'Освещение/Электрические шторы|Интеллектуальная система контроля доступа для отелей',
          accessories: 'Опорные ножки совмещены по нижняя часть изделия|Подъемные кольца / Транспортировочные приспособления'
        },
        'g30-premium': {
          title: 'Модульный Дом G30 Premium',
          price: '$16,800',
          description: 'Премиальная версия модульного дома G30 предлагает улучшенное качество и расширенные возможности. Современный дизайн и передовые технологии создают идеальное пространство для комфортной жизни. Этот дом сочетает инновационные решения с практичностью, обеспечивая высокий уровень комфорта. Идеальный выбор для тех, кто ценит качество и стиль.',
          image: './media/catalog/G30-view.png',
          gallery: [
            './media/catalog/G30.webp',
            './media/catalog/G30-view.png',
            './media/catalog/G30-scaled.webp'
          ],
          characteristics: [
            { 
              label: 'ПЛОЩАДЬ', 
              value: '14.6 м²',
              icon: '<path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>'
            },
            { 
              label: 'ВМЕСТИМОСТЬ', 
              value: '2 чел.',
              icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
            },
            { 
              label: 'МОЩНОСТЬ', 
              value: '6.7KW/8.2KW',
              icon: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>'
            },
            { 
              label: 'РАЗМЕРЫ', 
              value: '5.6×2.6×3.2 м',
              icon: '<path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z"/>'
            },
            { 
              label: 'ОБЩИЙ ВЕС НЕТТО', 
              value: '4 тонны',
              icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>'
            }
          ],
          external_protection: 'Каркас конструкции из оцинкованной стали система|Алюминий с фторуглеродным напылением модуль корпуса из сплава|Теплоизоляция, водонепроницаемость и влагостойкая конструктивная система|Трехслойный полый закаленный стекло от пола до потолка|Стандартная распашная входная дверь',
          guest_control: 'Освещение/Электрические шторы|Интеллектуальная система контроля доступа для отелей',
          accessories: 'Опорные ножки совмещены по нижняя часть изделия|Подъемные кольца / Транспортировочные приспособления'
        },
        'g50': {
          title: 'Space Capsule House G50',
          price: '$18,500',
          description: 'Модель G50 представляет собой просторное решение премиум-класса для комфортной жизни. Увеличенная площадь и панорамное остекление создают ощущение свободы и простора. Этот модульный дом оснащен передовыми системами безопасности и комфорта, включая умное голосовое управление и панорамный балкон. Идеальный выбор для тех, кто ищет максимальный комфорт в компактном формате.',
          image: './media/catalog/G50-view.jpg',
          gallery: [
            './media/catalog/G50-interer.webp',
            './media/catalog/G50-view.jpg',
            './media/catalog/G50.png'
          ],
          characteristics: [
            { 
              label: 'ПЛОЩАДЬ', 
              value: '31.4 м²',
              icon: '<path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>'
            },
            { 
              label: 'ВМЕСТИМОСТЬ', 
              value: '2 чел.',
              icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>'
            },
            { 
              label: 'МОЩНОСТЬ', 
              value: '7.5KW/12KW',
              icon: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>'
            },
            { 
              label: 'РАЗМЕРЫ', 
              value: '9.5×3.3×3.2 м',
              icon: '<path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v10H7V7z"/>'
            },
            { 
              label: 'ОБЩИЙ ВЕС НЕТТО', 
              value: '6.5 тонны',
              icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>'
            }
          ],
          external_protection: 'Каркас конструкции из оцинкованной стали система|Алюминий с фторуглеродным напылением модуль корпуса из сплава|Теплоизоляция, водонепроницаемость и влагостойкая конструктивная система|Трехслойный полый закаленный стекло от пола до потолка|Стандартная распашная входная дверь|Качели из окрашенной нержавеющей стали входная дверь|Панорамный балкон',
          guest_control: 'Освещение/Электрические шторы|Интеллектуальная система контроля доступа для отелей|Умное голосовое управление',
          accessories: 'Опорные ножки совмещены по нижняя часть изделия|Подъемные кольца / Транспортировочные приспособления'
        }
      };
      
      const product = productData[productId] || productData['g30'];
      
      // Store current product ID for language switching
      window.currentProductId = productId;
      
      // Get current language
      const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'ru';
      const t = window.translations && window.translations[lang] ? window.translations[lang] : window.translations.ru;
      
      // Update modal content
      const titleElement = document.getElementById('productModalTitle');
      const priceElement = document.getElementById('productModalPrice');
      const descriptionElement = document.getElementById('productModalDescription');
      const imageElement = document.getElementById('productModalImage');
      const characteristicsElement = document.getElementById('productModalCharacteristics');
      const prevBtn = document.getElementById('productPrevBtn');
      const nextBtn = document.getElementById('productNextBtn');
      
      // Use translated title
      if (titleElement) {
        const titleKey = `product.${productId}.title`;
        titleElement.textContent = t[titleKey] || product.title;
      }
      if (priceElement) priceElement.textContent = product.price;
      // Use translated description
      if (descriptionElement) {
        const descKey = `product.${productId}.description`;
        descriptionElement.textContent = t[descKey] || product.description;
      }
      
      // Handle product gallery or single image
      if (product.gallery && product.gallery.length > 1) {
        // Product has gallery - setup gallery navigation
        currentProductGallery = product.gallery;
        currentProductGalleryIndex = 0;
        
        console.log('Product has gallery:', currentProductGallery);
        
        if (imageElement) {
          imageElement.src = currentProductGallery[0];
          imageElement.alt = product.title;
        }
        
        // Show navigation arrows
        if (prevBtn) {
          prevBtn.classList.remove('hidden');
          prevBtn.classList.add('flex');
        }
        if (nextBtn) {
          nextBtn.classList.remove('hidden');
          nextBtn.classList.add('flex');
        }
        
        updateProductGalleryImage(0);
      } else {
        // Product has single image
        currentProductGallery = [];
        currentProductGalleryIndex = 0;
        
        console.log('Product has single image');
        
        if (imageElement) {
          imageElement.src = product.image;
          imageElement.alt = product.title;
        }
        
        // Hide navigation arrows
        if (prevBtn) {
          prevBtn.classList.add('hidden');
          prevBtn.classList.remove('flex');
        }
        if (nextBtn) {
          nextBtn.classList.add('hidden');
          nextBtn.classList.remove('flex');
        }
      }
      
      if (characteristicsElement) {
        const characteristics = product.characteristics;
        let html = '';
        
        // Map for characteristic label keys
        const labelKeys = {
          'ПЛОЩАДЬ': 'modal.product.area',
          'ВМЕСТИМОСТЬ': 'modal.product.capacity',
          'МОЩНОСТЬ': 'modal.product.power',
          'РАЗМЕРЫ': 'modal.product.dimensions',
          'ОБЩИЙ ВЕС НЕТТО': 'modal.product.weight'
        };
        
        // Первые 4 характеристики
        for (let i = 0; i < 4; i++) {
          const char = characteristics[i];
          const translatedLabel = t[labelKeys[char.label]] || char.label;
          html += `
            <div class="bg-gray-800 rounded-xl p-2 sm:p-4 border border-gray-700">
              <div class="flex items-center mb-1 sm:mb-3">
                <div class="w-5 h-5 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-1 sm:mr-3">
                  <svg class="w-3 h-3 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    ${char.icon}
                  </svg>
                </div>
                <span class="text-gray-400 text-xs sm:text-sm font-medium">${translatedLabel}</span>
              </div>
              <div class="text-white text-xs sm:text-xl font-bold">${char.value}</div>
            </div>
          `;
        }
        
        // Последняя характеристика (Общий вес нетто) - центрированная
        if (characteristics[4]) {
          const char = characteristics[4];
          const translatedLabel = t[labelKeys[char.label]] || char.label;
          html += `
            <div class="bg-gray-800 rounded-xl p-2 sm:p-4 border border-gray-700 col-span-2 mx-auto max-w-xs">
              <div class="flex items-center mb-1 sm:mb-3">
                <div class="w-5 h-5 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center mr-1 sm:mr-3">
                  <svg class="w-3 h-3 sm:w-5 sm:h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                    ${char.icon}
                  </svg>
                </div>
                <span class="text-gray-400 text-xs sm:text-sm font-medium">${translatedLabel}</span>
              </div>
              <div class="text-white text-xs sm:text-xl font-bold">${char.value}</div>
            </div>
          `;
        }
        
        characteristicsElement.innerHTML = html;
      }
      
      // Update additional systems
      updateAdditionalSystems(product);
    }
  
    // Function to update additional systems
    function updateAdditionalSystems(product) {
      // Get current language
      const lang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'ru';
      const t = window.translations && window.translations[lang] ? window.translations[lang] : window.translations.ru;
      
      // External Protection Systems
      const externalProtectionSection = document.getElementById('externalProtectionSection');
      const externalProtectionList = document.getElementById('externalProtectionList');
      
      if (product.external_protection && product.external_protection.trim()) {
        const items = product.external_protection.split('|').filter(item => item.trim());
        if (items.length > 0) {
          // Map items to their translation keys
          const itemTranslations = items.map((item, index) => {
            const key = `system.protection.${index + 1}`;
            return t[key] || item.trim();
          });
          
          externalProtectionList.innerHTML = itemTranslations.map(item => 
            `<li class="flex items-center text-gray-300">
              <i class="ri-shield-check-line text-primary mr-2"></i>
              <span>${item}</span>
            </li>`
          ).join('');
          externalProtectionSection.style.display = 'block';
        } else {
          externalProtectionSection.style.display = 'none';
        }
      } else {
        externalProtectionSection.style.display = 'none';
      }
      
      // Guest Control Systems
      const guestControlSection = document.getElementById('guestControlSection');
      const guestControlList = document.getElementById('guestControlList');
      
      if (product.guest_control && product.guest_control.trim()) {
        const items = product.guest_control.split('|').filter(item => item.trim());
        if (items.length > 0) {
          // Map items to their translation keys
          const itemTranslations = items.map((item, index) => {
            const key = `system.control.${index + 1}`;
            return t[key] || item.trim();
          });
          
          guestControlList.innerHTML = itemTranslations.map(item => 
            `<li class="flex items-center text-gray-300">
              <i class="ri-user-settings-line text-primary mr-2"></i>
              <span>${item}</span>
            </li>`
          ).join('');
          guestControlSection.style.display = 'block';
        } else {
          guestControlSection.style.display = 'none';
        }
      } else {
        guestControlSection.style.display = 'none';
      }
      
      // Product Accessories
      const accessoriesSection = document.getElementById('accessoriesSection');
      const accessoriesList = document.getElementById('accessoriesList');
      
      if (product.accessories && product.accessories.trim()) {
        const items = product.accessories.split('|').filter(item => item.trim());
        if (items.length > 0) {
          // Map items to their translation keys
          const itemTranslations = items.map((item, index) => {
            const key = `system.accessories.${index + 1}`;
            return t[key] || item.trim();
          });
          
          accessoriesList.innerHTML = itemTranslations.map(item => 
            `<li class="flex items-center text-gray-300">
              <i class="ri-tools-line text-primary mr-2"></i>
              <span>${item}</span>
            </li>`
          ).join('');
          accessoriesSection.style.display = 'block';
        } else {
          accessoriesSection.style.display = 'none';
        }
      } else {
        accessoriesSection.style.display = 'none';
      }
    }
  
    // Make functions globally available
    window.smoothScrollTo = smoothScrollTo;
    window.updateAdditionalSystems = updateAdditionalSystems;
    window.updateProductModalContent = updateProductModalContent;
  
    // ========================================
    // НОВАЯ ПРОСТАЯ СИСТЕМА МОДАЛЬНЫХ ОКОН
    // ========================================
    
    // Глобальная переменная для текущего модального окна
    let activeModal = null;
  
    // Основная функция открытия модального окна
    function openModal(modalId) {
      console.log('Opening modal:', modalId);
      
      // Закрываем все открытые модальные окна
      closeAllModals();
      
      const modal = document.getElementById(modalId);
      if (modal) {
        activeModal = modalId;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        console.log('Modal opened successfully:', modalId);
      } else {
        console.error('Modal not found:', modalId);
      }
    }
  
    // Основная функция закрытия модального окна
    function closeModal(modalId) {
      console.log('Closing modal:', modalId);
      
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        activeModal = null;
        console.log('Modal closed successfully:', modalId);
      }
    }
  
    // Закрыть все модальные окна
    function closeAllModals() {
      const modals = ['orderModal', 'productModal', 'galleryModal', 'structureModal'];
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && !modal.classList.contains('hidden')) {
          closeModal(modalId);
        }
      });
    }
  
    // Обработчик клавиши Escape
    function handleEscapeKey(event) {
      if (event.key === 'Escape' && activeModal) {
        closeModal(activeModal);
      }
    }
  
    // Специфичные функции для разных типов модальных окон
    function openOrderModal() {
      openModal('orderModal');
    }
  
    function openProductModal(productId = 'g30') {
      openModal('productModal');
      // Обновляем контент продукта если нужно
      if (productId) {
        updateProductModalContent(productId);
      }
    }
  
    function openGalleryModal(index = 0) {
      openModal('galleryModal');
      updateGalleryImage(index);
    }
  
    function openStructureModal() {
      openModal('structureModal');
    }
  
    // Функции для галереи
    let currentGalleryIndex = 0;
    const galleryImages = [
      './media/gallery/1photo.JPG',
      './media/gallery/2phot.jpg', 
      './media/gallery/3phot.jpg',
      './media/gallery/4photo.jpg',
      './media/gallery/5phot.JPG'
    ];

    function updateGalleryImage(index) {
      currentGalleryIndex = index;
      const image = document.getElementById('galleryModalImage');
      const counter = document.getElementById('galleryCounter');
      
      if (image && galleryImages[currentGalleryIndex]) {
        image.src = galleryImages[currentGalleryIndex];
      }
      
      if (counter) {
        counter.textContent = `${currentGalleryIndex + 1} / ${galleryImages.length}`;
      }
    }

    function nextGalleryImage() {
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
      updateGalleryImage(currentGalleryIndex);
    }

    function prevGalleryImage() {
      currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
      updateGalleryImage(currentGalleryIndex);
    }

    // Функции для галереи продуктов
    let currentProductGallery = [];
    let currentProductGalleryIndex = 0;

    function updateProductGalleryImage(index) {
      if (currentProductGallery.length === 0) return;
      
      currentProductGalleryIndex = index;
      const image = document.getElementById('productModalImage');
      
      if (image && currentProductGallery[currentProductGalleryIndex]) {
        image.src = currentProductGallery[currentProductGalleryIndex];
        console.log('Updated product gallery image to:', currentProductGallery[currentProductGalleryIndex]);
      }
    }

    function nextProductGalleryImage() {
      if (currentProductGallery.length === 0) return;
      currentProductGalleryIndex = (currentProductGalleryIndex + 1) % currentProductGallery.length;
      console.log('Next image, index:', currentProductGalleryIndex);
      updateProductGalleryImage(currentProductGalleryIndex);
    }

    function prevProductGalleryImage() {
      if (currentProductGallery.length === 0) return;
      currentProductGalleryIndex = (currentProductGalleryIndex - 1 + currentProductGallery.length) % currentProductGallery.length;
      console.log('Prev image, index:', currentProductGalleryIndex);
      updateProductGalleryImage(currentProductGalleryIndex);
    }
  
    // Функция для перехода от продукта к заказу
    function openOrderForm(productId) {
      closeModal('productModal');
      setTimeout(() => {
        openOrderModal();
        // Предзаполняем форму
        const modelSelect = document.querySelector('select[name="model"]');
        if (modelSelect) {
          modelSelect.value = productId;
        }
      }, 100);
    }
  
    // Делаем функции глобально доступными
    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openOrderModal = openOrderModal;
    window.openProductModal = openProductModal;
    window.openGalleryModal = openGalleryModal;
    window.openStructureModal = openStructureModal;
    window.openOrderForm = openOrderForm;
    window.nextGalleryImage = nextGalleryImage;
    window.prevGalleryImage = prevGalleryImage;
    window.nextProductGalleryImage = nextProductGalleryImage;
    window.prevProductGalleryImage = prevProductGalleryImage;
  
    // ========================================
    // ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ МОДАЛЬНЫХ ОКОН
    // ========================================
    
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Initializing modal system...');
      
      // Добавляем обработчик Escape
      document.addEventListener('keydown', handleEscapeKey);
      
      // Настраиваем обработчики для кнопок закрытия
      const closeButtons = [
        { id: 'closeModal', modal: 'orderModal' },
        { id: 'closeProductModal', modal: 'productModal' },
        { id: 'closeGalleryModal', modal: 'galleryModal' },
        { id: 'closeStructureModal', modal: 'structureModal' }
      ];
      
      closeButtons.forEach(button => {
        const element = document.getElementById(button.id);
        if (element) {
          element.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeModal(button.modal);
          });
        }
      });
      
      // Настраиваем обработчики для клика по фону
      const modals = ['orderModal', 'productModal', 'galleryModal', 'structureModal'];
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.addEventListener('click', function(e) {
            if (e.target === modal) {
              closeModal(modalId);
            }
          });
        }
      });
      
      // Настраиваем триггеры для открытия модальных окон
      // Галерея
      document.querySelectorAll('[data-modal="gallery"]').forEach(element => {
        element.addEventListener('click', function(e) {
          e.preventDefault();
          const index = parseInt(this.getAttribute('data-gallery-index') || '0');
          openGalleryModal(index);
        });
      });
      
      // Продукты
      document.querySelectorAll('[data-modal="product"]').forEach(element => {
        element.addEventListener('click', function(e) {
          e.preventDefault();
          const productId = this.getAttribute('data-product-id') || 'g30';
          openProductModal(productId);
        });
      });
      
      // Структура
      document.querySelectorAll('[data-modal="structure"]').forEach(element => {
        element.addEventListener('click', function(e) {
          e.preventDefault();
          openStructureModal();
        });
      });
      
      // Кнопки заказа (теперь работают как ссылки, обработчики не нужны)
      // Все кнопки "Получить консультацию" и "Получить расчет" теперь ведут напрямую к #contact
      
      // Кнопка "Оставить заявку" в модальном окне продукта
      const orderFormBtn = document.getElementById('orderFormBtn');
      if (orderFormBtn) {
        orderFormBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const productId = this.getAttribute('data-product-id') || 'g30';
          openOrderForm(productId);
        });
      }
      
      // Навигация галереи
      const galleryPrevBtn = document.getElementById('galleryPrevBtn');
      const galleryNextBtn = document.getElementById('galleryNextBtn');
      
      if (galleryPrevBtn) {
        // Обработчик клика
        galleryPrevBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          prevGalleryImage();
        });
        
        // Обработчик touch для мобильных
        galleryPrevBtn.addEventListener('touchend', function(e) {
          e.preventDefault();
          e.stopPropagation();
          prevGalleryImage();
        });
      }
      
      if (galleryNextBtn) {
        // Обработчик клика
        galleryNextBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          nextGalleryImage();
        });
        
        // Обработчик touch для мобильных
        galleryNextBtn.addEventListener('touchend', function(e) {
          e.preventDefault();
          e.stopPropagation();
          nextGalleryImage();
        });
      }
      
      // Навигация галереи продуктов
      const productPrevBtn = document.getElementById('productPrevBtn');
      const productNextBtn = document.getElementById('productNextBtn');
      
      if (productPrevBtn) {
        productPrevBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          prevProductGalleryImage();
        });
        
        productPrevBtn.addEventListener('touchend', function(e) {
          e.preventDefault();
          e.stopPropagation();
          prevProductGalleryImage();
        });
      }
      
      if (productNextBtn) {
        productNextBtn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          nextProductGalleryImage();
        });
        
        productNextBtn.addEventListener('touchend', function(e) {
          e.preventDefault();
          e.stopPropagation();
          nextProductGalleryImage();
        });
      }
      
      console.log('Modal system initialized successfully');
    });
  
    // ========================================
    // СИСТЕМА reCAPTCHA v2 И ВАЛИДАЦИИ ФОРМЫ
    // ========================================
    
    // Функция для проверки reCAPTCHA
    function verifyRecaptcha() {
      const response = grecaptcha.getResponse();
      return response.length > 0;
    }
    
    // Валидация формы
    function validateForm(formData) {
      const errors = [];
      
      // Проверка обязательных полей
      const requiredFields = ['lastName', 'firstName', 'houseModel', 'deliveryCountry', 'whatsapp', 'telegram', 'email'];
      
      requiredFields.forEach(field => {
        if (!formData.get(field) || formData.get(field).trim() === '') {
          errors.push(`Поле "${getFieldLabel(field)}" обязательно для заполнения`);
        }
      });
      
      // Проверка email
      const email = formData.get('email');
      if (email && !isValidEmail(email)) {
        errors.push('Некорректный формат email');
      }
      
      // Проверка reCAPTCHA
      if (!verifyRecaptcha()) {
        errors.push('Пожалуйста, подтвердите, что вы не робот');
      }
      
      // Проверка WhatsApp (должен содержать только цифры и +)
      const whatsapp = formData.get('whatsapp');
      if (whatsapp && !isValidPhone(whatsapp)) {
        errors.push('Некорректный формат номера WhatsApp');
      }
      
      return errors;
    }
    
    // Получение названия поля для ошибок
    function getFieldLabel(fieldName) {
      const labels = {
        'lastName': 'Фамилия',
        'firstName': 'Имя',
        'houseModel': 'Модель дома',
        'deliveryCountry': 'Страна доставки',
        'whatsapp': 'WhatsApp',
        'telegram': 'Telegram',
        'email': 'Email'
      };
      return labels[fieldName] || fieldName;
    }
    
    // Валидация email
    function isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
    
    // Валидация телефона
    function isValidPhone(phone) {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
      return phoneRegex.test(phone) && phone.replace(/[\s\-\(\)]/g, '').length >= 10;
    }
    
    // Показ ошибок
    function showErrors(errors) {
      // Удаляем предыдущие ошибки
      const existingErrors = document.querySelectorAll('.form-error');
      existingErrors.forEach(error => error.remove());
      
      // Показываем новые ошибки
      const form = document.getElementById('contactForm');
      if (form && errors.length > 0) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'bg-red-900 border border-red-500 text-red-100 px-4 py-3 rounded mb-4';
        errorContainer.innerHTML = `
          <div class="font-bold mb-2">Ошибки в форме:</div>
          <ul class="list-disc list-inside">
            ${errors.map(error => `<li>${error}</li>`).join('')}
          </ul>
        `;
        form.insertBefore(errorContainer, form.firstChild);
        
        // Прокручиваем к ошибкам
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    
    // Обработка отправки формы
    function handleFormSubmit(e) {
      e.preventDefault();
      
      const form = e.target;
      const formData = new FormData(form);
      
      // Валидация
      const errors = validateForm(formData);
      
      if (errors.length > 0) {
        showErrors(errors);
        return false;
      }
      
      // Если валидация прошла успешно
      console.log('Форма валидна, данные:', Object.fromEntries(formData));
      
      // Здесь можно добавить отправку данных на сервер
      alert('Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.');
      
      // Очистка формы
      form.reset();
      grecaptcha.reset();
      
      // Удаление ошибок
      const existingErrors = document.querySelectorAll('.form-error');
      existingErrors.forEach(error => error.remove());
    }
    
    // Инициализация системы reCAPTCHA и валидации
    document.addEventListener('DOMContentLoaded', function() {
      // Настраиваем обработчик формы
      const contactForm = document.getElementById('contactForm');
      if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
      }
    });
  
    // Burger menu
    document.addEventListener('DOMContentLoaded', function () {
      const burgerToggle = document.getElementById('burgerToggle');
      const mobileNav = document.getElementById('mobileNav');
    
      burgerToggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
        burgerToggle.classList.toggle('open');
      });
    
      document.addEventListener('click', function (e) {
        if (!burgerToggle.contains(e.target) && !mobileNav.contains(e.target)) {
          mobileNav.classList.remove('open');
          burgerToggle.classList.remove('open');
        }
      });
    });
    
  // Scroll animation
  document.addEventListener('DOMContentLoaded', function () {
    const elements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach(element => observer.observe(element));
  });
  
  // Catalog Slider
  document.addEventListener('DOMContentLoaded', function () {
    const sliderContainer = document.querySelector('.catalog-slider-container');
    const prevBtn = document.getElementById('catalogPrevBtn');
    const nextBtn = document.getElementById('catalogNextBtn');
    const cards = document.querySelectorAll('.catalog-card');
    const indicators = document.querySelectorAll('.catalog-indicator');
    
    console.log('Найдено карточек в каталоге:', cards.length);
    console.log('Найдено индикаторов:', indicators.length);
    
    if (sliderContainer && prevBtn && nextBtn && cards.length > 0) {
      // Add smooth scrolling
      sliderContainer.style.scrollBehavior = 'smooth';
      
      // Calculate scroll amount based on card width + gap
      function getScrollAmount() {
        const card = cards[0];
        const cardWidth = card.offsetWidth;
        const gap = 32; // 2rem = 32px
        return cardWidth + gap;
      }
      
      // Update active indicator based on scroll position
      function updateIndicators() {
        const scrollAmount = getScrollAmount();
        const currentIndex = Math.round(sliderContainer.scrollLeft / scrollAmount);
        
        indicators.forEach((indicator, index) => {
          if (index === currentIndex) {
            indicator.classList.add('active');
          } else {
            indicator.classList.remove('active');
          }
        });
      }
      
      // Next button click
      nextBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        sliderContainer.scrollLeft += scrollAmount;
      });
      
      // Previous button click
      prevBtn.addEventListener('click', () => {
        const scrollAmount = getScrollAmount();
        sliderContainer.scrollLeft -= scrollAmount;
      });
      
      // Indicator click navigation
      indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
          const scrollAmount = getScrollAmount();
          sliderContainer.scrollLeft = scrollAmount * index;
        });
      });
      
      // Update button visibility based on scroll position
      function updateButtons() {
        const maxScroll = sliderContainer.scrollWidth - sliderContainer.clientWidth;
        
        // Hide/show prev button
        if (sliderContainer.scrollLeft <= 0) {
          prevBtn.style.opacity = '0.5';
          prevBtn.style.pointerEvents = 'none';
        } else {
          prevBtn.style.opacity = '1';
          prevBtn.style.pointerEvents = 'auto';
        }
        
        // Hide/show next button
        if (sliderContainer.scrollLeft >= maxScroll - 5) {
          nextBtn.style.opacity = '0.5';
          nextBtn.style.pointerEvents = 'none';
        } else {
          nextBtn.style.opacity = '1';
          nextBtn.style.pointerEvents = 'auto';
        }
      }
      
      // Listen to scroll events
      sliderContainer.addEventListener('scroll', () => {
        updateButtons();
        updateIndicators();
      });
      
      // Initial state
      updateButtons();
      updateIndicators();
      
      // Update on window resize
      window.addEventListener('resize', () => {
        updateButtons();
        updateIndicators();
      });
      
      // Drag-to-scroll functionality for desktop
      let isDown = false;
      let startX;
      let scrollLeft;
  
      sliderContainer.addEventListener('mousedown', (e) => {
        isDown = true;
        sliderContainer.style.cursor = 'grabbing';
        startX = e.pageX - sliderContainer.offsetLeft;
        scrollLeft = sliderContainer.scrollLeft;
      });
  
      sliderContainer.addEventListener('mouseleave', () => {
        isDown = false;
        sliderContainer.style.cursor = 'grab';
      });
  
      sliderContainer.addEventListener('mouseup', () => {
        isDown = false;
        sliderContainer.style.cursor = 'grab';
      });
  
      sliderContainer.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderContainer.offsetLeft;
        const walk = (x - startX) * 2;
        sliderContainer.scrollLeft = scrollLeft - walk;
      });
      
      // Set initial cursor
      sliderContainer.style.cursor = 'grab';
      
      // Touch events for mobile swipe - snap to one card at a time
      let startTouchX = 0;
      let startScrollLeft = 0;
      let isScrolling = false;
  
      sliderContainer.addEventListener('touchstart', (e) => {
        startTouchX = e.touches[0].pageX;
        startScrollLeft = sliderContainer.scrollLeft;
        isScrolling = true;
      }, { passive: true });
  
      sliderContainer.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        // Allow native scroll behavior
      }, { passive: true });
  
      sliderContainer.addEventListener('touchend', (e) => {
        if (!isScrolling) return;
        isScrolling = false;
        
        // Calculate swipe direction and distance
        const touchX = e.changedTouches[0].pageX;
        const diff = startTouchX - touchX;
        const threshold = 50; // Minimum swipe distance in pixels
        
        if (Math.abs(diff) > threshold) {
          const scrollAmount = getScrollAmount();
          const currentIndex = Math.round(sliderContainer.scrollLeft / scrollAmount);
          
          if (diff > 0) {
            // Swipe left - go to next card
            sliderContainer.scrollLeft = scrollAmount * (currentIndex + 1);
          } else {
            // Swipe right - go to previous card
            sliderContainer.scrollLeft = scrollAmount * (currentIndex - 1);
          }
        } else {
          // Snap to nearest card if swipe was too small
          const scrollAmount = getScrollAmount();
          const currentIndex = Math.round(sliderContainer.scrollLeft / scrollAmount);
          sliderContainer.scrollLeft = scrollAmount * currentIndex;
        }
      }, { passive: true });
    }
  });
  
  // Fixed Image for Why Choose Us Section
  document.addEventListener('DOMContentLoaded', function() {
    const parallaxImage = document.querySelector('.parallax-image');
    
    if (parallaxImage) {
      console.log('Fixed image found, initializing...');
      
      // Handle image load success
      parallaxImage.addEventListener('load', function() {
        console.log('Image loaded successfully!');
        this.style.background = 'none';
      });
      
      // Handle image load error
      parallaxImage.addEventListener('error', function() {
        console.log('Image failed to load, using fallback');
        this.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        this.style.color = '#000';
        this.style.fontSize = '1.5rem';
        this.style.fontWeight = 'bold';
      });
      
      // Force image reload if needed
      setTimeout(() => {
        if (!parallaxImage.complete || parallaxImage.naturalHeight === 0) {
          console.log('Image not loaded, forcing reload...');
          const src = parallaxImage.src;
          parallaxImage.src = '';
          setTimeout(() => {
            parallaxImage.src = src;
          }, 100);
        }
      }, 1000);
    } else {
      console.log('Fixed image not found!');
    }
  });
  
  // Smooth Scroll Navigation
  document.addEventListener('DOMContentLoaded', function() {
    // Handle all navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href').substring(1);
        
        if (targetId) {
          // Close mobile menu if open
          const mobileNav = document.getElementById('mobileNav');
          const burgerToggle = document.getElementById('burgerToggle');
          
          if (mobileNav && mobileNav.classList.contains('open')) {
            mobileNav.classList.remove('open');
            burgerToggle.classList.remove('open');
          }
          
          // Smooth scroll to target
          smoothScrollTo(targetId);
        }
      });
    });
  });
    