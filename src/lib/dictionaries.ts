export type Language = 'UA' | 'EN' | 'RU' | 'BG';

export const dictionaries: Record<Language, any> = {
    UA: {
        header: {
            home: 'Головна',
            catalog: 'Каталог',
            collections: 'Колекції',
            about: 'Про нас',
            contacts: 'Контакти',
            search: 'Пошук...',
            cart: 'Кошик',
            profile: 'Мій кабінет',
            login: 'Увійти',
            logout: 'Вийти',
            show_all: 'Показати всі результати'
        },
        common: {
            price: 'Ціна',
            buy: 'Купити',
            details: 'Детальніше',
            add_to_cart: 'Додати в кошик',
            added: 'Додано',
            new: 'Новинка',
            sale: 'Розпродаж',
            bestsellers: 'Хіти продажу',
            currency: '₴'
        },
        filters: {
            all: 'Всі товари',
            sort: 'Сортування',
            price_asc: 'Від дешевих до дорогих',
            price_desc: 'Від дорогих до дешевих',
            newest: 'Новинки'
        },
        home: {
            hero: {
                title: 'СТВОРЮЄМО\nКОМФОРТ',
                subtitle: 'Архітектура вашого комфорту. Серії, що визначають простір.',
                button: 'Дивитись все'
            },
            featured: {
                title: 'Хіти продажу',
                subtitle: 'Найбільш затребувані моделі сезону'
            },
            collections: {
                title: 'Колекції',
                subtitle: 'Архітектура вашого комфорту. Серії, що визначають простір.'
            }
        },
        benefits: {
            subtitle: 'Філософія бренду',
            title_prefix: 'Чому обирають',
            items: [
                {
                    title: 'Преміальна якість',
                    description: 'Використання найкращих порід дерева та фурнітури від провідних світових виробників для створення вічних предметів інтер\'єру.'
                },
                {
                    title: 'Екологічні матеріали',
                    description: 'Ми дбаємо про здоров\'я вашої родини, використовуючи лише сертифіковані натуральні компоненти та безпечні покриття.'
                },
                {
                    title: 'Швидка доставка',
                    description: 'Власна логістична служба гарантує оперативність та цілісність доставки вашого замовлення безпосередньо до оселі.'
                },
                {
                    title: 'Власне виробництво',
                    description: 'Ми — прямий виробник, що дозволяє нам гарантувати найвищу якість продукції та запропонувати чесні ціни без переплат.'
                }
            ]
        },
        catalog: {
            title: 'Каталог меблів',
            subtitle: 'Ретельно підібрані мінімалістичні предмети для сучасного життя. Досліджуйте нашу колекцію архітектурних форм та натуральних матеріалів.',
            filters: {
                all: 'Всі товари',
                show_all: 'Показати всі',
                hide: 'Згорнути'
            },
            sort: {
                label: 'Сортувати:',
                new: 'Новинки',
                price_asc: 'Ціна ↑',
                price_desc: 'Ціна ↓'
            },
            empty: 'Товарів не знайдено.'
        }
    },
    EN: {
        header: {
            home: 'Home',
            catalog: 'Catalog',
            collections: 'Collections',
            about: 'About Us',
            contacts: 'Contacts',
            search: 'Search...',
            cart: 'Cart',
            profile: 'My Profile',
            login: 'Sign In',
            logout: 'Sign Out',
            show_all: 'Show all results'
        },
        common: {
            price: 'Price',
            buy: 'Buy',
            details: 'Details',
            add_to_cart: 'Add to Cart',
            added: 'Added',
            new: 'New',
            sale: 'Sale',
            bestsellers: 'Bestsellers',
            currency: 'UAH'
        },
        filters: {
            all: 'All Items',
            sort: 'Sort By',
            price_asc: 'Price: Low to High',
            price_desc: 'Price: High to Low',
            newest: 'Newest'
        },
        home: {
            hero: {
                title: 'CREATING\nCOMFORT',
                subtitle: 'Architecture of your comfort. Series that define space.',
                button: 'View All'
            },
            featured: {
                title: 'Bestsellers',
                subtitle: 'Most in-demand models of the season'
            },
            collections: {
                title: 'Collections',
                subtitle: 'Architecture of your comfort. Series that define space.'
            }
        },
        benefits: {
            subtitle: 'Brand Philosophy',
            title_prefix: 'Why choose',
            items: [
                {
                    title: 'Premium Quality',
                    description: 'Using the best wood species and fittings from leading world manufacturers to create timeless interior items.'
                },
                {
                    title: 'Eco Materials',
                    description: 'We care about your family\'s health using only certified natural components and safe coatings.'
                },
                {
                    title: 'Fast Delivery',
                    description: 'Our own logistics service guarantees speed and integrity of your order delivery directly to your home.'
                },
                {
                    title: 'In-house Production',
                    description: 'We are a direct manufacturer, allowing us to guarantee the highest product quality and offer fair prices without overpayments.'
                }
            ]
        },
        catalog: {
            title: 'Furniture Catalog',
            subtitle: 'Carefully selected minimalist items for modern life. Explore our collection of architectural forms and natural materials.',
            filters: {
                all: 'All Products',
                show_all: 'Show All',
                hide: 'Hide'
            },
            sort: {
                label: 'Sort by:',
                new: 'Newest',
                price_asc: 'Price ↑',
                price_desc: 'Price ↓'
            },
            empty: 'No products found.'
        }
    },
    RU: {
        header: {
            home: 'Главная',
            catalog: 'Каталог',
            collections: 'Коллекции',
            about: 'О нас',
            contacts: 'Контакты',
            search: 'Поиск...',
            cart: 'Корзина',
            profile: 'Мой кабинет',
            login: 'Войти',
            logout: 'Выйти',
            show_all: 'Показать все результаты'
        },
        common: {
            price: 'Цена',
            buy: 'Купить',
            details: 'Подробнее',
            add_to_cart: 'В корзину',
            added: 'Добавлено',
            new: 'Новинка',
            sale: 'Распродажа',
            bestsellers: 'Хиты продаж',
            currency: '₴'
        },
        filters: {
            all: 'Все товары',
            sort: 'Сортировка',
            price_asc: 'От дешевых к дорогим',
            price_desc: 'От дорогих к дешевым',
            newest: 'Новинки'
        },
        home: {
            hero: {
                title: 'СОЗДАЕМ\nКОМФОРТ',
                subtitle: 'Архитектура вашего комфорта. Серии, определяющие пространство.',
                button: 'Смотреть все'
            },
            featured: {
                title: 'Хиты продаж',
                subtitle: 'Самые востребованные модели сезона'
            },
            collections: {
                title: 'Коллекции',
                subtitle: 'Архитектура вашего комфорта. Серии, определяющие пространство.'
            }
        },
        benefits: {
            subtitle: 'Философия бренда',
            title_prefix: 'Почему выбирают',
            items: [
                {
                    title: 'Премиальное качество',
                    description: 'Использование лучших пород дерева и фурнитуры от ведущих мировых производителей для создания вечных предметов интерьера.'
                },
                {
                    title: 'Экологичные материалы',
                    description: 'Мы заботимся о здоровье вашей семьи, используя только сертифицированные натуральные компоненты и безопасные покрытия.'
                },
                {
                    title: 'Быстрая доставка',
                    description: 'Собственная логистическая служба гарантирует оперативность и целостность доставки вашего заказа непосредственно к дому.'
                },
                {
                    title: 'Собственное производство',
                    description: 'Мы — прямой производитель, что позволяет нам гарантировать высочайшее качество продукции и предложить честные цены без переплат.'
                }
            ]
        },
        catalog: {
            title: 'Каталог мебели',
            subtitle: 'Тщательно подобранные минималистичные предметы для современной жизни. Исследуйте нашу коллекцию архитектурных форм и натуральных материалов.',
            filters: {
                all: 'Все товары',
                show_all: 'Показать все',
                hide: 'Свернуть'
            },
            sort: {
                label: 'Сортировать:',
                new: 'Новинки',
                price_asc: 'Цена ↑',
                price_desc: 'Цена ↓'
            },
            empty: 'Товаров не найдено.'
        }
    },
    BG: {
        header: {
            home: 'Начало',
            catalog: 'Каталог',
            collections: 'Колекции',
            about: 'За нас',
            contacts: 'Контакти',
            search: 'Търсене...',
            cart: 'Количка',
            profile: 'Моят профил',
            login: 'Вход',
            logout: 'Изход',
            show_all: 'Покажи всички резултати'
        },
        common: {
            price: 'Цена',
            buy: 'Купи',
            details: 'Детайли',
            add_to_cart: 'Добави в количката',
            added: 'Добавено',
            new: 'Ново',
            sale: 'Разпродажба',
            bestsellers: 'Най-продавани',
            currency: 'UAH'
        },
        filters: {
            all: 'Всички стоки',
            sort: 'Сортиране',
            price_asc: 'Цена: Ниска към Висока',
            price_desc: 'Цена: Висока към Ниска',
            newest: 'Най-нови'
        },
        home: {
            hero: {
                title: 'СЪЗДАВАМЕ\nКОМФОРТ',
                subtitle: 'Архитектура на вашия комфорт. Серии, които определят пространството.',
                button: 'Виж всички'
            },
            featured: {
                title: 'Най-продавани',
                subtitle: 'Най-търсените модели за сезона'
            },
            collections: {
                title: 'Колекции',
                subtitle: 'Архитектура на вашия комфорт. Серии, които определят пространството.'
            }
        },
        benefits: {
            subtitle: 'Философия на марката',
            title_prefix: 'Защо избират',
            items: [
                {
                    title: 'Премиум качество',
                    description: 'Използване на най-добрите дървесни видове и обков от водещи световни производители за създаване на вечни интериорни предмети.'
                },
                {
                    title: 'Еко материали',
                    description: 'Ние се грижим за здравето на вашето семейство, използвайки само сертифицирани естествени компоненти и безопасни покрития.'
                },
                {
                    title: 'Бърза доставка',
                    description: 'Собствената логистическая служба гарантира бързина и цялост на доставката на вашата поръчка директно до дома.'
                },
                {
                    title: 'Собствено производство',
                    description: 'Ние сме директен производител, което ни позволява да гарантираме най-високо качество на продукцията и да предложим честни цени без надплащане.'
                }
            ]
        },
        catalog: {
            title: 'Каталог мебели',
            subtitle: 'Внимателно подбрани минималистични предмети за съвременния живот. Разгледайте нашата колекция от архитектурни форми и естествени материали.',
            filters: {
                all: 'Всички продукти',
                show_all: 'Покажи всички',
                hide: 'Скрий'
            },
            sort: {
                label: 'Сортиране:',
                new: 'Нови',
                price_asc: 'Цена ↑',
                price_desc: 'Цена ↓'
            },
            empty: 'Няма намерени продукти.'
        }
    }
};
