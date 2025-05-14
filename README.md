Пакет для синхронизации сайт Tilda.cc с проектом на Node.js.

# 05.2025: новая major-версия — v2
1. TypeScript
2. Багфиксинг
3. Рефакторинг, оптимизация
4. Актуализация документации

> [!IMPORTANT]
> Важно! Ошибки при запросах к Тильде теперь выбрасывают исключение вместо объекта `{success: false, details: "...."}`. Остальные изменения совместимы с v1.

# Что позволяет сделать?
1. Импортировать сайт из Тильды → в ваш проект на Node.js. Таким образом, на одном домене может быть и лендинг/маркетинг-сайт (`/`, `/about`, `/prices`) и веб-приложение (`/signin`, `/dashboard`, `/any-app-section`).
2. Автоматически создать router (Express.js) для маршрутов проекта на Тильде (все страницы и адреса сохраняются).
3. Настроить автоматический апдейт при обновлении любой страницы на Тильде (→ вебхук → скачать проект заново).
4. Не терять функционал лендинга, требующий участия бэкенда Тильды (ЛК, оплата, формы, etc.)

# Установка
```
npm i tilda-sync
```

# Подготовка на стороне Tilda
1. Перейдите в настройки сайта, выберите вкладку «Экспорт»
2. Во вкладке API Integration сгенерируйте Публичный и Секретный ключи. При необходимости, укажите путь ссылки для Webhook'а, который будет уведомлять сервер об изменениях в проекте.
3. Вернитесь обратно во вкладку «Экспорт». Перейдите в «Специальные настройки экспорта».
4. Заполните все поля, устанавливающие пути для файлов: например, путь для изображений `/img`, путь для JS файлов `/js`, путь для CSS файлов `/css`.
5. «Путь ко всем страницам» должен быть настроен, если вы планируете, чтобы сайт был доступен по отличному от корневого пути сайта на Тильде. Например, сайта на Тильде `https://mysite.tilda.ws` вы планируете разместить по адресу `https://mysite.com/custom/`. В таком случае заполните поле так: `/custom`. Если вы планируете разместить проект по адресу `https://mysite.com/`, можете НЕ заполнять это поле, этот путь поддерживается по умолчанию.
6. Сохраните все настройки.

# Использование

