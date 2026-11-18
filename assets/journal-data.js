/* ELARIE — рубрики журналу і картка статті */
import { esc, safeUrl } from './fb.js';

const S = (o) => Object.entries(o);
export const CATS = [
  { id: 'psychology', title: 'Психологія', note: 'Стосунки, самооцінка, тривожність і книги, що допомагають', subs: S({ books: 'Книги', relations: 'Стосунки', child: 'Психологія дитини', personal: 'Особиста психологія', selfesteem: 'Самооцінка', burnout: 'Тривожність' }) },
  { id: 'health', title: "Здоров'я", note: 'Жіноче здоровʼя, сон, стрес, рух і догляд за собою', subs: S({ womens: "Жіноче здоров'я", vitamins: 'Вітаміни', sleep: 'Сон', stress: 'Стрес', fitness: 'Тренування', beauty: 'Догляд за собою', psychology: 'Психологія' }) },
  { id: 'moms', title: 'Для мам', note: 'Куди піти з дитиною, гуртки, розвиток і лайфхаки', subs: S({ 'kids-places': 'Куди піти з дитиною', clubs: 'Гуртки та секції', development: 'Розвиток дитини', lifehacks: 'Лайфхаки', newmom: 'Поради молодим мамам' }) },
  { id: 'forme', title: 'Для мене', note: 'Книги, серіали, кіно, концерти та атмосферні місця', subs: S({ books: 'Книги', series: 'Серіали', movies: 'Кіно', concerts: 'Концерти', rest: 'Відпочинок', places: 'Атмосферні місця', inspiration: 'Натхнення' }) },
  { id: 'cooking', title: 'Кулінарія', note: 'Швидкі, святкові й бюджетні рецепти та калькулятор БЖУ', subs: S({ quick: 'Швидкі рецепти', baking: 'Випічка', desserts: 'Десерти', festive: 'Святкові страви', budget: 'Бюджетне меню', kids: 'Страви для дітей' }) },
  { id: 'money', title: 'Гроші та розвиток', note: 'Бюджет, заощадження, корисні додатки і власна справа', subs: S({ budget: 'Сімейний бюджет', save: 'Як економити', savings: 'Заощадження', apps: 'Корисні додатки', business: 'Власна справа', stories: 'Історії успіху' }) },
  { id: 'hobby', title: 'Хобі та творчість', note: 'Малювання, handmade, вишивка, декор і фото', subs: S({ drawing: 'Малювання', handmade: 'Handmade', embroidery: 'Вишивка', decor: 'Декор дому', photo: 'Фотографія', games: 'Настільні ігри', gifts: 'Ідеї подарунків' }) },
  { id: 'travel', title: 'Подорожі', note: 'Міста, країни, готелі й бюджетні мандрівки', subs: S({ road: 'Дорога', hotels: 'Готелі', restaurants: 'Ресторани', cities: 'Міста', countries: 'Країни', beach: 'Пляжі', lifehacks: 'Лайфхаки', budget: 'Бюджет' }) },
  { id: 'holidays', title: 'Свята', note: 'Ідеї до днів народження, весіль і зимових свят', subs: S({ birthday: 'День народження', wedding: 'Весілля', march8: '8 Березня', motherday: 'День матері', mykola: 'Миколая', newyear: 'Новий рік', christmas: 'Різдво' }) },
  { id: 'rights', title: 'Права та безпека', note: 'Права жінок і дітей, допомога і гарячі лінії', subs: S({ womens: 'Права жінок', children: 'Права дитини', violence: 'Домашнє насильство', divorce: 'Розлучення', labor: 'Трудові права', discrimination: 'Дискримінація', legal: 'Безкоштовна допомога', bullying: 'Переслідування' }) },
  { id: 'news', title: 'Новини', note: 'Жіночі, культурні та корисні новини', subs: S({ general: 'Загальні', women: 'Жіночі', psychology: 'Психологія', health: "Здоров'я", moms: 'Для мам', culture: 'Культура' }) },
  { id: 'volunteer', title: 'Волонтерство', note: 'Актуальні збори, звіти і перевірені фонди', subs: S({ collections: 'Актуальні збори', military: 'Допомога військовим', medical: 'Медична допомога', cars: 'Авто для ЗСУ', drones: 'Дрони та РЕБ', clothes: 'Одяг та амуніція', food: 'Гуманітарна допомога', animals: 'Тварини', news: 'Звіти та новини' }) },
  { id: 'promo', title: 'Must Have', note: 'Рекомендації: beauty, fashion, заклади, курси і подарунки', subs: S({ beauty: 'Beauty', fashion: 'Fashion', cafes: 'Заклади', gifts: 'Подарунки', handmade: 'Handmade', courses: 'Курси', psychology: 'Психологія', sweets: 'Смаколики', rest: 'Відпочинок', shops: 'Магазини' }) },
];
export const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
export const subLabel = (cat, sub) => (CAT[cat]?.subs.find(([k]) => k === sub) || [])[1] || '';

export function cardHTML(a, i = 0) {
  const cover = safeUrl(a.coverImageUrl || a.imageUrl);
  const label = subLabel(a.category, a.subcategory) || CAT[a.category]?.title || '';
  return `<button class="card rv" style="--d:${(i % 3) * 0.08}s" data-id="${esc(a.id)}" data-cat="${esc(a.category)}">
    <div class="card-img v${CATS.findIndex((c) => c.id === a.category) % 4}">${cover ? `<img src="${cover}" alt="" loading="lazy" onerror="this.nextElementSibling.hidden=false;this.remove()">` : ''}<div class="ph" ${cover ? 'hidden' : ''}><span>${esc(CAT[a.category]?.title || 'Журнал')}</span><img src="assets/logo.svg" alt=""></div>${label ? `<span class="tag">${esc(label)}</span>` : ''}</div>
    <h3>${esc(a.title)}</h3>
    ${a.excerpt ? `<p>${esc(a.excerpt)}</p>` : ''}
    <span class="more">Читати</span>
  </button>`;
}