> [!NOTE]
> Библиотека работает на базе Tilda API [(официальная документация)](https://help-ru.tilda.cc/api). Важно: допускается не более 150 запросов в час.

Инициализируйте клиент, указав ключи, полученные в кабинете Тильды
```
import TildaSync from 'tilda-sync';

const tildaSync = new TildaSync({
    publicKey: 'YOUR_PUBLIC_KEY',
	secretKey: 'YOUR_SECRET_KEY',
	debug: true, // опционально: вкл./выкл. сообщения в консоль
});
```

## Базовые запросы
Вы можете использовать все [задокументированные API-запросы](https://help-ru.tilda.cc/api)

Список доступных проектов
```
const projectsList = await tildaSync.getProjectsList()
```

Получить информацию о проекте (вкл. .htaccess)
```
const projectData = await tildaSync.getProjectExport('PROJECT_ID')
```

Получить список страниц в проекте
```
const projectPages = await tildaSync.getPagesList('PROJECT_ID')
```

Информация о странице (body html)
```
const page = await tildaSync.getPage('PAGE_ID')
```

Полная информация о странице (head, body html, header/footer)
```
const pageFull = await tildaSync.getPageFull('PAGE_ID')
```

Информация о странице для экспорта (body html, files)
```
const pageExport = await tildaSync.getPageExport('PAGE_ID')
```

Полная информация о странице для экспорта (head, body html, header/footer, files)
```
const pageFullExport = await tildaSync.getPageFullExport('PAGE_ID')
```

## Полный импорт проекта

### tildaSync.importProject(projectId, [folder], [routerFile])
Позволяет импортировать весь проект, сохранив в указанную папку все статичные файлы, а также создав JSON-файл с маршрутами проекта. Аргументы:

* `projectId` (String) — ID проекта на Тильде ('1234567')
* `folder` (String) — папка назначения импорта ('/my-project') *[по умолчанию: ID проекта]*
* `routerFile` (Object) — настройки импорта файла маршрутов (парсинг .htaccess файла в формате JSON) *[по умолчанию: { isEnabled: true, path: folder, filename: 'pages' + projectId + '.json'}]*
- `routerFile.isEnabled` (Boolean) — вкл./выкл. генерацию файла маршрутов *[по умолчанияю: true]*
- `routerFile.path` (String) — место сохранения файла *[по умолчанию: folder]*
- `routerFile.filename` (String) — название файла сохранения маршрутов проекта *[по умолчанию: 'pages' + projectId + '.json']*

Пример использования:
```
try {
    const importResult = await tildaSync.importProject('1234567', './../public/');
    console.log(importResult)
} catch (err) {
    console.log(err)
}
```

<details>
<summary>Алгоритм, который выполняется для полного импорта проекта</summary>
<ol>
<li>Получение информации о проекте, вкл. используемых файлов.</li>
<li>Разбор .htaccess проекта, геренация JSON-файла с маршрутами, который позже может быть использован для запуска сервера.</li>
<li>Получение списка всех страниц проекта.</li>
<li>Получение информации и импорт каждой страницы проекта.</li>
<li>Составление списка всех js-, css-, img- файлов проекта и каждой отдельной страницы, их скачивание (повторяющиеся файлы скачиваются только один раз).</li>
</ol>

> Обратите внимание, что js, css, img будут сохранены в подпапку, указанную в настройках экспорта  в кабинете Tilda. 

> Кол-во запросов к Tilda API при выполнении алгоритм: 2 запроса + 1 запрос * кол-во страниц проекта. Учитывайте, что максимальное кол-во обращений в час — 150.
</details>

## Полный импорт страницы
### tildaSync.importPage(pageId, [folder], [options])
Позволяет импортировать одну страницу проекта, сохранив в указанную папку все статичные файлы. Аргументы:

* `pageId` (String) — ID страницы на Тильде ('1234567')
* `folder` (String) — папка назначения импорта ('/my-project') *[по умолчанию: "imported_pages"]*
* `options` (Object) — дополнительные настройки *[по умолчанию: { downloadStatics: true }]*
- `options.downloadStatics` (Boolean) — вкл./выкл. скачивание static-файлов страницы *[по умолчанияю: true]*


Пример использования:
```
try {
    const pageImportResult = await tildaSync.importPage('2342345', './../your-folder');
    console.log(pageImportResult)
} catch (err) {
    console.log(err)
}
```

## Запуск проекта на Node.js + Express
Данный пакет позволяет осуществить запуск импортированного проекта. 

Разместите импортированные static-файлы (js, css, img) в папку для публичных файлов вашего проекта (обычно это `/public/` или `/static/`). [Как это делается на Express?](https://expressjs.com/ru/starter/static-files.html).

### TildaRouter(routingFile, options)
* routingFile (String) — путь к файлу маршрутов, иипортированному ранее с tildaSync.importProject (например, `pages1234567.json`)
* options (Object) — дополнительные настройки
* options.pathToHTMLs (String) — расположение импортированных файлов html
* options.pageIndex (String) — имя страницы, которая должны быть главной *[по умолчанию: по данным Тильды]*
* options.page404 (String) — имя страницы, отображаемой при ошибке 404 *[по умолчанию: по данным Тильды]*

Инициализируйте TildaRouter:
```
import { TildaRouter } from 'tilda-sync'

const tildaRouter = new TildaRouter('pagesPROJECT_ID.json', {
    pathToHTMLs: './public',
    pageIndex: 'mainpage', // опционально
    page404: 'not-found-error' // опционально
})
```

Теперь вы можете использовать контроллер для маршрутизации:

```
app.get('*', tildaRouter.controller)

// или 

router.get('*', tildaRouter.controller)
```

Если вы хотите, чтобы проект был доступен только по определенному маршруту (например, `/example/`), укажите его:
```
app.get('/example', tildaRouter.controller)
app.get('/example/*', tildaRouter.controller)

// или 

router.get('/example', tildaRouter.controller)
router.get('/example/*', tildaRouter.controller)
```

> [!IMPORTANT]
> В настройках Тильды укажите этот же путь в поле "Путь ко всем страницам сайта" для корректной работы ссылок.

### tildaRouter.updateRoutes()
В случае, если файл маршрутов был изменен, и вам необходимо обновить правила маршрутизации из файла, вызовите метод `updateRoutes` объекта `tildaRouter`:

```
tildaRouter.updateRoutes()
```

## Автоматическая синхронизация проекта
Вы также можете настроить автоматическую синхронизацию проекта с Тильдой. В случае опубликованных изменений в проекте, Тильда отправит уведомление, после чего можно запланировать новый импорт.

1. В настройках сайта в Тильде, укажите URL для webhook'а, на который будет отправлено уведомление (GET-запрос).
2. Настройте контроллер на соответствующий URL, который ответит Тильде `ok`.
3. Запустите импорт заново при получение webhook'a.
4. После завершения импорта, обновите маршруты (если используете TildaRouter).

Пример реализации:
```
app.get('/webhook/tilda-project-updated/', (req, res) => {
    res.send('ok')

    const { projectId, pageId, publicKey, published } = req.query

    // После ответа проверьте publicKey и запланируйте (!) импорт проекта.
    // Не стоит запускать импорт проекта каждый раз, когда получаете webhook.
    // Например, запланируйте импорт страницы tildaSync.importPage(pageId, './../your-folder')
    // или импорт всего проекта tildaSync.importProject(projectId, './../your-folder')
})
```

# Подписка на Tilda
Tilda API предполагает наличие платного тарифа не ниже Business. Импорт проекта на собственный сервер не освобождает вас от оплаты подписки. Некоторые функции обращаются к бэкенду Тильды (личный кабинет, заявки, потоки, каталог товаров и пр.), для их работы нужна оплаченная подписка. Кроме того, изучайте правила пользования Тильды ;)

# Написать автору
🫡 https://t.me/leshatour